/// <reference types="@cloudflare/workers-types" />
import { DurableObject } from "cloudflare:workers"

// 回数と金額の上限を 1 か所で数える。Durable Object は 1 つ(名前 "global")だけ使うので、
// 同時の呼び出しも直列に処理され、上限をすり抜けない(Rate Limiting binding は地域ごとの近似なので使わない)。

export type GuardLimits = {
  ipPer10Min: number
  ipPerDay: number
  dailyMaxRequests: number
  dailyBudgetUsd: number
  reserveUsd: number
}

export type Admission =
  | { ok: true; day: string; paidAllowed: boolean; reservedUsd: number }
  | { ok: false; reason: "ip_burst" | "ip_day" | "global_day"; retryAfterSec: number }

type IpRecord = { count: number; recent: number[] }
type DayRecord = { requests: number; spentUsd: number; reservedUsd: number; paidCalls: number }

const TEN_MIN = 10 * 60 * 1000

/** 日の切り替えは日本時間の 0 時。 */
export function jstDay(now: number): string {
  return new Date(now + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

function secondsToJstMidnight(now: number): number {
  const jst = now + 9 * 3600 * 1000
  const next = Math.floor(jst / 86400000 + 1) * 86400000
  return Math.ceil((next - jst) / 1000)
}

export class Guard extends DurableObject {
  async admit(ipHash: string, limits: GuardLimits): Promise<Admission> {
    const now = Date.now()
    const day = jstDay(now)
    await this.dropOldDays(day)

    const dayKey = `d:${day}:total`
    const ipKey = `d:${day}:ip:${ipHash}`
    const total = (await this.ctx.storage.get<DayRecord>(dayKey)) ?? {
      requests: 0,
      spentUsd: 0,
      reservedUsd: 0,
      paidCalls: 0,
    }
    const ip = (await this.ctx.storage.get<IpRecord>(ipKey)) ?? { count: 0, recent: [] }
    ip.recent = ip.recent.filter((t) => now - t < TEN_MIN)

    if (total.requests >= limits.dailyMaxRequests) {
      return { ok: false, reason: "global_day", retryAfterSec: secondsToJstMidnight(now) }
    }
    if (ip.count >= limits.ipPerDay) {
      return { ok: false, reason: "ip_day", retryAfterSec: secondsToJstMidnight(now) }
    }
    if (ip.recent.length >= limits.ipPer10Min) {
      const oldest = Math.min(...ip.recent)
      return { ok: false, reason: "ip_burst", retryAfterSec: Math.ceil((oldest + TEN_MIN - now) / 1000) }
    }

    // 有料のモデルは、今日の使用額+使用中の見積もり+この回の見積もりが上限に収まるときだけ使う。
    // 収まらなければ無料のモデルだけで答える(有料の呼び出しはそこで止まる)。
    const paidAllowed =
      limits.dailyBudgetUsd > 0 &&
      total.spentUsd + total.reservedUsd + limits.reserveUsd <= limits.dailyBudgetUsd
    const reservedUsd = paidAllowed ? limits.reserveUsd : 0

    ip.count += 1
    ip.recent.push(now)
    total.requests += 1
    total.reservedUsd += reservedUsd
    await this.ctx.storage.put({ [dayKey]: total, [ipKey]: ip })
    return { ok: true, day, paidAllowed, reservedUsd }
  }

  /** 回が終わったら見積もりを外し、実際の額を足す。 */
  async settle(day: string, reservedUsd: number, actualUsd: number): Promise<DayRecord> {
    const dayKey = `d:${day}:total`
    const total = (await this.ctx.storage.get<DayRecord>(dayKey)) ?? {
      requests: 0,
      spentUsd: 0,
      reservedUsd: 0,
      paidCalls: 0,
    }
    total.reservedUsd = Math.max(0, total.reservedUsd - reservedUsd)
    total.spentUsd += actualUsd
    if (actualUsd > 0) total.paidCalls += 1
    await this.ctx.storage.put(dayKey, total)
    return total
  }

  async status(): Promise<DayRecord & { day: string }> {
    const day = jstDay(Date.now())
    const total = (await this.ctx.storage.get<DayRecord>(`d:${day}:total`)) ?? {
      requests: 0,
      spentUsd: 0,
      reservedUsd: 0,
      paidCalls: 0,
    }
    return { day, ...total }
  }

  private async dropOldDays(day: string) {
    const last = await this.ctx.storage.get<string>("lastDay")
    if (last === day) return
    if (last) {
      const old = await this.ctx.storage.list({ prefix: `d:${last}:` })
      const keys = [...old.keys()]
      for (let i = 0; i < keys.length; i += 128) {
        await this.ctx.storage.delete(keys.slice(i, i + 128))
      }
    }
    await this.ctx.storage.put("lastDay", day)
  }
}
