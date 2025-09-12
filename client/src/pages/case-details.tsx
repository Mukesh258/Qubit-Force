import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, FileText, MapPin, Clock } from "lucide-react";
import { type Report } from "@shared/schema";

export default function CaseDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const caseId = params.caseId as string;

  const { data: report, isLoading, error } = useQuery<Report>({
    queryKey: ["/api/reports/case", caseId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading case details…</p>
        </div>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="max-w-xl">
          <AlertDescription>
            Unable to load case details. The case may not exist or you may not have access.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => setLocation("/agency/dashboard")}> 
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case {report.caseId}</h1>
          <p className="text-gray-600">Detailed case information and timeline</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/agency/dashboard")}> 
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Case Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-28">Type</span>
              <Badge variant="secondary">{report.reportType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-28">Urgency</span>
              <Badge className="text-white">{report.urgencyLevel}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-28">Status</span>
              <Badge variant="outline">{report.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">Submitted {new Date(report.createdAt || '').toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 text-gray-900">{report.location || "Not specified"}</span>
            </div>
            <div>
              <span className="text-gray-600">Contact Email:</span>
              <span className="ml-2 text-gray-900">{(report as any)?.decryptedData?.contactEmail || (report as any)?.contactEmail || "Not provided"}</span>
            </div>
            <div>
              <span className="text-gray-600">Contact Phone:</span>
              <span className="ml-2 text-gray-900">{(report as any)?.decryptedData?.contactPhone || (report as any)?.contactPhone || "Not provided"}</span>
            </div>
            <div>
              <span className="text-gray-600">Blockchain:</span>
              <span className="ml-2 text-gray-900">{report.blockchainHash ? "Confirmed" : "Pending"}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantum Key:</span>
              <span className="ml-2 text-gray-900">{report.quantumKeyId ? "Active" : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 whitespace-pre-wrap">
            {(report as any)?.decryptedData?.description || (report as any)?.description || "Description not available"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const attachments = (report as any)?.decryptedData?.attachments || [];
            if (!attachments || attachments.length === 0) {
              return <p className="text-sm text-gray-600">No attachments</p>;
            }
            return (
              <ul className="text-sm list-disc ml-5 space-y-1">
                {attachments.map((a: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="font-medium">{a.name}</span>
                    {a.type ? <span className="text-gray-500">{a.type}</span> : null}
                    {a.size ? <span className="text-gray-500">{(a.size/1024).toFixed(1)} KB</span> : null}
                  </li>
                ))}
              </ul>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}


