import { useParams, useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { getClinicianById } from "@/data/store";
import { Lock, ArrowRight } from "lucide-react";

/**
 * CARE CONTRACT PAGE
 * Confirms to the patient that a care relationship has been created.
 * Makes the "contract" and lock behavior immediately obvious.
 */
export default function CareContract() {
  const { clinicianId } = useParams<{ clinicianId: string }>();
  const navigate = useNavigate();
  const clinician = clinicianId ? getClinicianById(clinicianId) : undefined;

  if (!clinician) {
    return (
      <PageShell title="Care Contract">
        <p>Clinician not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Care Relationship Started">
      <div className="max-w-lg mx-auto">
        {/* Contract Card */}
        <div className="bg-locked border-2 border-locked-border rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-locked-foreground" />
            <h2 className="text-lg sm:text-xl font-bold text-locked-foreground">
              Contract Active
            </h2>
          </div>
          <p className="text-locked-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            You have started a care relationship with{" "}
            <strong>{clinician.name}</strong>.
          </p>
          <ul className="text-xs sm:text-sm text-locked-foreground space-y-1 sm:space-y-2">
            <li>
              • <strong>{clinician.name}</strong> is now locked to your care
            </li>
            <li>• They cannot see your history yet</li>
            <li>• They must add clinical observations first</li>
            <li>• Only after contributing will they gain scoped access</li>
          </ul>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          This contract ensures clinicians contribute before they access. No
          contribution = no visibility.
        </p>

        <button
          onClick={() => navigate("/patient")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full justify-center text-sm sm:text-base"
        >
          Return to Dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </PageShell>
  );
}
