import type { ReactNode } from "react"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type SkeletonPageProps = {
  activePath: "works" | "about" | "contact" | "projects" | "activities"
  eyebrow: string
  title: string
  children?: ReactNode
}

const navItems = [
  { path: "works", label: "work" },
  { path: "about", label: "About Me" },
  { path: "contact", label: "Contact" },
] as const

export function SkeletonPage({
  activePath,
  eyebrow,
  title,
  children,
}: SkeletonPageProps) {
  return (
    <div className="skeleton-page">
      <style>{styles}</style>
      <header className="skeleton-header">
        <a className="skeleton-brand" href={`${basePath}/`}>
          higgs1729
        </a>
        <nav aria-label="サイト内ナビゲーション">
          {navItems.map((item) => (
            <a
              key={item.path}
              className={item.path === activePath ? "is-active" : undefined}
              href={`${basePath}/${item.path}/`}
              aria-current={item.path === activePath ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="skeleton-main">
        <p className="skeleton-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <section className="skeleton-content" aria-label="コンテンツ領域">
          {children}
        </section>
      </main>
    </div>
  )
}

const styles = `
.skeleton-page {
  min-height: 100svh;
  background: #f8f4f3;
  color: #070707;
  font-family: var(--font-sans, system-ui, sans-serif);
}
.skeleton-page *, .skeleton-page *::before, .skeleton-page *::after { box-sizing: border-box; }
.skeleton-page a { color: inherit; text-decoration: none; }
.skeleton-header {
  position: sticky;
  top: 0;
  z-index: 2;
  min-height: 3.375rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.7rem clamp(1rem, 6.77vw, 6.5rem);
  background: #030303;
  color: #fff;
}
.skeleton-brand { font-size: 1.15rem; font-weight: 720; letter-spacing: -0.02em; }
.skeleton-header nav { display: flex; flex-wrap: wrap; gap: clamp(0.85rem, 2.5vw, 2.5rem); margin-left: auto; font-size: 0.78rem; font-weight: 620; }
.skeleton-header nav a { color: #d6d6d6; }
.skeleton-header nav a:hover, .skeleton-header nav a.is-active { color: #fff; }
.skeleton-header nav a.is-active { text-decoration: underline; text-decoration-color: #ea4b17; text-underline-offset: 0.45rem; }
.skeleton-main { width: min(calc(100% - 2rem), 72rem); margin: 0 auto; padding: clamp(4rem, 10vw, 9rem) 0; }
.skeleton-eyebrow { margin: 0; color: #ea4b17; font-size: 0.78rem; font-weight: 760; letter-spacing: 0.055em; }
.skeleton-main h1 { margin: 1rem 0 0; font-size: clamp(2.4rem, 6vw, 5rem); line-height: 1.05; letter-spacing: -0.055em; }
.skeleton-content { min-height: 24rem; margin-top: clamp(3rem, 7vw, 6rem); padding: clamp(1.5rem, 4vw, 3rem); border: 1px solid #d8d2ce; background: rgba(255, 255, 255, 0.16); }
.skeleton-copy { max-width: 42rem; font-size: clamp(1rem, 1.8vw, 1.25rem); line-height: 1.9; }
.skeleton-copy p { margin: 0; }
.skeleton-copy p + p { margin-top: 1.5rem; }
.skeleton-page a:focus-visible { outline: 3px solid #2563eb; outline-offset: 4px; }
@media (max-width: 680px) {
  .skeleton-header { align-items: flex-start; flex-direction: column; gap: 0.55rem; }
  .skeleton-header nav { margin-left: 0; gap: 0.7rem; font-size: 0.68rem; }
}
`
