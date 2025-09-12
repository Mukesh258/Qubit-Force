import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, MessageSquare, Lock, Eye, BarChart3 } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Shield className="h-20 w-20 text-blue-600" />
                <div className="absolute inset-0 bg-blue-100 rounded-full -z-10 transform scale-150 animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Qubit Force
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Secure Whistleblowing & Emergency Reporting Network with
              Post-Quantum Cryptography, Real-time Chat, and Blockchain Verification
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto"
                data-testid="button-citizen-portal"
              >
                <Link href="/login/citizen">
                  <Users className="mr-2 h-5 w-5" />
                  Citizen Portal
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                data-testid="button-agency-portal"
              >
                <Link href="/login/agency">
                  <Shield className="mr-2 h-5 w-5" />
                  Agency Portal
                </Link>
              </Button>
              <Button 
                asChild 
                variant="secondary" 
                size="lg" 
                className="w-full sm:w-auto"
                data-testid="button-anonymous-report"
              >
                <Link href="/report/anonymous">
                  <FileText className="mr-2 h-5 w-5" />
                  Submit Anonymous Report
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Security Features
            </h2>
            <p className="text-lg text-gray-600">
              Protecting your identity with cutting-edge quantum cryptography
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-blue-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Lock className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Post-Quantum Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Secure your reports with Kyber-1024 and Dilithium-3 algorithms, 
                  protecting against both classical and quantum computer attacks.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <MessageSquare className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-green-900">Secure Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Communicate safely with agencies through encrypted chat channels 
                  using your unique case ID for anonymous access.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <BarChart3 className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-purple-900">Blockchain Logging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Every report is immutably logged on blockchain for transparency 
                  and tamper-proof verification of data integrity.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, secure, and anonymous reporting process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Report</h3>
              <p className="text-gray-600 text-sm">
                Submit your report with quantum encryption protection
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Case ID</h3>
              <p className="text-gray-600 text-sm">
                Receive a unique case ID for tracking and communication
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Chat</h3>
              <p className="text-gray-600 text-sm">
                Communicate safely with agencies using your case ID
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Monitor your case status and receive updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">Qubit Force</span>
              </div>
              <p className="text-gray-400">
                Advanced cryptographic protection for whistleblowers and emergency reporting.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Quantum Key Distribution (BB84)</li>
                <li>• Post-Quantum Cryptography</li>
                <li>• Blockchain Verification</li>
                <li>• Anonymous Reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Real-time Secure Chat</li>
                <li>• Case ID Tracking</li>
                <li>• Multi-Agency Support</li>
                <li>• Incident Analytics</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Qubit Force. Protecting voices with quantum security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}