import { Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

const TopNav = () => {
  const { currentStreak } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border shadow-card z-50">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Skinie Homie</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Streak Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary">
              <Flame className="w-5 h-5 text-primary-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-primary-foreground/80 font-medium">Streak</span>
                <span className="text-sm font-bold text-primary-foreground">{currentStreak} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
