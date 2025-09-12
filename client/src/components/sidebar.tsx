import { Link, useLocation } from "wouter";
import { Shield, FileText, BarChart3, MessageCircle, Atom, Lock, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const mainNavItems = [
    { href: "/report/anonymous", icon: FileText, label: "Anonymous Reporting", id: "reporting" },
    { href: "/dashboard", icon: BarChart3, label: "Report Dashboard", id: "dashboard" },
    { href: "/chat", icon: MessageCircle, label: "Secure Chat", id: "chat" },
  ];

  const quantumNavItems = [
    { href: "/quantum", icon: Atom, label: "QKD Simulation", id: "qkd" },
    { href: "/quantum?tab=pqc", icon: Lock, label: "PQC Encryption", id: "pqc" },
    { href: "/quantum?tab=blockchain", icon: Box, label: "Blockchain Logs", id: "blockchain" },
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-80 bg-card border-r border-border">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center quantum-glow">
          <Shield className="text-primary-foreground w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Qubit Force</h1>
          <p className="text-sm text-muted-foreground">Secure Reporting Network</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Main Functions
          </h3>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.id} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
        
        <div className="space-y-1 pt-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quantum Security
          </h3>
          {quantumNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href.includes('?') && location.startsWith(item.href.split('?')[0]));
            return (
              <Link key={item.id} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Security Status Panel */}
      <div className="p-4 border-t border-border">
        <SecurityStatusPanel />
      </div>
    </div>
  );
}

function SecurityStatusPanel() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Security Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantum Keys</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full quantum-pulse"></div>
            <span className="text-green-400">Active</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">PQC Encryption</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400">Enabled</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Blockchain Sync</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-amber-400">Syncing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
