import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Globe, 
  Plus, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  canAddToRecord?: boolean;
}

interface ChatAssistantProps {
  isDoctor?: boolean;
}

export const ChatAssistant = ({ isDoctor = false }: ChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: isDoctor 
        ? "Hello Dr. Rodriguez! I'm your AI assistant. I can help you summarize patient histories, generate SOAP notes, identify red flags, and answer medical questions. How can I assist you today?"
        : "Hello Sarah! I'm your healthcare assistant. I can help you track symptoms, understand your medications, prepare for appointments, and answer health questions. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
      canAddToRecord: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" }
  ];

  const suggestedPrompts = isDoctor ? [
    "Summarize patient's last 6 months",
    "List critical red flags",
    "Generate SOAP note template",
    "Drug interaction check",
    "Differential diagnosis help"
  ] : [
    "Explain my medications",
    "Track today's symptoms", 
    "Prepare for my appointment",
    "Medication reminder setup",
    "Understand my test results"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(messageContent, isDoctor),
        sender: "assistant",
        timestamp: new Date(),
        canAddToRecord: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string, isDoctor: boolean): string => {
    if (isDoctor) {
      if (userMessage.toLowerCase().includes("summarize")) {
        return "Based on Sarah Johnson's records: Last 6 months show well-controlled diabetes (HbA1c 7.2%), consistent medication adherence (85%), no severe hypoglycemic episodes. Recent symptoms include mild fatigue and occasional headaches. Blood pressure stable. Recommend continuing current regimen.";
      }
      if (userMessage.toLowerCase().includes("red flags")) {
        return "Critical alerts for current patient list: 1) Robert Wilson - Irregular heart rate + blood sugar spike, 2) Michael Chen - Uncontrolled hypertension (180/110), 3) No immediate critical flags for other patients. Recommend immediate follow-up for Wilson and Chen.";
      }
      return "I understand you're asking about medical management. Could you provide more specific details about the patient case or clinical question you'd like help with?";
    } else {
      if (userMessage.toLowerCase().includes("medication")) {
        return "Your current medications: Metformin 500mg twice daily for diabetes, Lisinopril 10mg once daily for blood pressure. Both are working well based on your recent tests. Remember to take Metformin with meals to avoid stomach upset.";
      }
      if (userMessage.toLowerCase().includes("symptom")) {
        return "I can help you track your symptoms. Would you like to add a new symptom to your timeline? Please describe what you're experiencing, when it started, and how severe it is (mild, moderate, or severe).";
      }
      return "I'm here to help with your healthcare questions. You can ask me about your medications, symptoms, upcoming appointments, or general health information.";
    }
  };

  const addToRecord = (message: Message) => {
    // Simulate adding to medical record
    console.log("Adding to record:", message.content);
    // In a real app, this would make an API call to update the patient record
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-hero text-white shadow-healthcare-large hover:scale-110 transition-all duration-200 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-healthcare-large z-50 flex flex-col animate-healthcare-scale-in">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Healthcare Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isDoctor ? "Medical AI Helper" : "Your Health Companion"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs border border-border rounded px-2 py-1 bg-background"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-3">
        {/* Suggested Prompts */}
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Suggested prompts:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => sendMessage(prompt)}
                className="text-xs h-6 px-2 bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 healthcare-scrollbar">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card-soft border border-border"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    {message.sender === "assistant" && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => 
                            isSpeaking ? stopSpeaking() : speakText(message.content)
                          }
                          className="h-6 w-6"
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                        {message.canAddToRecord && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => addToRecord(message)}
                            className="h-6 w-6"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 flex gap-2">
          <div className="flex-1 flex">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="rounded-r-none"
            />
            <Button
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              className="rounded-none border-l-0"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim()}
            className="btn-healthcare-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Status */}
        {(isListening || isSpeaking) && (
          <div className="flex-shrink-0 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="animate-healthcare-pulse">
              {isListening ? (
                <>
                  <Mic className="h-3 w-3 inline mr-1" />
                  Listening...
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 inline mr-1" />
                  Speaking...
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};