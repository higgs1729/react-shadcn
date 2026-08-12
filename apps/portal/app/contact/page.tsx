import { SkeletonPage } from "@/components/skeleton-page"

export default function ContactPage() {
  return (
    <SkeletonPage activePath="contact" eyebrow="CONTACT" title="Contact">
      <div className="skeleton-copy">
        <p>制作物についての質問や、協力の相談があればお知らせください。</p>
        <p>連絡先の案内は準備中です。</p>
      </div>
    </SkeletonPage>
  )
}
