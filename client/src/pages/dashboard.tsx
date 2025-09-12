import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, Clock, CheckCircle } from "lucide-react";
import { Report } from "@shared/schema";

export default function Dashboard() {
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "under-review": return "default";
      case "resolved": return "default";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Report Dashboard</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage submitted reports</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-reports">
                  {reports?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500" data-testid="stat-high-priority">
                  {reports?.filter(r => r.urgencyLevel === "high").length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500" data-testid="stat-under-review">
                  {reports?.filter(r => r.status === "under-review").length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500" data-testid="stat-resolved">
                  {reports?.filter(r => r.status === "resolved").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Quantum Secured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports?.length ? (
                      reports.map((report) => (
                        <TableRow key={report.id} data-testid={`report-row-${report.id}`}>
                          <TableCell className="font-mono text-sm">
                            {report.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(report.reportType)}
                              <span className="capitalize">{report.reportType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getUrgencyColor(report.urgencyLevel) as any}>
                              {report.urgencyLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(report.status || 'submitted') as any}>
                              {report.status || 'submitted'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.location || "Not specified"}
                          </TableCell>
                          <TableCell>
                            {new Date(report.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {report.quantumKeyId ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-400">QKD Secured</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                  <span className="text-xs text-amber-400">Standard PQC</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No reports submitted yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
