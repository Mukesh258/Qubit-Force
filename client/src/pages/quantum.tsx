import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuantumStatus } from "@/components/quantum-status";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Globe } from "lucide-react";

interface BlockchainStatus {
  latestBlock: number;
  networkHealth: 'healthy' | 'syncing' | 'error';
  transactionCount: number;
  gasPrice: string;
}

interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string | Date;
  data: any;
  previousHash: string;
  nonce: number;
}

export default function Quantum() {
  // Parse URL search params manually and control Tabs state
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "qkd";
  const [tab, setTab] = useState<string>(initialTab);

  const { data: blockchainStatus } = useQuery<BlockchainStatus>({
    queryKey: ["/api/blockchain/status"],
    refetchInterval: 5000,
  });

  const { data: transactions = [] } = useQuery<BlockchainTransaction[]>({
    queryKey: ["/api/blockchain/transactions"],
    refetchInterval: 5000,
  });

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "default";
      case "syncing": return "secondary";
      case "error": return "destructive";
      default: return "default";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Quantum Security Center</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage quantum cryptographic systems</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              setTab(value);
              const sp = new URLSearchParams(window.location.search);
              sp.set("tab", value);
              const newUrl = `${window.location.pathname}?${sp.toString()}`;
              window.history.replaceState(null, "", newUrl);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="qkd" data-testid="tab-qkd">QKD Simulation</TabsTrigger>
              <TabsTrigger value="pqc" data-testid="tab-pqc">PQC Encryption</TabsTrigger>
              <TabsTrigger value="blockchain" data-testid="tab-blockchain">Blockchain Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="qkd" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Quantum Key Distribution Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuantumStatus />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Protocol Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">BB84 Protocol</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The BB84 protocol uses quantum mechanics to detect eavesdropping attempts
                        through the no-cloning theorem and measurement disturbance.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Basis States:</span>
                          <span className="font-mono">|0⟩, |1⟩, |+⟩, |-⟩</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Security:</span>
                          <span className="text-green-400">Information-theoretic</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="pqc" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post-Quantum Algorithms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Kyber-1024</h4>
                          <Badge variant="default">NIST Standard</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Lattice-based key encapsulation mechanism resistant to quantum attacks.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Public Key:</span>
                            <span className="ml-2">1568 bytes</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Private Key:</span>
                            <span className="ml-2">3168 bytes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Dilithium-3</h4>
                          <Badge variant="default">NIST Standard</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Lattice-based digital signature scheme for authentication.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Public Key:</span>
                            <span className="ml-2">1952 bytes</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Signature:</span>
                            <span className="ml-2">3309 bytes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Hybrid Encryption Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                          1
                        </div>
                        <div>
                          <div className="font-medium text-sm">Generate Session Key</div>
                          <div className="text-xs text-muted-foreground">AES-256 symmetric key</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                          2
                        </div>
                        <div>
                          <div className="font-medium text-sm">Kyber Encapsulation</div>
                          <div className="text-xs text-muted-foreground">Protect session key</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                          3
                        </div>
                        <div>
                          <div className="font-medium text-sm">AES Encryption</div>
                          <div className="text-xs text-muted-foreground">Encrypt report data</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                          4
                        </div>
                        <div>
                          <div className="font-medium text-sm">Dilithium Signature</div>
                          <div className="text-xs text-muted-foreground">Digital authentication</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="blockchain" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-latest-block">
                      {blockchainStatus?.latestBlock || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getHealthColor(blockchainStatus?.networkHealth || 'healthy') as any}>
                      {blockchainStatus?.networkHealth || 'healthy'}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-transaction-count">
                      {blockchainStatus?.transactionCount || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gas Price</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold" data-testid="stat-gas-price">
                      {blockchainStatus?.gasPrice || '20.0 gwei'}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-2">Immutable Report Logging</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        All submitted reports are hashed and logged on a blockchain for immutability and verification.
                        This ensures that reports cannot be tampered with or deleted.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hash Algorithm:</span>
                          <span className="ml-2 font-mono">SHA3-256</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Consensus:</span>
                          <span className="ml-2">Proof of Work (simulated)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Block Time:</span>
                          <span className="ml-2">~2 seconds</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Verification:</span>
                          <span className="ml-2 text-green-400">Automatic</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Blockchain Transactions</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">Block</th>
                              <th className="py-2 pr-4">Hash</th>
                              <th className="py-2 pr-4">Type</th>
                              <th className="py-2 pr-4">Report ID</th>
                              <th className="py-2 pr-4">Report Hash</th>
                              <th className="py-2 pr-4">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={`${tx.blockNumber}-${tx.hash}`} className="border-t border-border">
                                <td className="py-2 pr-4 font-mono">{tx.blockNumber}</td>
                                <td className="py-2 pr-4 font-mono truncate max-w-[220px]">{tx.hash}</td>
                                <td className="py-2 pr-4">{tx.data?.type}</td>
                                <td className="py-2 pr-4 font-mono truncate max-w-[160px]">{tx.data?.reportId || '-'}</td>
                                <td className="py-2 pr-4 font-mono truncate max-w-[220px]">{tx.data?.reportHash || '-'}</td>
                                <td className="py-2 pr-4">{new Date(tx.timestamp as any).toLocaleString()}</td>
                              </tr>
                            ))}
                            {transactions.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-4 text-center text-muted-foreground">No transactions yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
