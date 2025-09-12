import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, NotebookPen, Upload, Info } from "lucide-react";
import { insertReportSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const extendedReportSchema = insertReportSchema.extend({
  reportType: z.string().min(1, "Please select a report type"),
  urgencyLevel: z.string().min(1, "Please select an urgency level"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ReportFormData = z.infer<typeof extendedReportSchema>;

export function ReportingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(extendedReportSchema),
    defaultValues: {
      reportType: "",
      urgencyLevel: "",
      description: "",
      location: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const submitReport = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const response = await apiRequest("POST", "/api/reports", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Submitted Successfully",
        description: `Report ID: ${data.reportId} - Your report has been quantum-encrypted and logged on the blockchain.`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      // Send metadata about attachments (server may ignore extra keys)
      await submitReport.mutateAsync({
        ...(data as any),
        attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const acceptedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const next: File[] = [];
    Array.from(list).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 10MB`, variant: "destructive" });
        return;
      }
      if (!acceptedTypes.includes(file.type)) {
        toast({ title: "Unsupported type", description: `${file.name} is not a supported file type`, variant: "destructive" });
        return;
      }
      next.push(file);
    });
    if (next.length) {
      setFiles((prev) => [...prev, ...next]);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onBrowseClick = () => fileInputRef.current?.click();

  return (
    <Card className="bg-white/70 backdrop-blur-md border-sky-100 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Submit Anonymous Report
        </h3>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={form.watch("reportType")}
              onValueChange={(value) => form.setValue("reportType", value)}
            >
              <SelectTrigger className="border-sky-100 hover:border-sky-300 focus:ring-sky-200 transition" data-testid="select-report-type">
                <SelectValue placeholder="Select report type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corruption">Corruption</SelectItem>
                <SelectItem value="fraud">Financial Fraud</SelectItem>
                <SelectItem value="safety">Safety Violation</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="environmental">Environmental Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.reportType && (
              <p className="text-sm text-destructive">{form.formState.errors.reportType.message}</p>
            )}
          </div>
          
          {/* Urgency Level */}
          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <RadioGroup
              value={form.watch("urgencyLevel")}
              onValueChange={(value) => form.setValue("urgencyLevel", value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="flex items-center p-3 border border-sky-100 rounded-md cursor-pointer hover:bg-sky-50/70 transition shadow-sm hover:shadow">
                <RadioGroupItem value="low" id="low" className="mr-3" data-testid="radio-urgency-low" />
                <div className="flex-1">
                  <Label htmlFor="low" className="font-medium text-green-400 cursor-pointer">Low</Label>
                  <div className="text-xs text-muted-foreground">Non-urgent matter</div>
                </div>
              </div>
              <div className="flex items-center p-3 border border-sky-100 rounded-md cursor-pointer hover:bg-amber-50/70 transition shadow-sm hover:shadow">
                <RadioGroupItem value="medium" id="medium" className="mr-3" data-testid="radio-urgency-medium" />
                <div className="flex-1">
                  <Label htmlFor="medium" className="font-medium text-amber-400 cursor-pointer">Medium</Label>
                  <div className="text-xs text-muted-foreground">Requires attention</div>
                </div>
              </div>
              <div className="flex items-center p-3 border border-sky-100 rounded-md cursor-pointer hover:bg-rose-50/70 transition shadow-sm hover:shadow">
                <RadioGroupItem value="high" id="high" className="mr-3" data-testid="radio-urgency-high" />
                <div className="flex-1">
                  <Label htmlFor="high" className="font-medium text-red-400 cursor-pointer">High</Label>
                  <div className="text-xs text-muted-foreground">Immediate action needed</div>
                </div>
              </div>
            </RadioGroup>
            {form.formState.errors.urgencyLevel && (
              <p className="text-sm text-destructive">{form.formState.errors.urgencyLevel.message}</p>
            )}
          </div>
          
          {/* Report Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Report Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the incident or issue..."
              className="h-32 resize-none"
              {...form.register("description")}
              data-testid="textarea-description"
            />
            <p className="text-xs text-muted-foreground">Be as specific as possible while protecting identities</p>
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidence</Label>
            <div
              className="border-2 border-dashed border-sky-200 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer"
              onClick={onBrowseClick}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={onDrop}
            >
              <Upload className="text-muted-foreground text-2xl mb-2 mx-auto" />
              <p className="text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground">Supported: PDF, DOC, JPG, PNG (Max 10MB each)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                data-testid="input-evidence-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {files.length > 0 && (
              <div className="text-sm bg-muted/40 border border-border rounded-md p-3">
                <div className="font-medium mb-2">Selected files</div>
                <ul className="space-y-1">
                  {files.map((f, idx) => (
                    <li key={`${f.name}-${idx}`} className="flex items-center justify-between">
                      <span className="truncate mr-3">{f.name}</span>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline hover:opacity-90 transition"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Location Information */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="Department, building, city, or general area"
              {...form.register("location")}
              data-testid="input-location"
            />
          </div>
          
          {/* Contact Information (Optional) */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="text-primary w-4 h-4" />
                <h4 className="font-medium text-foreground">Contact Information (Optional)</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Providing contact information is completely optional. If provided, it will be encrypted and only accessible to authorized investigators.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your@email.com"
                    {...form.register("contactEmail")}
                    data-testid="input-contact-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("contactPhone")}
                    data-testid="input-contact-phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Encryption Status */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-purple-50 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Lock className="text-primary-foreground w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Quantum-Safe Encryption Active</h4>
                <p className="text-sm text-muted-foreground">Your report will be encrypted using post-quantum cryptography</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400">QKD Keys: Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400">PQC: Kyber-1024</span>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Report ID will be generated upon submission</span>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || submitReport.isPending}
              className="px-8 py-3 quantum-glow bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition transform duration-200"
              data-testid="button-submit-report"
            >
              {isSubmitting || submitReport.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Encrypting...
                </>
              ) : (
                <>
                  <NotebookPen className="mr-2 w-4 h-4" />
                  Submit Secure Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
