import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { type Report } from "@shared/schema";
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  UserCheck,
  BarChart3
} from "lucide-react";

export default function AgencyDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading, isAuthenticated, isAgency } = useAuth();

  // Fetch all reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    enabled: isAuthenticated && isAgency,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/login/agency");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}/resolve`, { method: "POST" });
      // Refetch reports so counts update without full reload
      await fetch("/api/reports", { cache: "no-store" });
      // Trigger react-query to refetch by navigating or by simple trick: reload location
      setLocation("/agency/dashboard");
    } catch (e) {
      console.error("Resolve failed", e);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading agency portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAgency) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Agency credentials required.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation("/login/agency")}
              className="ml-2"
            >
              Go to Login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted": return <Clock className="h-4 w-4 text-blue-600" />;
      case "in_progress": return <Eye className="h-4 w-4 text-orange-600" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const urgencyStats = reports.reduce((acc: any, report: Report) => {
    const level = report.urgencyLevel || 'unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const statusStats = reports.reduce((acc: any, report: Report) => {
    const status = report.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-slate-700" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
              <p className="text-gray-600">{user?.agencyName || "Government Agency"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">Agency Officer</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">All submitted reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {urgencyStats.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statusStats.submitted || 0}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statusStats.resolved || 0}
              </div>
              <p className="text-xs text-muted-foreground">Successfully handled</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" data-testid="tab-reports">
              All Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Case Management</CardTitle>
                <CardDescription>
                  Monitor and manage all submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 text-gray-400 mx-auto animate-pulse" />
                    <p className="mt-2 text-gray-600">Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-4 text-gray-600">No reports submitted yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report: Report) => (
                        <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                          <TableCell className="font-mono text-sm">
                            {report.caseId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {report.reportType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`text-white ${getUrgencyColor(report.urgencyLevel)}`}
                            >
                              {report.urgencyLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(report.status || '')}
                              <span className="capitalize">{report.status || 'pending'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {report.location || "Not specified"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(report.createdAt || '').toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/case/${report.caseId}`)}
                                data-testid={`button-view-${report.id}`}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/chat/${report.caseId}`)}
                                data-testid={`button-chat-${report.id}`}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveReport(report.id)}
                                data-testid={`button-resolve-${report.id}`}
                                disabled={(report.status || '').toLowerCase() === 'resolved'}
                              >
                                Resolve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Urgency Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(urgencyStats).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getUrgencyColor(level)}`}></div>
                          <span className="capitalize">{level}</span>
                        </div>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statusStats).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}