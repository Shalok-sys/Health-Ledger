import { useRole, getRoleLabel, isPatientRole, type ActiveRole } from "@/context/RoleContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Lock } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  showBackToRoles?: boolean;
}

export default function PageShell({ title, children, showBackToRoles = true }: Props) {
  const { activeRole, setActiveRole, triggerRefresh } = useRole();
  const navigate = useNavigate();

  // No longer locking the navigation role switcher — lock is enforced within the clinician dashboard
  const isClinicianLocked = false;

  function switchRole(role: ActiveRole) {
    // LOCK ENFORCEMENT: If clinician has an active relationship, block switching
    if (isClinicianLocked && role !== activeRole) {
      // Allow only if switching to the same clinician role (no-op)
      return;
    }
    setActiveRole(role);
    triggerRefresh();
    if (isPatientRole(role)) navigate("/patient");
    else navigate("/clinician");
  }

  const allRoles: { id: ActiveRole; label: string }[] = [
    { id: "patient-a", label: "Patient A" },
    { id: "patient-b", label: "Patient B" },
    { id: "clinician-a", label: "Clinician A" },
    { id: "clinician-b", label: "Clinician B" },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackToRoles && (
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Role
              </p>
              <p className="text-sm font-semibold">{getRoleLabel(activeRole)}</p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2">
            {isClinicianLocked && (
              <span className="inline-flex items-center gap-1 text-xs text-locked-foreground mr-2">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            )}
            <span className="text-xs text-muted-foreground mr-1">
              <Users className="h-3.5 w-3.5 inline mr-1" />
              Switch:
            </span>
            {allRoles.map((r) => {
              const isDisabled = isClinicianLocked && r.id !== activeRole;
              return (
                <button
                  key={r.id}
                  onClick={() => switchRole(r.id)}
                  disabled={isDisabled}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                    activeRole === r.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : isDisabled
                      ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
}