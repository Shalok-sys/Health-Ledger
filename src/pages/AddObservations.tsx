import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { useRole, getClinicianIdFromRole } from "@/context/RoleContext";
import {
  addObservation,
  getCareRelationships,
  getPatientById,
  getAuditHistoryForClinician,
} from "@/data/store";
import { Send, CheckCircle2, Clock, FileText } from "lucide-react";

const DOMAINS = [
  "Pain & Sensitisation",
  "Movement & Motor Control",
  "Tissue Integrity",
  "Functional Capacity",
  "Neurological",
];

const ANATOMICAL = [
  "Cervical Spine",
  "Thoracic Spine",
  "Lumbar Spine",
  "Shoulder Complex",
  "Elbow/Forearm",
  "Wrist/Hand",
  "Hip",
  "Knee",
  "Ankle/Foot",
];

const TRIGGERS = [
  "Weight-bearing",
  "End-range movement",
  "Sustained posture",
  "Repetitive motion",
  "Morning stiffness",
  "Activity escalation",
];

const MEASUREMENTS = [
  "Visual Analog Scale (VAS)",
  "Range of Motion (ROM)",
  "Strength Grade (Oxford)",
  "Functional Index Score",
  "Palpation Finding",
];

const CONFIDENCE = ["High", "Moderate", "Low", "Uncertain — needs follow-up"];

export default function AddObservations() {
  const { relationshipId } = useParams<{ relationshipId: string }>();
  const navigate = useNavigate();
  const { activeRole, triggerRefresh } = useRole();
  const clinicianId = getClinicianIdFromRole(activeRole);

  const [form, setForm] = useState({
    observationDomain: "",
    anatomicalContext: "",
    triggerCondition: "",
    measurementType: "",
    confidenceLevel: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!clinicianId || !relationshipId) {
    return (
      <PageShell title="Add Observations">
        <p>Invalid access.</p>
      </PageShell>
    );
  }

  const relationship = getCareRelationships().find(
    (r) => r.id === relationshipId,
  );
  if (!relationship) {
    return (
      <PageShell title="Add Observations">
        <p>Care relationship not found.</p>
      </PageShell>
    );
  }

  const patient = getPatientById(relationship.patientId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addObservation({
      careRelationshipId: relationshipId!,
      clinicianId: clinicianId!,
      patientId: relationship!.patientId,
      ...form,
    });
    triggerRefresh();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PageShell title="Observation Submitted">
        <div className="max-w-lg">
          <div className="bg-accent border border-primary/20 rounded-lg p-8 text-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Observation Recorded & Care Completed
            </h2>
            <p className="text-muted-foreground">
              Your observation has been added to the patient's history. This
              care relationship is now complete. The history is locked with your
              observation as the last entry.
            </p>
          </div>
          <button
            onClick={() => navigate("/clinician")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full justify-center"
          >
            Go to Dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  const isValid =
    form.observationDomain &&
    form.anatomicalContext &&
    form.triggerCondition &&
    form.measurementType &&
    form.confidenceLevel;

  return (
    <PageShell title="Add Clinical Observations">
      <div className="max-w-xl">
        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
          Review the patient's history below, then enter your structured
          observations. Submitting will complete the care relationship.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <SelectField
            label="Observation Domain"
            value={form.observationDomain}
            onChange={(v) => setForm({ ...form, observationDomain: v })}
            options={DOMAINS}
          />
          <SelectField
            label="Anatomical Context"
            value={form.anatomicalContext}
            onChange={(v) => setForm({ ...form, anatomicalContext: v })}
            options={ANATOMICAL}
          />
          <SelectField
            label="Trigger Condition"
            value={form.triggerCondition}
            onChange={(v) => setForm({ ...form, triggerCondition: v })}
            options={TRIGGERS}
          />
          <SelectField
            label="Measurement Type"
            value={form.measurementType}
            onChange={(v) => setForm({ ...form, measurementType: v })}
            options={MEASUREMENTS}
          />
          <SelectField
            label="Confidence Level"
            value={form.confidenceLevel}
            onChange={(v) => setForm({ ...form, confidenceLevel: v })}
            options={CONFIDENCE}
          />

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] sm:min-h-[100px]"
              placeholder="Optional clinical notes..."
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <Send className="h-4 w-4" />
            Submit Observation & Complete Care
          </button>
        </form>

        {/* PATIENT HISTORY — Clinician can audit before submitting */}
        <section className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Patient History — {patient?.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Audit the patient's history below. Your observation will be appended
            as the last entry upon submission.
          </p>
          {(() => {
            const auditHistory =
              clinicianId && relationship
                ? getAuditHistoryForClinician(
                    relationship.patientId,
                    clinicianId,
                  )
                : [];
            return auditHistory.length > 0 ? (
              <div className="space-y-2">
                {auditHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="bg-card border rounded-lg p-3 flex items-start gap-3"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{entry}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No history available.
              </p>
            );
          })()}
        </section>
      </div>
    </PageShell>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
