import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20 pt-16">
      <TopNav />
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </header>

        {/* Profile Info */}
        <Card className="p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user?.name || "User"}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email || ""}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* Account Settings */}
        <Card className="p-6 shadow-card">
          <h3 className="text-xl font-semibold text-foreground mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-foreground">Email Notifications</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-foreground">Privacy Settings</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground">Data & Storage</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
