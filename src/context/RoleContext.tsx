import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { initializeData } from "@/data/store";

export type ActiveRole = "patient-a" | "patient-b" | "clinician-a" | "clinician-b";

interface RoleContextType {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  // Triggers a re-read of all data from localStorage "JSON files"
  refreshKey: number;
  triggerRefresh: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<ActiveRole>("patient-a");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initializeData();
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, refreshKey, triggerRefresh }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function getRoleLabel(role: ActiveRole): string {
  switch (role) {
    case "patient-a": return "Patient — Maria Santos";
    case "patient-b": return "Patient — João Oliveira";
    case "clinician-a": return "Clinician A — Dr. Elena Ruiz";
    case "clinician-b": return "Clinician B — Dr. Carlos Méndez";
  }
}

export function getClinicianIdFromRole(role: ActiveRole): string | null {
  switch (role) {
    case "clinician-a": return "clinician-a";
    case "clinician-b": return "clinician-b";
    default: return null;
  }
}

export function getPatientIdFromRole(role: ActiveRole): string | null {
  switch (role) {
    case "patient-a": return "patient-1";
    case "patient-b": return "patient-2";
    default: return null;
  }
}

export function isPatientRole(role: ActiveRole): boolean {
  return role === "patient-a" || role === "patient-b";
}
