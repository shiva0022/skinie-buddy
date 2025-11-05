import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakTracker = ({ currentStreak, longestStreak }: StreakTrackerProps) => {
  return (
    <Card className="p-6 shadow-card bg-gradient-primary border-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-primary-foreground/80 font-medium">Current Streak</p>
            <p className="text-3xl font-bold text-primary-foreground">{currentStreak} days</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <span className="text-sm text-primary-foreground/80">Longest Streak</span>
          <span className="text-lg font-semibold text-primary-foreground">{longestStreak} days</span>
        </div>
      </div>
    </Card>
  );
};

export default StreakTracker;
