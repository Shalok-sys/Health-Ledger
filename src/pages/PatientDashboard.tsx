import { useRole, getPatientIdFromRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import {
  getPatientById,
  getCareRelationshipsByPatient,
  getObservationsByPatient,
  getClinicianById,
} from "@/data/store";
import { FileText, Stethoscope, UserPlus, CheckCircle2, Clock } from "lucide-react";

export default function PatientDashboard() {
  const { activeRole, refreshKey } = useRole();
  const navigate = useNavigate();

  const patientId = getPatientIdFromRole(activeRole);
  if (!patientId) {
    navigate("/");
    return null;
  }

  const patient = getPatientById(patientId);
  const relationships = getCareRelationshipsByPatient(patientId);
  const observations = getObservationsByPatient(patientId);

  if (!patient) return null;

  const totalClinicians = relationships.length;
  const contributingClinicians = relationships.filter((r) => r.observationsAdded).length;
  const completeness = totalClinicians > 0 ? Math.round((contributingClinicians / totalClinicians) * 100) : 0;

  return (
    <PageShell title="Patient Dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">History Entries</p>
          </div>
          <p className="text-3xl font-bold">{patient.medicalHistory.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
          </div>
          <p className="text-3xl font-bold">{totalClinicians}</p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Insight Completeness</p>
          </div>
          <p className="text-3xl font-bold">{completeness}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {contributingClinicians}/{totalClinicians} clinicians have contributed
          </p>
        </div>
      </div>

      {/* Action: Select Clinician */}
      <div className="mb-10">
        <button
          onClick={() => navigate("/patient/select-clinician")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus className="h-5 w-5" />
          Start Care With a Clinician
        </button>
      </div>

      {/* Longitudinal History — includes clinician observations in real-time */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Your Clinical History</h2>
        <div className="space-y-3">
          {patient.medicalHistory.map((entry, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm">{entry}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinician Observations — with clinician attribution */}
      {observations.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Clinician Observations</h2>
          <div className="space-y-3">
            {observations.map((obs) => {
              const clinician = getClinicianById(obs.clinicianId);
              const rel = relationships.find((r) => r.id === obs.careRelationshipId);
              return (
                <div key={obs.id} className="bg-card border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">{clinician?.name}</p>
                      <p className="text-xs text-muted-foreground">{clinician?.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(obs.createdAt).toLocaleString()}
                      </p>
                      {rel && (
                        <span className={`inline-flex items-center gap-1 text-xs mt-1 ${
                          rel.status === "completed" ? "text-success" : "text-locked-foreground"
                        }`}>
                          {rel.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {rel.status === "completed" ? "Completed" : "Active"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Domain:</span> {obs.observationDomain}</div>
                    <div><span className="text-muted-foreground">Anatomy:</span> {obs.anatomicalContext}</div>
                    <div><span className="text-muted-foreground">Trigger:</span> {obs.triggerCondition}</div>
                    <div><span className="text-muted-foreground">Measure:</span> {obs.measurementType}</div>
                    <div><span className="text-muted-foreground">Confidence:</span> {obs.confidenceLevel}</div>
                  </div>
                  {obs.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{obs.notes}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
