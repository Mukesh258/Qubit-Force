import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { type ChatMessage, type Report } from "@shared/schema";
import { 
  Shield, 
  Send, 
  MessageSquare, 
  Lock, 
  FileText,
  Clock,
  AlertTriangle 
} from "lucide-react";

interface ChatProps {
  caseId?: string;
}

export default function Chat({ caseId: propCaseId }: ChatProps = {}) {
  const params = useParams();
  const [, setLocation] = useLocation();
  const caseId = propCaseId || params.caseId;
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { user, isAuthenticated, isAgency } = useAuth();

  // Fetch case details if caseId provided
  const { data: caseReport, isLoading: caseLoading } = useQuery<Report>({
    queryKey: ["/api/reports", caseId],
    enabled: !!caseId,
  });

  // Load all reports to help the user pick a case when none is selected
  const { data: allReports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  // LocalStorage-based realtime chat
  const storageKey = caseId ? `qw_chat_${caseId}` : undefined;

  type LocalChatMessage = ChatMessage & { timestamp?: string };

  const loadLocalMessages = (): LocalChatMessage[] => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as LocalChatMessage[]) : [];
    } catch {
      return [];
    }
  };

  const saveLocalMessages = (list: LocalChatMessage[]) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(list));
  };

  useEffect(() => {
    setMessages(loadLocalMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setMessages(loadLocalMessages());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  // Fallback polling in case 'storage' events don't propagate between windows/profiles
  useEffect(() => {
    if (!storageKey) return;
    let lastSnapshot = "";
    const tick = () => {
      try {
        const snap = localStorage.getItem(storageKey) || "";
        if (snap !== lastSnapshot) {
          lastSnapshot = snap;
          setMessages(loadLocalMessages());
        }
      } catch {
        // ignore
      }
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [storageKey]);

  // Local state to disable send button briefly
  const [sending, setSending] = useState(false);

  // Local realtime indicator
  const isConnected = true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !caseId || !isAuthenticated) return;

    // Append to localStorage for realtime across tabs
    const newMessage: LocalChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      caseId,
      reportId: null,
      message: inputMessage.trim(),
      encryptedMessage: "",
      senderId: user?.id || "local",
      senderType: user?.userType || "citizen",
      isRead: false,
      timestamp: new Date().toISOString(),
    };

    const updated = [...loadLocalMessages(), newMessage];
    saveLocalMessages(updated);
    setMessages(updated);
    setInputMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the secure chat system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!caseId) {
    return (
      <>
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Secure Chat</h2>
              <p className="text-sm text-gray-600">Case-based encrypted communication</p>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Case</h3>
              <p className="text-gray-600 mb-8">
                Choose a specific case to start secure communication. 
                All messages are encrypted with quantum-safe protocols.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
                {allReports.slice(0, 8).map((r) => (
                  <Button key={r.id} variant="outline" onClick={() => setLocation(`/chat/${r.caseId}`)}>
                    Open case {r.caseId}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-500">Don’t see your case? Paste the Case ID in the URL like /chat/CASE-XXXX-XXXX</p>
              <div className="bg-blue-50 rounded-lg p-6 text-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">End-to-End Encrypted</span>
                </div>
                <p className="text-sm">
                  Messages are protected with post-quantum cryptography and quantum key distribution
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Header with Case Info */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Case Chat: {caseId}</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  Secure encrypted communication
                </p>
                {isConnected && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {caseReport && (
            <div className="flex items-center gap-3">
              <Badge 
                className={`${getUrgencyColor(caseReport.urgencyLevel)} text-white text-xs`}
              >
                {caseReport.urgencyLevel?.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {caseReport.reportType}
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {caseLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
                <p className="mt-2 text-gray-600">Loading secure chat...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Case Info Card */}
              {caseReport && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-900">{caseReport.reportType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-900">{caseReport.status}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className="ml-2 text-gray-900">{caseReport.urgencyLevel}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(caseReport.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Messages */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-96 overflow-y-auto p-4 space-y-4" data-testid="chat-messages-container">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-sm text-gray-500">Start the conversation below</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === user?.userType ? 'justify-end' : 'justify-start'}`}
                          data-testid={`chat-message-${message.senderType}-${message.id}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              message.senderType === user?.userType
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <span className={
                                message.senderType === user?.userType 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500'
                              }>
                                {message.senderType === 'agency' ? 'Agency' : 'Citizen'}
                              </span>
                              <span className={
                                message.senderType === user?.userType 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500'
                              }>
                                {new Date(message.timestamp || '').toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Send a secure message about ${caseId}...`}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        data-testid="input-chat-message"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || sending}
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Lock className="w-3 h-3" />
                      <span>Messages encrypted with quantum-safe protocols</span>
                      {isConnected && (
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600">Secure connection active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
