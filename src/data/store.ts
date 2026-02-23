// =============================================================
// DATA LAYER — Simulates JSON file-based storage via localStorage
// Every read re-parses from localStorage (like re-reading a JSON file)
// Every write is atomic: read → modify → write back
// =============================================================

export interface User {
  id: string;
  name: string;
  role: "patient" | "clinician";
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  medicalHistory: string[];
}

export interface Clinician {
  id: string;
  userId: string;
  name: string;
  specialty: string;
}

export interface CareRelationship {
  id: string;
  patientId: string;
  clinicianId: string;
  status: "active" | "completed";
  startDate: string;
  observationsAdded: boolean;
}

export interface Observation {
  id: string;
  careRelationshipId: string;
  clinicianId: string;
  patientId: string;
  observationDomain: string;
  anatomicalContext: string;
  triggerCondition: string;
  measurementType: string;
  confidenceLevel: string;
  notes: string;
  createdAt: string;
}

// ---- SEED DATA ----

const SEED_USERS: User[] = [
  { id: "user-patient-1", name: "Maria Santos", role: "patient" },
  { id: "user-patient-2", name: "João Oliveira", role: "patient" },
  { id: "user-clinician-a", name: "Dr. Elena Ruiz", role: "clinician" },
  { id: "user-clinician-b", name: "Dr. Carlos Méndez", role: "clinician" },
];

const SEED_PATIENTS: Patient[] = [
  {
    id: "patient-1",
    userId: "user-patient-1",
    name: "Maria Santos",
    dateOfBirth: "1985-03-14",
    medicalHistory: [
      "2023-01-15: Initial assessment — mild lower back discomfort reported",
      "2023-04-22: Follow-up — improved ROM after 8 sessions",
      "2023-09-10: New episode — right shoulder impingement symptoms",
      "2024-01-08: Reassessment — shoulder stable, back recurring",
      "2024-06-20: Functional screening — moderate limitations in overhead tasks",
    ],
  },
  {
    id: "patient-2",
    userId: "user-patient-2",
    name: "João Oliveira",
    dateOfBirth: "1990-07-22",
    medicalHistory: [
      "2023-03-05: Initial assessment — recurring knee pain after running",
      "2023-06-14: Follow-up — patellofemoral syndrome confirmed",
      "2023-11-02: Progress review — improved with strengthening protocol",
      "2024-02-18: New complaint — Achilles tendon stiffness bilateral",
      "2024-08-10: Reassessment — cleared for return to sport with monitoring",
    ],
  },
];

const SEED_CLINICIANS: Clinician[] = [
  { id: "clinician-a", userId: "user-clinician-a", name: "Dr. Elena Ruiz", specialty: "Musculoskeletal Physiotherapy" },
  { id: "clinician-b", userId: "user-clinician-b", name: "Dr. Carlos Méndez", specialty: "Sports Rehabilitation" },
];

const SEED_CARE_RELATIONSHIPS: CareRelationship[] = [];
const SEED_OBSERVATIONS: Observation[] = [];

// ---- STORAGE KEYS ----

const KEYS = {
  users: "physio_users",
  patients: "physio_patients",
  clinicians: "physio_clinicians",
  careRelationships: "physio_careRelationships",
  observations: "physio_observations",
  initialized: "physio_initialized",
} as const;

// ---- INITIALIZATION ----

export function initializeData(): void {
  if (localStorage.getItem(KEYS.initialized)) return;
  localStorage.setItem(KEYS.users, JSON.stringify(SEED_USERS));
  localStorage.setItem(KEYS.patients, JSON.stringify(SEED_PATIENTS));
  localStorage.setItem(KEYS.clinicians, JSON.stringify(SEED_CLINICIANS));
  localStorage.setItem(KEYS.careRelationships, JSON.stringify(SEED_CARE_RELATIONSHIPS));
  localStorage.setItem(KEYS.observations, JSON.stringify(SEED_OBSERVATIONS));
  localStorage.setItem(KEYS.initialized, "true");
}

export function resetData(): void {
  localStorage.removeItem(KEYS.initialized);
  initializeData();
}

// ---- ATOMIC READ HELPERS (re-read from "file" every time) ----

function readJSON<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  return JSON.parse(raw) as T[];
}

function writeJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- CRUD OPERATIONS ----

// Users
export function getUsers(): User[] {
  return readJSON<User>(KEYS.users);
}

// Patients
export function getPatients(): Patient[] {
  return readJSON<Patient>(KEYS.patients);
}

export function getPatientById(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

// Clinicians
export function getClinicians(): Clinician[] {
  return readJSON<Clinician>(KEYS.clinicians);
}

export function getClinicianById(id: string): Clinician | undefined {
  return getClinicians().find((c) => c.id === id);
}

// Care Relationships
export function getCareRelationships(): CareRelationship[] {
  return readJSON<CareRelationship>(KEYS.careRelationships);
}

export function getCareRelationshipsByPatient(patientId: string): CareRelationship[] {
  return getCareRelationships().filter((cr) => cr.patientId === patientId);
}

export function getCareRelationshipsByClinician(clinicianId: string): CareRelationship[] {
  return getCareRelationships().filter((cr) => cr.clinicianId === clinicianId);
}

export function getActiveCareRelationship(clinicianId: string): CareRelationship | undefined {
  return getCareRelationships().find(
    (cr) => cr.clinicianId === clinicianId && cr.status === "active"
  );
}

/**
 * INCENTIVE ENFORCEMENT:
 * Creating a care relationship immediately locks the clinician.
 * The clinician cannot do anything else until they contribute observations.
 */
export function createCareRelationship(patientId: string, clinicianId: string): CareRelationship {
  const relationships = getCareRelationships();
  const newRelationship: CareRelationship = {
    id: `cr-${Date.now()}`,
    patientId,
    clinicianId,
    status: "active",
    startDate: new Date().toISOString(),
    observationsAdded: false,
  };
  relationships.push(newRelationship);
  writeJSON(KEYS.careRelationships, relationships);
  return newRelationship;
}

// Observations
export function getObservations(): Observation[] {
  return readJSON<Observation>(KEYS.observations);
}

export function getObservationsByPatient(patientId: string): Observation[] {
  return getObservations().filter((o) => o.patientId === patientId);
}

export function getObservationsByClinician(clinicianId: string): Observation[] {
  return getObservations().filter((o) => o.clinicianId === clinicianId);
}

export function getObservationsByRelationship(careRelationshipId: string): Observation[] {
  return getObservations().filter((o) => o.careRelationshipId === careRelationshipId);
}

/**
 * INCENTIVE ENFORCEMENT:
 * Adding an observation unlocks the clinician's dashboard.
 * After this, the clinician can see patient history up to care start date.
 */
export function addObservation(observation: Omit<Observation, "id" | "createdAt">): Observation {
  // Step 1: Write the observation
  const observations = getObservations();
  const newObservation: Observation = {
    ...observation,
    id: `obs-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  observations.push(newObservation);
  writeJSON(KEYS.observations, observations);

  // Step 2: Add observation summary to patient's medical history (real-time)
  const patients = getPatients();
  const pIdx = patients.findIndex((p) => p.id === observation.patientId);
  if (pIdx !== -1) {
    const clinician = getClinicianById(observation.clinicianId);
    const dateStr = new Date().toISOString();
    const summary = `${dateStr}: [${clinician?.name ?? "Clinician"}] ${observation.observationDomain} — ${observation.anatomicalContext}, ${observation.triggerCondition} (${observation.confidenceLevel})`;
    patients[pIdx].medicalHistory.push(summary);
    writeJSON(KEYS.patients, patients);
  }

  // Step 3: Mark relationship as observations added AND completed (care ends)
  const relationships = getCareRelationships();
  const idx = relationships.findIndex((cr) => cr.id === observation.careRelationshipId);
  if (idx !== -1) {
    relationships[idx].observationsAdded = true;
    relationships[idx].status = "completed";
    writeJSON(KEYS.careRelationships, relationships);
  }

  return newObservation;
}

/**
 * Returns the name of the clinician who authored a history entry, if any.
 * Observation entries are formatted as: "YYYY-MM-DD: [Clinician Name] ..."
 */
function extractObservationAuthor(entry: string): string | null {
  const match = entry.match(/^\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z)?: \[(.+?)\]/);
  return match ? match[1] : null;
}

/**
 * Get patient history visible to a clinician for a SPECIFIC completed care relationship.
 * RULES:
 *   1. Only entries dated on or before the observation submitted in THAT relationship are shown.
 *      This ensures each session's visibility is isolated — a new session by the same or
 *      another clinician does NOT expand what this clinician saw during their session.
 *   2. Observation entries authored by OTHER clinicians have their name stripped.
 *      Clinicians must not see each other's attributions.
 *      Entries with no author attribution (original medical history) are always shown.
 */
export function getVisibleHistoryForClinician(
  patientId: string,
  clinicianId: string,
  careRelationshipId: string
): string[] {
  const patient = getPatientById(patientId);
  if (!patient) return [];

  const clinician = getClinicianById(clinicianId);
  const clinicianName = clinician?.name ?? null;

  // Scope visibility to the SPECIFIC relationship passed in
  const relationship = getCareRelationships().find(
    (cr) => cr.id === careRelationshipId && cr.clinicianId === clinicianId && cr.observationsAdded
  );
  if (!relationship) return []; // No contribution for this session = no access

  // Cut off at the last observation submitted within THIS relationship only
  const relObservations = getObservationsByRelationship(careRelationshipId);
  if (relObservations.length === 0) return [];

  const lastObsDate = new Date(
    Math.max(...relObservations.map((o) => new Date(o.createdAt).getTime()))
  );

  return patient.medicalHistory
    .filter((entry) => {
      // Date-scoping — only show entries up to the observation date of THIS session
      // Matches both "YYYY-MM-DD" (seed data) and full ISO "YYYY-MM-DDTHH:MM:SS.sssZ" (observations)
      const dateMatch = entry.match(/^(\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z)?)/);
      if (!dateMatch) return false;
      const entryDate = new Date(dateMatch[1]);
      if (entryDate > lastObsDate) return false;
      return true;
    })
    .map((entry) => {
      // Strip name from entries authored by OTHER clinicians, keep the clinical data
      const author = extractObservationAuthor(entry);
      if (author !== null && author !== clinicianName) {
        return entry.replace(/: \[.+?\] /, ": ");
      }
      return entry;
    });
}

/**
 * Get patient history visible during an active care session (for auditing before submitting).
 * RULE: The current clinician sees the full current history.
 * Observation entries from OTHER clinicians have their name stripped to preserve privacy.
 * Only raw history entries (no author) and the current clinician's own entries show the author.
 */

/**
 * Get patient history visible during an active care session (for auditing before submitting).
 * RULE: The current clinician sees the full prior history BUT observation entries
 * from OTHER clinicians are hidden to preserve professional privacy.
 * Only raw history entries (no author) and the current clinician's own entries are shown.
 */
export function getAuditHistoryForClinician(
  patientId: string,
  clinicianId: string
): string[] {
  const patient = getPatientById(patientId);
  if (!patient) return [];

  const clinician = getClinicianById(clinicianId);
  const clinicianName = clinician?.name ?? null;

  return patient.medicalHistory.map((entry) => {
    // Strip attribution from entries authored by OTHER clinicians, but keep the entry
    const author = extractObservationAuthor(entry);
    if (author !== null && author !== clinicianName) {
      return entry.replace(/: \[.+?\] /, ": ");
    }
    return entry;
  });
}
