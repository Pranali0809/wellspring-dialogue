import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, User, Send, ChevronDown, ChevronUp, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface PreAppointmentAssessmentProps {
  appointmentId: string;
}

export const PreAppointmentAssessment = ({ appointmentId }: PreAppointmentAssessmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/appointment/${appointmentId}/start-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error("Failed to start assessment");

      const data = await response.json();
      setAgentSessionId(data.agent_session_id);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages([assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start assessment");
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !agentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/appointment/${appointmentId}/agent-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_session_id: agentSessionId,
          message: inputMessage
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.finished) {
        setIsComplete(true);
        toast.success("Pre-Assessment Complete!");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-primary/20 hover:border-primary/40"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Pre-Appointment AI Assessment</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <Card className="card-healthcare">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              AI Health Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 && !isComplete ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Bot className="h-12 w-12 mx-auto text-primary opacity-50" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Start a conversation with our AI assistant to help prepare for your appointment.
                  The assistant will ask you questions about your symptoms and concerns.
                </p>
                <Button
                  onClick={startChat}
                  disabled={isLoading}
                  className="btn-healthcare-primary"
                >
                  {isLoading ? "Starting..." : "Start Chat with AI Assistant"}
                </Button>
              </div>
            ) : isComplete ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="font-semibold text-lg mb-2">Pre-Assessment Complete</h3>
                <p className="text-muted-foreground">
                  Your responses have been recorded and will be shared with your doctor before your appointment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.sender === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card-soft border border-border"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        {message.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your response..."
                    onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="btn-healthcare-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
