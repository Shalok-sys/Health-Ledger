# Patient-Controlled Clinical History with Built-In Incentives

## Overview

**Health Ledger** is a behavior-first prototype that demonstrates a new model for physiotherapy patient care coordination. Instead of asking clinicians to share data with competitors, the system gives patients ownership of their clinical history and makes contribution the only way for clinicians to gain visibility.

This is a **proof-of-concept frontend application** built with React, Vite, and TypeScript to visualize and test the incentive model. It uses browser-based data storage (localStorage) to simulate a multi-user system with two patients and two clinicians.

---

## The Problem We're Solving

**Current Healthcare Fragmentation:**

- Physiotherapy patients see multiple clinicians across locations and specialties
- Each clinic treats the patient as a "first-time patient" despite prior treatment
- Clinics want access to prior clinical history, but most clinics are unwilling to share theirs
- The barrier isn't policy—it's rational incentive failure: sharing feels like helping competitors and inviting judgment

**The Status Quo is Broken:**

- Patients repeat their history at every new clinic
- Clinicians lack context, leading to slower intake and uncertain care decisions
- Time wasted on re-assessment instead of treatment
- No continuity of care across the patient's journey

---

## Our Solution: Incentive-Driven Openness

### The Core Insight

We stop asking clinics to share with each other.

Instead, we give **patients** ownership of their clinical history and make **contribution the only way for clinicians to gain visibility**.

### The System Architecture

We built a **patient-controlled clinical graph**:

1. **Clinician Contribution**
   - After each visit, clinicians record structured, non-diagnostic observations
   - Observations capture functional data: movement limitations, pain response, stability, functional capacity
   - Data is standardized, modular, anonymized, and time-stamped
   - Observations are added to the patient's longitudinal health graph

2. **Patient Control**
   - Patients decide which clinician can access their history
   - Patients can see exactly who has access and when
   - For every care, the patient's current history is shared with a clinician
   - All data remains under patient ownership

3. **Clinician Access Rules**
   - Clinicians can only see:
     - History of the patient till their last observation.
     - Observations they themselves contributed.
   - When the care relationship ends, access freezes
   - Clinicians never see future data from other providers
   - Other clinicians' names are stripped from history entries (privacy)

---

## System Features & Behavior

### For Patients

**Patient Dashboard** (`/patient`):

- View your full clinical history (all prior assessments and observations)
- See a list of your clinicians and care relationships
- Monitor "Insight Completeness"—the % of clinicians who have contributed structured observations
- Start new care relationships with clinicians

**Managing Care**:

1. Click "Start Care With a Clinician" to select a clinician
2. Confirm sharing of your history in an explicit consent dialog
3. The clinician becomes "locked" to your care until they contribute observations
4. Once they submit observations, the care relationship completes and becomes read-only
5. You can start new care with the same or different clinicians

**Viewing Your Data**:

- Access all clinical history entries (seed data + clinician observations)
- See the progression of your condition over time
- Understand how clinician contributions enrich your self-knowledge
- Track which clinicians have contributed (incentive visibility)

### For Clinicians

**Clinician Dashboard** (`/clinician`):

- View all completed care relationships (historical patients)
- Search for past patients by name
- Expand patient cards to see the history visible to you from that care session
- See your own observations attributed to you
- Other clinicians' names are anonymized (no competitive leakage)
- If you have an active care relationship, a "locked" banner appears

**Active Care Workflow** (The Incentive Loop):

1. Patient selects you → you are "locked" to active care
2. You **cannot** browse other patients until you submit observations
3. You must visit `/clinician/add-observations/{relationshipId}`
4. You can audit the patient's full prior history before submitting
5. You fill out a structured observation form:
   - Observation Domain (Pain, Movement, Tissue, Function, Neuro)
   - Anatomical Context (Cervical, Thoracic, Lumbar, Shoulder, etc.)
   - Trigger Condition (Weight-bearing, End-range, Posture, etc.)
   - Measurement Type (VAS, ROM, Strength, Functional Index, etc.)
   - Confidence Level (High, Moderate, Low, Uncertain)
   - Optional clinical notes
6. Submit observations → care relationship completes
7. You unlock and can now browse completed relationships and see your contributions
8. **Benefit**: You immediately gain access to prior history from your contribution
9. **Payoff**: Better context for future patients, higher patient trust, stronger retention

---

## How the Incentive Model Works

### Why Clinicians Participate (Selfish & Rational)

**No Competitive Leakage:**

- You never see what competitor clinicians do after a patient leaves your care
- Past visibility is frozen—zero risk of enabling patient switching or competitive judgment
- Your own observations stay attributed to you; competitors' observations are anonymized

**Immediate Access Benefit:**

- Contributing observations unlocks the patient's full prior history
- You get immediate context on functional trends
- Reduces intake time and diagnostic uncertainty
- You see only what was visible up to YOUR session date (scope isolation)

**Better Care Quality:**

- Rich context leads to better clinical decisions
- Patients feel more confident and informed
- Better retention through perceived continuity
- Payoff is direct: better care → patient loyalty, even if they later move on

**Rational Choice:**

- **Choosing NOT to participate** means slower intake, less context, lower perceived care quality
- Contributing is the only path to efficiency and trust
- Participation is incentivized, not mandated

### Why Patients Participate (Clear & Immediate)

**Ownership & Transparency:**

- You always know who can see your data
- You can revoke access at any time (future relationships only)
- Full visibility into the care relationship lifecycle

**Actionable Insight:**

- The more clinicians contribute, the richer your dashboard becomes
- You see recovery trajectories, progress confidence, intervention outcomes
- Your health story becomes clearer the more it's documented

**Continuity of Care:**

- No more repeating your history
- Each new clinician starts informed
- Reduces re-assessment burden
- Stronger confidence in treatment

**Direct Value:**

- Sharing data directly improves what you understand about your own health
- Clinicians who can access your history provide better, faster care
- You control the feedback loop

---

## Testing the System

### Scenario 1: Patient Initiating Care (Maria Santos)

**Setup:**

- Log in as **Patient A — Maria Santos**
- Visit the Patient Dashboard

**Expected Behavior:**

- See her medical history (5 seed entries dating back to 2023)
- See "History Entries: 5"
- See "Total Appointments: 0" (no active clinicians yet)
- See "Insight Completeness: 0%" (no contributions yet)

**Test Steps:**

1. Click "Start Care With a Clinician"
2. Select "Clinician A — Dr. Elena Ruiz"
3. Confirm history sharing in the consent dialog
4. You should be redirected to Care Contract page
5. Return to Patient Dashboard
6. Now "Total Appointments: 1"
7. Still "Insight Completeness: 0%" (no observations yet)

**Expected Outcome:**

- Care relationship is created but "locked" on the clinician's end
- Patient has shared access but clinician cannot see history yet

---

### Scenario 2: Clinician Locked, Adding Observations

**Setup:**

- Switch role to **Clinician A — Dr. Elena Ruiz**
- Visit the Clinician Dashboard

**Expected Behavior:**

- See "Active Care — Locked" banner
- Patient name is "Maria Santos"
- Instructions: "You cannot browse other patients. You must add clinical observations first."
- Button: "Add Patient Observations"
- Cannot expand/browse completed patient relationships (locked state)

**Test Steps:**

1. Click "Add Patient Observations"
2. You are redirected to Add Observations form
3. See patient history section (Maria's 5 seed entries visible)
4. Fill out the form:
   - Observation Domain: "Movement & Motor Control"
   - Anatomical Context: "Lumbar Spine"
   - Trigger Condition: "Weight-bearing"
   - Measurement Type: "Range of Motion (ROM)"
   - Confidence Level: "High"
   - Notes: "Patient demonstrates good stability during flexion. ROM improved."
5. Click "Submit Observation & Complete Care"

**Expected Outcome:**

- Success page: "Observation Recorded & Care Completed"
- Care relationship is now "completed"
- Clinician is unlocked (can now browse other patients)

---

### Scenario 3: Patient Sees Clinician Contribution

**Setup:**

- Switch back to **Patient A — Maria Santos**
- Refresh Patient Dashboard

**Expected Behavior:**

- Medical history now shows 6 entries (5 seed + 1 new observation)
- The new entry is formatted: `[ISO timestamp]: [Clinician A] Movement & Motor Control — Lumbar Spine...`
- "Total Appointments: 1"
- "Insight Completeness: 100%" (1 clinician contributed, 1 of 1 = 100%)
- Under "Clinician Observations" section, see the new entry with Dr. Elena's name

**Expected Outcome:**

- Patient immediately sees the contribution
- Clinician attribution is clear (transparency)
- Completeness metric updated in real-time

---

### Scenario 4: Clinician Viewing Completed Relationship

**Setup:**

- Stay as **Clinician A — Dr. Elena Ruiz**
- Clinician Dashboard should now show "No active care" (unlocked)

**Expected Behavior:**

- "Active Care — Locked" banner is gone
- Completed patient relationships are now browsable
- Search for "Maria Santos"
- Click to expand her relationship

**Test Steps:**

1. Expand Maria's card
2. See a list of sessions with her (1 session: the one you just completed)
3. Click on the session to see visible history

**Expected Outcome:**

- See 6 history entries (up to the observation you submitted)
- Your observation shows your name (Dr. Elena Ruiz)
- Seed data shows (no author attribution)
- You see the scoped history—exactly what was available at YOUR session time

---

### Scenario 5: Competitive Privacy — Second Clinician

**Setup:**

- Switch to **Clinician B — Dr. Carlos Méndez**
- Visit Clinician Dashboard

**Expected Behavior:**

- No active care (clinician has never treated Maria)
- No completed relationships with Maria in history

**Test Steps:**

1. Go back to Maria's Patient Dashboard
2. Start new care with "Clinician B — Dr. Carlos Méndez"
3. Confirm consent
4. Switch to Clinician B
5. See "Active Care — Locked" banner
6. Add observations for a different domain (e.g., "Tissue Integrity")
7. Submit observations

**Expected Outcome:**

- Two clinicians have now contributed
- Maria's "Insight Completeness: 100%" (2 of 2 clinicians contributed)
- Clinician A and B have DIFFERENT visible histories
- When Clinician A looks back at their completed relationship, they see history up to THEIR submission date
- Clinician A CANNOT see what Clinician B observed (privacy enforcement)
- Clinician B CANNOT see Clinician A's name on her prior observations (anonymization)

---

### Scenario 6: Role Switching & Data Consistency

**Setup:**

- Use the Role Selection page (`/`) to switch between all four roles

**Expected Behavior:**

- Data persists across role switches (stored in localStorage)
- Each role sees only their authorized data
- Switching roles immediately updates visible information
- "Reset All Data" button resets to seed state

**Test Steps:**

1. Start as Maria, create care with Clinician A
2. Switch to Clinician A, add observations
3. Switch back to Maria, verify observation appears
4. Switch to Clinician B, start care with Maria
5. Add observations as Clinician B
6. Switch between all four roles—verify each sees correct data
7. Click "Reset All Data"
8. All relationships and observations deleted
9. Back to seed state

**Expected Outcome:**

- Data consistency across role switches
- No data leakage (patient data not visible to clinicians who shouldn't have access)
- Reset works cleanly

---

### Scenario 7: Multi-Patient Setup (João Oliveira)

**Setup:**

- Switch to **Patient B — João Oliveira**

**Expected Behavior:**

- Different medical history (5 entries about knee and ankle issues)
- Empty care relationships
- No observations yet

**Test Steps:**

1. Start care with Clinician A
2. Switch to Clinician A
3. Two active care situations should be impossible—only ONE can be active at a time
4. Add observations for Maria first (if still active)
5. Once Maria's care completes, Clinician A can now start care with João
6. Add observations for João
7. Switch to Clinician B
8. Start care with João (same patient, different clinician)
9. Add observations
10. Switch back to João's dashboard

**Expected Outcome:**

- João sees contributions from both clinicians
- "Insight Completeness: 100%"
- Clinician A and B see different scoped histories
- System correctly manages multiple patient-clinician relationships

---

## What to Expect: Behavioral Patterns

### For Patients

- **Initial state**: Privacy, full control, no clinician data
- **After clinician contribution**: Rich history, transparency, actionable insights
- **Multiple clinicians**: Richer longitudinal view, higher confidence in care

### For Clinicians

- **Before contribution**: Locked state, can't browse
- **After contribution**: Unlocked, can browse past relationships, see scoped history
- **Competitive safety**: Cannot see competitor observations, past access frozen
- **Incentive clarity**: Contribution = unlock + access

### Incentive Loop Verification

- ✅ Clinician cannot bypass (locked state enforced)
- ✅ Patient benefits immediately (sees contributions in real-time)
- ✅ Clinician benefits immediately (access granted after submission)
- ✅ Privacy enforced (scoped history, anonymized competitors)
- ✅ No coercion (system just makes non-participation less useful)

---

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context (RoleContext) + localStorage
- **HTTP Client**: TanStack React Query
- **Testing**: Vitest
- **Linting**: ESLint + TypeScript
- **Database Simulation**: localStorage (JSON serialization)

---

## Project Structure

```
heidi-prototype/
├── src/
│   ├── pages/
│   │   ├── RoleSelection.tsx         # Role switcher + demo entry point
│   │   ├── PatientDashboard.tsx      # Patient view of history & relationships
│   │   ├── SelectClinician.tsx       # Patient selects clinician, confirms consent
│   │   ├── CareContract.tsx          # Confirms care relationship creation
│   │   ├── ClinicianDashboard.tsx    # Clinician view of patients & lock state
│   │   ├── AddObservations.tsx       # Clinician submits observations
│   │   └── NotFound.tsx              # 404 fallback
│   ├── context/
│   │   └── RoleContext.tsx           # Active role state + refresh mechanism
│   ├── data/
│   │   └── store.ts                  # Data layer (CRUD via localStorage)
│   ├── components/
│   │   ├── PageShell.tsx             # Page layout wrapper
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts, use-mobile.tsx
│   ├── App.tsx                       # Route definitions
│   └── main.tsx                      # React entry point
├── package.json                      # Dependencies
├── vite.config.ts                    # Vite build config
├── tailwind.config.ts                # Tailwind CSS config
└── README.md                         # This file
```

---

## Running the Application

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

```bash
cd heidi-prototype
npm install
```

### Development Server

```bash
npm run dev
```

Opens the app at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test                # Single run
npm run test:watch     # Watch mode
```

### Linting

```bash
npm run lint
```

---

## Important Limitations & Disclaimers

### This is a Prototype

- **Data Storage**: All data stored in browser localStorage (not persistent, not encrypted, not suitable for production)
- **No Authentication**: Role switching is client-side only—no password, no session management
- **No Server**: This is a frontend-only demo. Real implementation requires backend services
- **No Database**: Data loss on browser clear, cache invalidation, or tab close

### Design Constraints (Intentional)

- Demo prioritizes **behavioral pattern visualization** over infrastructure
- Seed data is simplified to show core incentive mechanics
- No real medical data (synthetic patient history for demo purposes)
- Single-device testing only (no multi-user network simulation)

### For Production Implementation

- Implement proper user authentication (OAuth2, JWT, MFA)
- Build backend API with role-based access control (RBAC)
- Use encrypted database (e.g., PostgreSQL with encryption at rest)
- Implement audit logging for all data access
- Add data retention and deletion policies
- Enforce TLS/HTTPS
- Implement rate limiting and DDoS protection
- Use proper session management and token rotation
- Add comprehensive logging and monitoring
- Improvise the patient dashboard with charts, and visual graphics.
- Implement proper backup and disaster recovery

---

## Key Features Demonstrated

✅ **Patient-Controlled Visibility**

- Patients decide who sees their data
- Explicit consent for care relationships
- Full transparency (who has access, when)

✅ **Incentive-Driven Contribution**

- Clinicians are "locked" until they contribute
- Contribution unlocks dashboard and access
- No bypass—contribution is required for benefit

✅ **Scoped History Visibility**

- Each clinician sees history up to THEIR session date
- Future clinician contributions remain hidden
- Competitive privacy enforced

✅ **Real-Time Data Integration**

- Observations appear immediately in patient history
- Metadata (timestamp, domain, context) preserved
- Longitudinal view accumulates over time

✅ **Anonymized Competitive Data**

- Other clinicians' names stripped from history
- Raw clinical data remains visible
- Prevents competitive leakage while enabling care continuity

✅ **Multi-Patient Multi-Clinician Support**

- Two patients, two clinicians
- Complex relationship mapping
- Correct access scoping across all combinations

✅ **Clear Lock States & Transitions**

- Visual indicators for active (locked) vs completed relationships
- Immediate UI updates on state changes
- Unambiguous user guidance

---

## Questions & Contact

This prototype was built to test a specific incentive model for healthcare data sharing. For questions about the design philosophy, system behavior, or implementation details, refer to the design docs and code comments.

---

**Final Note**: This is a **behavior-first prototype**. The focus is on demonstrating that the incentive model _works_—that clinicians are willing to contribute when access is tied to contribution, and that patients benefit from the resulting data richness. Infrastructure hardening is left to production teams, but the core incentive mechanics are validated here.
