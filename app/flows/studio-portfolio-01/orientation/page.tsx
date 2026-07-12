import { OnboardingScreen } from "@/app/onboarding-01/onboarding-screen"

// orientation's stateCoveragePlan is [default] only (selectionspec-studio-portfolio-01.json);
// no `?state=` switching is planned for this step.
export default function OrientationPage() {
  return <OnboardingScreen state="default" />
}
