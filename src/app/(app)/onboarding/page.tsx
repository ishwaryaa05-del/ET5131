import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  const profile = user?.profile;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">
        {profile ? "Update your profile" : "Let's calibrate CareerBridge ASEAN for you"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Every feature — interview questions, dual-tongue coaching, resume tailoring, course
        matching — is tuned to these three settings. You can change them any time.
      </p>
      <div className="card mt-6 p-6">
        <ProfileForm
          initial={
            profile
              ? {
                  market: profile.market,
                  industry: profile.industry,
                  practiceLanguage: profile.practiceLanguage,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
