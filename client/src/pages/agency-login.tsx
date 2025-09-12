import React, { useState } from "react";
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
import { Shield, Eye, MessageSquare, BarChart3 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AgencyLogin() {
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
        userType: "agency",
      });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/agency/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-12 w-12 text-slate-700" />
              <div className="absolute inset-0 bg-slate-200 rounded-full -z-10 transform scale-150"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Agency Portal</h1>
          <p className="text-gray-600 mt-2">Secure case management system</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="space-y-2">
            <Eye className="h-6 w-6 text-blue-600 mx-auto" />
            <p className="text-xs text-gray-600">Monitor</p>
          </div>
          <div className="space-y-2">
            <MessageSquare className="h-6 w-6 text-green-600 mx-auto" />
            <p className="text-xs text-gray-600">Respond</p>
          </div>
          <div className="space-y-2">
            <BarChart3 className="h-6 w-6 text-purple-600 mx-auto" />
            <p className="text-xs text-gray-600">Analyze</p>
          </div>
          <div className="space-y-2">
            <Shield className="h-6 w-6 text-red-600 mx-auto" />
            <p className="text-xs text-gray-600">Protect</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-slate-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Agency Access</CardTitle>
            <CardDescription>
              Sign in to your case management dashboard
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
                <Label htmlFor="username">Agency Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Enter your agency username"
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
                  placeholder="Enter your secure password"
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
                className="w-full bg-slate-700 hover:bg-slate-800" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In to Agency Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Need agency access?{" "}
                <Link 
                  href="/register/agency" 
                  className="text-slate-700 hover:underline font-medium"
                  data-testid="link-register"
                >
                  Request Account
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Are you a citizen?{" "}
                <Link 
                  href="/login/citizen" 
                  className="text-blue-600 hover:underline"
                  data-testid="link-citizen-login"
                >
                  Citizen Portal
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800">Demo Credentials</p>
              <p className="text-xs text-yellow-700 mt-1">
                Username: <code className="bg-yellow-100 px-1 rounded">admin</code><br />
                Password: <code className="bg-yellow-100 px-1 rounded">admin123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}