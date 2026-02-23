import { useRole, getRoleLabel, isPatientRole, type ActiveRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { resetData } from "@/data/store";
import { Shield, User, Stethoscope } from "lucide-react";

const roles: { id: ActiveRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "patient-a",
    label: "Patient A — Maria Santos",
    description: "View your longitudinal clinical record, manage care relationships, and see clinician contributions.",
    icon: <User className="h-8 w-8" />,
  },
  {
    id: "patient-b",
    label: "Patient B — João Oliveira",
    description: "A second patient perspective. Manage your own care relationships independently.",
    icon: <User className="h-8 w-8" />,
  },
  {
    id: "clinician-a",
    label: "Clinician A — Dr. Elena Ruiz",
    description: "Musculoskeletal Physiotherapy. Must contribute observations before accessing patient history.",
    icon: <Stethoscope className="h-8 w-8" />,
  },
  {
    id: "clinician-b",
    label: "Clinician B — Dr. Carlos Méndez",
    description: "Sports Rehabilitation. Must contribute observations before accessing patient history.",
    icon: <Stethoscope className="h-8 w-8" />,
  },
];

export default function RoleSelection() {
  const { activeRole, setActiveRole, triggerRefresh } = useRole();
  const navigate = useNavigate();

  function handleSelect(role: ActiveRole) {
    setActiveRole(role);
    triggerRefresh();
    if (isPatientRole(role)) {
      navigate("/patient");
    } else {
      navigate("/clinician");
    }
  }

  function handleReset() {
    resetData();
    triggerRefresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            <Shield className="h-4 w-4" />
            Behavior-First Prototype
          </div>
          <h1 className="text-4xl font-bold">Patient-Controlled Clinical History</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Select a role to experience the system from that perspective. 
            Data, actions, and visibility change immediately.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`w-full text-left p-6 rounded-lg border-2 transition-all
                ${activeRole === role.id
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-secondary text-secondary-foreground">
                  {role.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{role.label}</h3>
                  <p className="text-muted-foreground mt-1">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Reset all data to defaults
          </button>
        </div>
      </div>
    </div>
  );
}