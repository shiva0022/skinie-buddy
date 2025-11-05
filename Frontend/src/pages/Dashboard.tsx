import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Award, CheckCircle2, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { streaksAPI } from "@/services/api";

const Dashboard = () => {
  const { currentStreak, longestStreak } = useAuth();
  const queryClient = useQueryClient();
  const [weeklyCompletion, setWeeklyCompletion] = useState<boolean[]>([false, false, false, false, false, false, false]);
  
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: () => streaksAPI.update(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success("Routine completed! Keep up the great work!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update streak");
    }
  });
  
  const handleCompleteRoutine = () => {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    const newWeekly = [...weeklyCompletion];
    newWeekly[dayIndex] = true;
    setWeeklyCompletion(newWeekly);
    
    updateStreakMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gradient-subtle pb-20 pt-16">
      <TopNav />
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Routine Streak Card */}
        <Card className="p-6 shadow-card mb-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Routine Streak</h2>
              <p className="text-sm text-muted-foreground">Keep your consistency going</p>
            </div>
          </div>

          {/* Current and Best Streak */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold text-foreground">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
            </Card>

            <Card className="p-4 bg-accent/5 border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground font-medium">Best Streak</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold text-foreground">{longestStreak}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
            </Card>
          </div>

          {/* Last 7 Days */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Last 7 Days</p>
            </div>
            <div className="flex gap-2">
              {days.map((day, index) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                    weeklyCompletion[index] 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted/30 border-2 border-dashed border-muted-foreground/20'
                  }`}>
                    {weeklyCompletion[index] ? (
                      <Flame className="w-5 h-5" />
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Button */}
          <Button 
            onClick={handleCompleteRoutine}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
            disabled={updateStreakMutation.isPending}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {updateStreakMutation.isPending ? "Updating..." : "Complete Today's Routine"}
          </Button>
        </Card>
      </div>

      <FloatingChatWidget />
      <Navigation />
    </div>
  );
};

export default Dashboard;
