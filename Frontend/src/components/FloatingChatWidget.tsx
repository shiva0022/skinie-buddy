import { MessageSquare, X, Send, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatAPI } from "@/services/api";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
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

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: historyData } = useQuery({
    queryKey: ['chat-history-widget'],
    queryFn: async () => {
      const response = await chatAPI.getHistory(10); // Show last 10 messages in widget
      return response.data?.messages || [];
    },
    enabled: isOpen, // Only fetch when widget is open
  });

  const messages: Message[] = historyData || [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      toast.loading('Getting AI response...', { id: 'widget-sending-message' });
      return chatAPI.sendMessage(content);
    },
    onSuccess: () => {
      toast.dismiss('widget-sending-message');
      queryClient.invalidateQueries({ queryKey: ['chat-history-widget'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history'] }); // Update main chat page too
      setInput("");
    },
    onError: (error: any) => {
      toast.dismiss('widget-sending-message');
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  });

  // Clear chat history mutation
  const clearMutation = useMutation({
    mutationFn: () => chatAPI.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history-widget'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      toast.success("Chat history cleared!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear chat");
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

  return (
    <>
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-glow z-40"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-96 shadow-glow z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-primary">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
              <h3 className="font-semibold text-primary-foreground">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Chat?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all messages. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => clearMutation.mutate()}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p>Ask me anything about skincare!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={message._id || index} role={message.role} content={message.content} />
              ))
            )}
            {sendMutation.isPending && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="flex gap-1 items-center p-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              type="text"
              placeholder="Ask about skincare..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="text-sm"
              disabled={sendMutation.isPending}
            />
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={sendMutation.isPending || !input.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default FloatingChatWidget;
