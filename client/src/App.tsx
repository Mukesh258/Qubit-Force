import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { NotificationSystem } from "@/components/notification-system";
import { SecureChat } from "@/components/secure-chat";
import { useAuth } from "@/hooks/useAuth";
import Welcome from "@/pages/welcome";
import CitizenLogin from "@/pages/citizen-login";
import AgencyLogin from "@/pages/agency-login";
import AgencyDashboard from "@/pages/agency-dashboard";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import CaseDetails from "@/pages/case-details";
import Quantum from "@/pages/quantum";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isAgency, isCitizen, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Welcome} />
      <Route path="/login/citizen" component={CitizenLogin} />
      <Route path="/login/agency" component={AgencyLogin} />
      
      {/* Agency routes */}
      {isAuthenticated && isAgency ? (
        <>
          <Route path="/agency/dashboard" component={AgencyDashboard} />
          <Route path="/case/:caseId" component={CaseDetails} />
          <Route path="/chat/:caseId">
            {(params) => (
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Chat key={params.caseId} />
                </div>
              </div>
            )}
          </Route>
        </>
      ) : null}
      
      {/* Citizen routes */}
      {isAuthenticated && isCitizen ? (
        <>
          <Route path="/dashboard">
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Dashboard />
              </div>
              <NotificationSystem />
              <SecureChat />
            </div>
          </Route>
        </>
      ) : null}
      
      {/* Anonymous routes */}
      <Route path="/report/anonymous">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Home />
          </div>
          <NotificationSystem />
          <SecureChat />
        </div>
      </Route>
      
      {/* Protected routes with sidebar */}
      {isAuthenticated ? (
        <>
          <Route path="/quantum">
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Quantum />
              </div>
            </div>
          </Route>
          <Route path="/chat">
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Chat />
              </div>
            </div>
          </Route>
          <Route path="/chat/:caseId">
            {(params) => (
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Chat key={params.caseId} />
                </div>
              </div>
            )}
          </Route>
        </>
      ) : null}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
