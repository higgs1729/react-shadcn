"use client"

import { useEffect, useState } from "react"

const sections = [
  { id: "works", label: "work" },
  { id: "aboutme", label: "About Me" },
  { id: "contact", label: "Contact" },
] as const

export function HubHeader() {
  const [activeSection, setActiveSection] = useState("works")

  useEffect(() => {
    const observedSections = sections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visibleSection) setActiveSection(visibleSection.target.id)
      },
      // Keep enough of the viewport in the observation area for the final
      // section to become active before the document reaches its scroll end.
      { rootMargin: "-20% 0px -20%", threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    observedSections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="portal-header">
      <a className="portal-brand" href="#portal-top">
        higgs1729
      </a>
      <nav className="portal-nav" aria-label="サイト内ナビゲーション">
        {sections.map((section) => (
          <a
            className={activeSection === section.id ? "is-active" : undefined}
            href={`#${section.id}`}
            key={section.id}
            aria-current={activeSection === section.id ? "location" : undefined}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
