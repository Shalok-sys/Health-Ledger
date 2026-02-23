import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { useRole, getClinicianIdFromRole } from "@/context/RoleContext";
import {
  getActiveCareRelationship,
  getClinicianById,
  getPatientById,
  getVisibleHistoryForClinician,
  getObservationsByClinician,
  getCareRelationshipsByClinician,
} from "@/data/store";
import { Input } from "@/components/ui/input";
import {
  Lock, FileText, Plus, Clock, CheckCircle2, ShieldAlert,
  Users, Search, ChevronDown, ChevronUp, History, EyeOff,
} from "lucide-react";

export default function ClinicianDashboard() {
  const { activeRole, refreshKey } = useRole();
  const navigate = useNavigate();
  const clinicianId = getClinicianIdFromRole(activeRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  if (!clinicianId) {
    navigate("/");
    return null;
  }

  const clinician = getClinicianById(clinicianId);
  const relationships = getCareRelationshipsByClinician(clinicianId);
  const activeRelationship = getActiveCareRelationship(clinicianId);
  const ownObservations = getObservationsByClinician(clinicianId);

  const completedRelationships = relationships.filter((r) => r.status === "completed");
  const isLocked = !!activeRelationship;

  // Deduplicate by patientId — one entry per patient, tracking all their sessions
  const patientSessionMap = new Map<string, typeof completedRelationships>();
  for (const rel of completedRelationships) {
    if (!patientSessionMap.has(rel.patientId)) {
      patientSessionMap.set(rel.patientId, []);
    }
    patientSessionMap.get(rel.patientId)!.push(rel);
  }
  const uniquePatients = Array.from(patientSessionMap.entries()); // [patientId, sessions[]]

  // Filter by search query
  const filteredPatients = uniquePatients.filter(([patientId]) => {
    if (!searchQuery.trim()) return true;
    const patient = getPatientById(patientId);
    return patient?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleExpand = (patientId: string) => {
    setExpandedPatientId((prev) => (prev === patientId ? null : patientId));
  };

  return (
    <PageShell title="Clinician Dashboard">
      <div className="max-w-3xl">
        {/* ACTIVE CARE BANNER */}
        {activeRelationship && (() => {
          const patient = getPatientById(activeRelationship.patientId);
          return (
            <div className="bg-locked border-2 border-locked-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-locked-foreground" />
                <h2 className="text-xl font-bold text-locked-foreground">Active Care — Locked</h2>
              </div>
              <p className="text-locked-foreground mb-4">
                You are assigned to <strong>{patient?.name}</strong>. You must submit observations to complete this care relationship.
              </p>
              {!activeRelationship.observationsAdded && (
                <ul className="text-sm text-locked-foreground space-y-1 mb-5">
                  <li>• You <strong>cannot</strong> browse other patients</li>
                  <li>• You <strong>must</strong> add clinical observations first</li>
                  <li>• Care ends after you submit observations</li>
                </ul>
              )}
              <button
                onClick={() => navigate(`/clinician/add-observations/${activeRelationship.id}`)}
                className="inline-flex items-center gap-2 bg-warning text-warning-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity w-full justify-center"
              >
                <Plus className="h-5 w-5" />
                Add Patient Observations
              </button>
            </div>
          );
        })()}

        {/* NO ACTIVE CARE */}
        {!activeRelationship && relationships.length === 0 && (
          <div className="bg-secondary border rounded-lg p-8 text-center mb-8">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Patients Yet</h2>
            <p className="text-muted-foreground">
              You have no patient relationships. A patient must select you to start care.
            </p>
          </div>
        )}

        {!activeRelationship && relationships.length > 0 && (
          <div className="bg-accent border border-primary/20 rounded-lg p-5 mb-8 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              You are available for new patients. Waiting for a patient to request care.
            </p>
          </div>
        )}

        {/* MY PATIENTS SECTION */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Patients
            </h2>
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs text-locked-foreground bg-locked px-2 py-1 rounded">
                <Lock className="h-3 w-3" />
                Browsing Locked
              </span>
            )}
          </div>

          {/* Search — only visible when unlocked and has completed patients */}
          {!isLocked && uniquePatients.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {relationships.length === 0 ? (
            <p className="text-muted-foreground text-sm">No patients yet.</p>
          ) : (
            <div className="space-y-3">
              {/* Active relationship card */}
              {activeRelationship && (() => {
                const patient = getPatientById(activeRelationship.patientId);
                return (
                  <div className="bg-card border-2 border-locked-border rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{patient?.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Started: {new Date(activeRelationship.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-locked-foreground">
                        <Clock className="h-4 w-4" />
                        Active — Awaiting Observations
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* One card per unique patient, with all their sessions' observations */}
              {filteredPatients.map(([patientId, sessions]) => {
                const patient = getPatientById(patientId);
                // All observations across all sessions with this patient
                const allPatientObs = ownObservations.filter((o) => o.patientId === patientId);
                const isExpanded = expandedPatientId === patientId;
                // Most recent session for header date display
                const latestSession = sessions.sort(
                  (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                )[0];
                // For history, use the most recent completed session's relationship ID
                // so the cutoff is scoped to that session
                const visibleHistory = isExpanded
                  ? getVisibleHistoryForClinician(patientId, clinicianId, latestSession.id)
                  : [];

                return (
                  <div
                    key={patientId}
                    className={`bg-card border rounded-lg overflow-hidden transition-opacity ${isLocked ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Clickable header */}
                    <button
                      onClick={() => toggleExpand(patientId)}
                      disabled={isLocked}
                      className="w-full p-5 text-left hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{patient?.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Last care: {new Date(latestSession.startDate).toLocaleDateString()}
                            {sessions.length > 1 && ` · ${sessions.length} sessions`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">{allPatientObs.length} observation(s)</p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded: time-scoped patient history for most recent session */}
                    {isExpanded && (
                      <div className="border-t px-5 py-4 bg-secondary/30">
                        <div className="flex items-center gap-2 mb-3">
                          <History className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-semibold">
                            Patient History
                            <span className="text-xs font-normal text-muted-foreground ml-2">
                              (up to your last observation)
                            </span>
                          </h4>
                        </div>

                        {visibleHistory.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No history available.</p>
                        ) : (
                          <ul className="space-y-2">
                            {visibleHistory.map((entry, i) => (
                              <li key={i} className="text-sm bg-card border rounded p-3">
                                {entry}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <EyeOff className="h-3 w-3" />
                          <span>History after your observation is not visible</span>
                        </div>

                        {/* All observations across all sessions with this patient */}
                        {allPatientObs.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              Your Observations
                            </h4>
                            {allPatientObs.map((obs) => (
                              <div key={obs.id} className="bg-card border rounded p-3 mb-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  {new Date(obs.createdAt).toLocaleString()}
                                </p>
                                <div className="grid grid-cols-2 gap-1 text-sm">
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
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* No search results */}
              {!isLocked && searchQuery && filteredPatients.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No patients match "{searchQuery}".</p>
              )}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

