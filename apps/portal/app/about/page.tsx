import { SkeletonPage } from "@/components/skeleton-page"

export default function AboutPage() {
  return (
    <SkeletonPage activePath="about" eyebrow="ABOUT ME" title="About Me">
      <div className="skeleton-copy">
        <p>
          higgs1729 は、ウェブアプリケーションの設計と実装を通して、
          使う人の学びや仕事を少し軽くする制作を続けています。
        </p>
        <p>
          アイデアを小さく試し、観察し、改善する。その過程も含めて、
          このサイトに記録しています。
        </p>
      </div>
    </SkeletonPage>
  )
}
