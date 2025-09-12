import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Users, FileText } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function CitizenLogin() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        ...data,
        userType: "citizen",
      });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginData) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-12 w-12 text-blue-600" />
              <div className="absolute inset-0 bg-blue-100 rounded-full -z-10 transform scale-150"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Citizen Portal</h1>
          <p className="text-gray-600 mt-2">Secure reporting for public safety</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Shield className="h-8 w-8 text-blue-600 mx-auto" />
            <p className="text-sm text-gray-600">Quantum Encrypted</p>
          </div>
          <div className="space-y-2">
            <Users className="h-8 w-8 text-green-600 mx-auto" />
            <p className="text-sm text-gray-600">Anonymous Safe</p>
          </div>
          <div className="space-y-2">
            <FileText className="h-8 w-8 text-purple-600 mx-auto" />
            <p className="text-sm text-gray-600">Case Tracking</p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your secure reporting dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Enter your username"
                  data-testid="input-username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter your password"
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/register/citizen" 
                  className="text-blue-600 hover:underline"
                  data-testid="link-register"
                >
                  Register here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Are you an agency?{" "}
                <Link 
                  href="/login/agency" 
                  className="text-blue-600 hover:underline"
                  data-testid="link-agency-login"
                >
                  Agency Login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link 
                  href="/report/anonymous" 
                  className="text-green-600 hover:underline"
                  data-testid="link-anonymous-report"
                >
                  Submit Anonymous Report
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}