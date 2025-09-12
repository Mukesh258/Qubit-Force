import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Lock, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QuantumStatusData {
  qkd: {
    photonSuccessRate: string;
    keyGenerationRate: number;
    errorRate: string;
    keyGenerated: boolean;
  };
  quantumStates: Array<{
    state: string;
    detected: boolean;
  }>;
  channelNoise: {
    photonLoss: number;
    darkCounts: number;
    detectorEfficiency: number;
  };
  activeKey: {
    id: string;
    algorithm: string;
    created: string;
  } | null;
}

interface PQCStatusData {
  algorithms: Array<{
    name: string;
    type: string;
    status: string;
    keySize: number;
  }>;
  currentSessionKey: string;
  encryptionReady: boolean;
}

export function QuantumStatus() {
  const { data: quantumData, refetch: refetchQuantum } = useQuery<QuantumStatusData>({
    queryKey: ["/api/quantum/status"],
    refetchInterval: 5000, // Update every 5 seconds
  });

  const { data: pqcData, refetch: refetchPQC } = useQuery<PQCStatusData>({
    queryKey: ["/api/pqc/status"],
    refetchInterval: 10000, // Update every 10 seconds
  });

  const handleRegenerateKeys = async () => {
    try {
      await apiRequest("POST", "/api/quantum/regenerate");
      refetchQuantum();
    } catch (error) {
      console.error("Failed to regenerate quantum keys:", error);
    }
  };

  const handleRotatePQCKeys = async () => {
    try {
      await apiRequest("POST", "/api/pqc/rotate");
      refetchPQC();
    } catch (error) {
      console.error("Failed to rotate PQC keys:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QKD Simulation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Atom className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">QKD BB84 Protocol</h3>
              <p className="text-sm text-muted-foreground">Quantum Key Distribution Status</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="blockchain-grid rounded-lg p-4 border border-border">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Photon Success Rate</span>
                  <span className="text-green-400 font-mono" data-testid="text-photon-success">
                    {quantumData?.qkd.photonSuccessRate || "94.7"}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Key Generation Rate</span>
                  <span className="text-primary font-mono" data-testid="text-key-generation-rate">
                    {quantumData?.qkd.keyGenerationRate?.toFixed(1) || "2.1"} kbps
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Error Rate (QBER)</span>
                  <span className="text-amber-400 font-mono" data-testid="text-error-rate">
                    {quantumData?.qkd.errorRate || "2.3"}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {quantumData?.quantumStates?.map((state, index) => (
                <div
                  key={index}
                  className={`h-8 rounded flex items-center justify-center text-xs font-mono ${
                    state.detected ? "bg-primary/40" : "bg-primary/20 quantum-pulse"
                  }`}
                  data-testid={`quantum-state-${index}`}
                >
                  {state.state}
                </div>
              )) || 
              // Fallback display when no data
              Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded flex items-center justify-center text-xs font-mono ${
                    i % 2 === 0 ? "bg-primary/20 quantum-pulse" : "bg-primary/40"
                  }`}
                  data-testid={`quantum-state-${i}`}
                >
                  {['|0⟩', '|1⟩', '|+⟩', '|-⟩'][i]}
                </div>
              ))}
            </div>
            
            <Button
              onClick={handleRegenerateKeys}
              variant="outline"
              className="w-full"
              data-testid="button-regenerate-quantum"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Regenerate Quantum Keys
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* PQC Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Lock className="text-green-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Post-Quantum Crypto</h3>
              <p className="text-sm text-muted-foreground">Encryption Algorithm Status</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              {pqcData?.algorithms?.map((algorithm, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className={`w-4 h-4 ${algorithm.name.includes('Kyber') ? 'text-green-500' : 'text-blue-500'}`} />
                    <span className="text-sm font-medium">{algorithm.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
              )) || 
              // Fallback algorithms
              [
                { name: "Kyber-1024", type: "Key Encapsulation", status: "active" },
                { name: "Dilithium-3", type: "Digital Signature", status: "active" }
              ].map((algorithm, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className={`w-4 h-4 ${algorithm.name.includes('Kyber') ? 'text-green-500' : 'text-blue-500'}`} />
                    <span className="text-sm font-medium">{algorithm.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-2">Current Session Key</div>
              <div className="font-mono text-xs text-foreground break-all bg-background p-2 rounded" data-testid="text-session-key">
                {pqcData?.currentSessionKey || "A7F3C9E2...B8D4A1F6"}
              </div>
            </div>
            
            <Button
              onClick={handleRotatePQCKeys}
              variant="outline"
              className="w-full"
              data-testid="button-rotate-pqc"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Rotate PQC Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
