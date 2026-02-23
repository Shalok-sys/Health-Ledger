import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import {
  getClinicians,
  getCareRelationshipsByPatient,
  createCareRelationship,
  getPatientById,
} from "@/data/store";
import { useRole, getPatientIdFromRole } from "@/context/RoleContext";
import { Stethoscope, Plus, ShieldAlert, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SelectClinician() {
  const navigate = useNavigate();
  const { activeRole, triggerRefresh } = useRole();
  const [pendingClinicianId, setPendingClinicianId] = useState<string | null>(null);

  const patientId = getPatientIdFromRole(activeRole);
  if (!patientId) {
    navigate("/");
    return null;
  }

  const patient = getPatientById(patientId);
  const clinicians = getClinicians();
  const existingRelationships = getCareRelationshipsByPatient(patientId);
  const pendingClinician = pendingClinicianId ? clinicians.find((c) => c.id === pendingClinicianId) : null;

  function handleConfirmConsent() {
    if (!pendingClinicianId) return;
    createCareRelationship(patientId!, pendingClinicianId);
    triggerRefresh();
    setPendingClinicianId(null);
    navigate(`/patient/care-contract/${pendingClinicianId}`);
  }

  return (
    <PageShell title="Select a Clinician">
      <p className="text-muted-foreground mb-8 max-w-lg">
        Choosing a clinician starts a care relationship. They will be <strong>locked</strong> to your care
        and must contribute observations before they can access your history.
      </p>

      <div className="space-y-4">
        {clinicians.map((clinician) => {
          // Get all relationships with this clinician, sorted newest first
          const clinicianRels = existingRelationships
            .filter((r) => r.clinicianId === clinician.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
          const latestRel = clinicianRels[0];
          const hasActiveRel = latestRel?.status === "active";
          const hasCompletedRel = clinicianRels.some((r) => r.status === "completed");

          return (
            <div
              key={clinician.id}
              className="bg-card border rounded-lg p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-secondary">
                  <Stethoscope className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{clinician.name}</h3>
                  <p className="text-sm text-muted-foreground">{clinician.specialty}</p>
                </div>
              </div>

              {hasActiveRel ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-locked-foreground font-medium">
                  <Clock className="h-4 w-4" />
                  Care Active
                </span>
              ) : (
                <button
                  onClick={() => setPendingClinicianId(clinician.id)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  {hasCompletedRel ? "Start New Care" : "Start Care"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CONSENT DIALOG */}
      <AlertDialog open={!!pendingClinicianId} onOpenChange={(open) => !open && setPendingClinicianId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              Confirm History Sharing
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to share your clinical history with <strong className="text-foreground">{pendingClinician?.name}</strong>.
                </p>
                <ul className="text-sm space-y-1.5 list-disc pl-4">
                  <li>Your full history will be visible to this clinician once they contribute observations</li>
                  <li>The clinician will be locked to your care until they submit observations</li>
                  <li>This action cannot be undone — past access remains even after care ends</li>
                </ul>
                <p className="font-medium text-foreground">
                  Do you consent to sharing your history with {pendingClinician?.name}?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConsent}>
              I Consent — Start Care
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
