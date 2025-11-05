import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingChatButton = () => {
  return (
    <Link to="/chat">
      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-glow z-40"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </Link>
  );
};

export default FloatingChatButton;
