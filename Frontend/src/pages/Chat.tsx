import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Trash2 } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import Navigation from "@/components/Navigation";
import TopNav from "@/components/TopNav";
import { Card } from "@/components/ui/card";
import { chatAPI } from "@/services/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const response = await chatAPI.getHistory(50);
      return response.data?.messages || [];
    }
  });

  const messages: Message[] = historyData || [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      toast.loading('Getting AI response... This may take up to 30 seconds.', { id: 'sending-message' });
      return chatAPI.sendMessage(content);
    },
    onSuccess: () => {
      toast.dismiss('sending-message');
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setInput("");
    },
    onError: (error: any) => {
      toast.dismiss('sending-message');
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  });

  // Clear chat history mutation
  const clearMutation = useMutation({
    mutationFn: () => chatAPI.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history-widget'] });
      toast.success("Chat history cleared successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear chat history");
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate(input);
  };

  const suggestedQuestions = [
    "What order should I use my products?",
    "Can I use retinol with vitamin C?",
    "How to treat dry skin?",
    "Best products for anti-aging?",
  ];

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col pb-20 pt-16">
      <TopNav />
      <div className="max-w-screen-lg mx-auto px-4 py-8 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Advisor</h1>
                <p className="text-sm text-muted-foreground">Ask me anything about skincare</p>
              </div>
            </div>
            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your chat messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => clearMutation.mutate()}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <>
              <ChatMessage 
                role="assistant" 
                content="Hi! I'm your AI skincare advisor. Ask me anything about ingredients, product recommendations, or routine tips!" 
              />
              {/* Suggested Questions */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Quick questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Card
                      key={index}
                      className="p-3 cursor-pointer hover:shadow-card transition-smooth border-border"
                      onClick={() => setInput(question)}
                    >
                      <p className="text-sm text-foreground">{question}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={message._id || index} role={message.role} content={message.content} />
            ))
          )}
          {sendMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl bg-card border shadow-soft">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about ingredients, routines, or products..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="bg-card border-border"
          />
          <Button 
            onClick={handleSend} 
            className="bg-primary text-primary-foreground hover:opacity-90"
            size="icon"
            disabled={sendMutation.isPending || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;
