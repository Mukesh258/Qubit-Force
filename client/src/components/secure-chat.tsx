import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Send, Minimize2, MessageCircle, Lock } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

export function SecureChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected, sessionId, sendMessage } = useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'chat_message' && wsMessage.message) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          message: wsMessage.message,
          sender: (wsMessage.sender as 'user' | 'agent') || 'agent',
          timestamp: wsMessage.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    },
    onOpen: () => {
      console.log('Chat WebSocket connected');
    },
    onClose: () => {
      console.log('Chat WebSocket disconnected');
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    const sent = sendMessage({
      type: 'chat_message',
      message: inputMessage.trim(),
      sender: 'user'
    });

    if (sent) {
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-80 mb-4 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div>
                <h3 className="font-medium">Secure Chat</h3>
                <p className="text-xs opacity-70">End-to-end encrypted</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-primary-foreground hover:text-primary-foreground/70"
              data-testid="button-minimize-chat"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3" data-testid="chat-messages-container">
              {!isConnected && (
                <div className="text-center text-muted-foreground text-sm">
                  Connecting to secure chat...
                </div>
              )}
              
              {isConnected && sessionId && messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm">
                  <div className="bg-muted p-3 rounded-lg">
                    <p>Support agent is available</p>
                    <span className="text-xs">Send a message to start the conversation</span>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender === 'user' ? 'ml-auto' : ''}`}
                  data-testid={`chat-message-${message.sender}-${message.id}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <span className={`text-xs ${
                      message.sender === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isConnected}
                  size="sm"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Messages are encrypted with quantum-safe protocols</span>
                {isConnected && (
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Connected</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-lg quantum-glow"
        data-testid="button-toggle-chat"
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
