import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/context/RoleContext";
import RoleSelection from "@/pages/RoleSelection";
import PatientDashboard from "@/pages/PatientDashboard";
import SelectClinician from "@/pages/SelectClinician";
import CareContract from "@/pages/CareContract";
import ClinicianDashboard from "@/pages/ClinicianDashboard";
import AddObservations from "@/pages/AddObservations";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/select-clinician" element={<SelectClinician />} />
            <Route path="/patient/care-contract/:clinicianId" element={<CareContract />} />
            <Route path="/clinician" element={<ClinicianDashboard />} />
            <Route path="/clinician/add-observations/:relationshipId" element={<AddObservations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
