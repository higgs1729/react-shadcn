// 制作の手順(Method)の図と6段のカード(本人 2026-11-25「今の制作の流れに直し、図解で分かりやすく」)。
//
// 流れは動画の制作の道具の入口(実例をほどく → 設計を1枚に → 組み立て → 機械の確かめ → 見て納める
// → 記録して道具を直す)を、Web にも同じ形で当てはまる言葉で書いた。動画だけの話にしないのは、
// このページの作品が Web・アプリ・動画にまたがり、この LP 自体も同じ流れ(実例の計測 → 規律と
// トークン → 部品 → lint・型・e2e → main への反映で公開)で作っているため。
// 道具の名前は出さない。読む人(採用・依頼する人)に通じず、制作の仕組みは非公開と決めているため。
//
// 図は CSS 3D の斜めの床(CADENCE のリールの図 flow3d.tsx の「板を寝かせ、その上に節を立てる」)。
// 字は HTML のまま、動きは持たない(演出は座標系と重力場に隔離する規律。JS が無くても完成形)。
// 位置は globals.css の .mflow の節が持つ。ここは中身だけ。

type Step = {
  /** 床の上の箱の前の面に出す 2 字 */
  word: string
  title: string
  body: string
  video: string
  web: string
}

const steps: Step[] = [
  {
    word: "分解",
    title: "実例をほどく",
    body: "作る前に、優れた実例を数本選んでほどき、尺・動き・余白・字の大きさなど、効いている理由を測ります。",
    video: "参考動画のカメラの動きと、字幕の置き方を測る",
    web: "参考サイトの余白と字の組み、動きの秒数を測る",
  },
  {
    word: "設計",
    title: "設計を1枚にまとめる",
    body: "測った理由を、そのまま作れる設計図に書き出します。時間のかかる制作に入る前に、ここで一度確認をもらいます。",
    video: "台本と、カットごとの絵・声・字幕の台割",
    web: "配色・文字・余白の決まりと、画面の構成",
  },
  {
    word: "組立",
    title: "設計図から組み立てる",
    body: "部品を設計図から道具で組み立てます。直すときは設計図を直して組み直すので、一部を直しても全体の揃いが崩れません。",
    video: "自作の制作パイプラインで、声・絵・字幕・音を組む",
    web: "決まりから部品を作り、静的なサイトとして書き出す",
  },
  {
    word: "検査",
    title: "機械で確かめる",
    body: "毎回同じ物差しで、機械に確かめさせます。外れがあれば止まり、直るまで先へ進みません。",
    video: "音量、音と絵のずれ、字幕のはみ出し、台本との一字一句の照合",
    web: "構文と型の検査、操作の自動テスト、スマホと PC の表示",
  },
  {
    word: "納品",
    title: "目で見て納める",
    body: "最後は実物を見て判断し、版に名前を付けて納めます。送った版は残すので、見比べも戻しもすぐにできます。",
    video: "版ごとに保管して納品する",
    web: "反映すると検査を通ってから自動で公開される",
  },
  {
    word: "改善",
    title: "次の道具に残す",
    body: "足りなかった所・手戻り・かかった時間を毎回記録し、前の回と比べて、重い所から道具を直します。",
    video: "同じ種類の2本目は、1本目で整えた型から作る",
    web: "決まりを文書に残し、次のサイトの土台にする",
  },
]

/* 箱の上の面の線画。24 四方、線は currentColor */
const icons = [
  // 分解: 枠を虫眼鏡で見る
  <g key="study">
    <rect x="2.5" y="4.5" width="13" height="10" rx="1.5" />
    <path d="M5.5 11.5l2.5-3 2 2 2-2.5" />
    <circle cx="16" cy="15" r="4" />
    <path d="M19 18l3 3" />
  </g>,
  // 設計: 升目の台割
  <g key="design">
    <rect x="3" y="3.5" width="18" height="17" rx="1.5" />
    <path d="M3 9h18M3 14.5h18M9.5 3.5v17" />
  </g>,
  // 組立: 重ねた層
  <g key="build">
    <path d="M12 3.5l8.5 4.25L12 12 3.5 7.75z" />
    <path d="M3.5 12L12 16.25 20.5 12" />
    <path d="M3.5 16.25L12 20.5l8.5-4.25" />
  </g>,
  // 検査: 枠の中の印
  <g key="check">
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M7.5 12.5l3 3 6-7" />
  </g>,
  // 納品: 箱と送り出す矢印
  <g key="deliver">
    <path d="M3.5 9.5h12v10h-12z" />
    <path d="M3.5 9.5l2-4h8l2 4" />
    <path d="M14 4.5h6.5M17.5 1.5l3 3-3 3" />
  </g>,
  // 改善: 回る矢印と上向き
  <g key="improve">
    <path d="M19.5 9A8 8 0 1 0 20 13.5" />
    <path d="M20.5 4v5h-5" />
    <path d="M12 15.5v-6M9.5 12L12 9.5l2.5 2.5" />
  </g>,
]

export function MethodFlow() {
  return (
    <>
      <figure className="mflow">
        {/* 図は下のカードと同じ中身の要約なので、読み上げはカードに任せる */}
        <div className="mflow__scene" aria-hidden="true">
          <div className="mflow__floor">
            {/* 床に引いた線路。広い図(3列×2段)と狭い図(2列×3段)で別の形を持ち、CSS で片方だけ出す */}
            <svg className="mflow__track mflow__track--wide" viewBox="0 0 760 440">
              <path className="mflow__loop" d="M198 132 H583 A40 40 0 0 1 623 172 V277 A40 40 0 0 1 583 317 H198" />
              <path className="mflow__chev" d="M299 124l10 8-10 8M512 124l10 8-10 8M615 219l8 10 8-10M522 309l-10 8 10 8M309 309l-10 8 10 8" />
              <path className="mflow__return" d="M140 317 H70 A30 30 0 0 1 40 287 V162 A30 30 0 0 1 70 132 H136" />
              <path className="mflow__chev mflow__chev--accent" d="M128 123l10 9-10 9" />
              <text className="mflow__note" x="52" y="231">
                次の回へ
              </text>
            </svg>
            <svg className="mflow__track mflow__track--narrow" viewBox="0 0 640 1120">
              <path className="mflow__loop" d="M166 246 V889 A40 40 0 0 0 206 929 H434 A40 40 0 0 0 474 889 V246" />
              <path className="mflow__chev" d="M158 412l8 10 8-10M158 754l8 10 8-10M315 921l10 8-10 8M466 764l8-10 8 10M466 422l8-10 8 10" />
              <path className="mflow__return" d="M474 150 V90 A30 30 0 0 0 444 60 H196 A30 30 0 0 0 166 90 V146" />
              <path className="mflow__chev mflow__chev--accent" d="M157 136l9 10 9-10" />
              <text className="mflow__note" x="320" y="42" textAnchor="middle">
                次の回へ
              </text>
            </svg>

            {/* 設計の後の確かめ。床に立てた札 */}
            <div className="mflow__sign">
              <span>確認</span>
            </div>

            {steps.map((step, i) => (
              <div className={`mflow__st mflow__st--${i + 1}`} key={step.word}>
                <span className="mflow__side" />
                <span className="mflow__front">{step.word}</span>
                <span className="mflow__top">
                  <span className="mflow__n">{String(i + 1).padStart(2, "0")}</span>
                  <svg viewBox="0 0 24 24">{icons[i]}</svg>
                </span>
              </div>
            ))}
          </div>
        </div>
        <figcaption className="mflow__cap">
          <span className="mflow__fig">Fig. 1</span>
          6つの工程を一周するごとに、分かったことが次の回の道具に残る
        </figcaption>
      </figure>

      <ol className="cards">
        {steps.map((step, i) => (
          <li className="mcard" key={step.word}>
            <p className="mcard__n">
              {String(i + 1).padStart(2, "0")}
              <span className="mcard__w">{step.word}</span>
            </p>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <dl className="mcard__eg">
              <div>
                <dt>動画</dt>
                <dd>{step.video}</dd>
              </div>
              <div>
                <dt>Web</dt>
                <dd>{step.web}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </>
  )
}
