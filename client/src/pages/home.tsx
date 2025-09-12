import { User, ShieldCheck, UserCircle, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReportingForm } from "@/components/reporting-form";
import { QuantumStatus } from "@/components/quantum-status";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white/70 backdrop-blur-md border-b border-sky-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Anonymous Reporting</h2>
              <p className="text-sm text-muted-foreground">Submit secure, encrypted reports</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Quantum Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2 btn-hover"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
              <button className="p-2 hover:bg-muted rounded-full" data-testid="button-user-menu">
                <UserCircle className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Security Notice */}
          <div className="secure-border rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="text-primary w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Privacy is Protected</h3>
                <p className="text-muted-foreground mb-4">
                  All reports are encrypted using post-quantum cryptography and secured with quantum key distribution. 
                  Your identity remains completely anonymous unless you choose to provide contact information.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>End-to-End Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Blockchain Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Quantum Resistant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reporting Form */}
          <ReportingForm />
          
          {/* Quantum Security Visualization */}
          <QuantumStatus />
        </div>
      </main>
    </>
  );
}
