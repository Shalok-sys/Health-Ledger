import {
  useRole,
  getRoleLabel,
  isPatientRole,
  type ActiveRole,
} from "@/context/RoleContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Lock } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  showBackToRoles?: boolean;
}

export default function PageShell({
  title,
  children,
  showBackToRoles = true,
}: Props) {
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
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {showBackToRoles && (
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Active Role
                </p>
                <p className="text-sm font-semibold truncate">
                  {getRoleLabel(activeRole)}
                </p>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isClinicianLocked && (
                <span className="inline-flex items-center gap-1 text-xs text-locked-foreground mr-1 sm:mr-2">
                  <Lock className="h-3 w-3" />
                  <span className="hidden sm:inline">Locked</span>
                </span>
              )}
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                <Users className="h-3.5 w-3.5 inline mr-1" />
                Switch:
              </span>
              <div className="flex gap-1 sm:gap-2">
                {allRoles.map((r) => {
                  const isDisabled = isClinicianLocked && r.id !== activeRole;
                  return (
                    <button
                      key={r.id}
                      onClick={() => switchRole(r.id)}
                      disabled={isDisabled}
                      className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border transition-all ${
                        activeRole === r.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : isDisabled
                            ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                            : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="hidden sm:inline">{r.label}</span>
                      <span className="sm:hidden">
                        {r.id === "patient-a"
                          ? "PA"
                          : r.id === "patient-b"
                            ? "PB"
                            : r.id === "clinician-a"
                              ? "CA"
                              : "CB"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
}
