"use client"

import { useHydrated } from "../lib/use-hydrated"

// そのまま書くと収集されるので、逆順にして base64 にしたものを組み直す。
// 素朴な収集を外すだけで、本気の相手には効かない。
// JS が動かなければ、下の代替文がそのまま残る。
const ENCODED = "bW9jLmtvb2x0dW9AODAwMXVyYWhvbW90"

function MailIcon() {
  return (
    <span className="link__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </span>
  )
}

export function MailLink() {
  const hydrated = useHydrated()
  const address = hydrated ? [...atob(ENCODED)].reverse().join("") : ""

  if (!address) {
    return (
      <div className="link is-off" id="mail-link">
        <MailIcon />
        <span className="link__body">
          <span className="link__t">メール</span>
          <span className="link__v">
            JavaScript を有効にすると、アドレスが表示されます
          </span>
        </span>
      </div>
    )
  }

  return (
    <a className="link" href={`mailto:${address}`}>
      <MailIcon />
      <span className="link__body">
        <span className="link__t">メール</span>
        <span className="link__v">{address}</span>
      </span>
    </a>
  )
}
