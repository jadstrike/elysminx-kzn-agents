
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      toast({
        title: "Welcome to your dashboard",
        description: "You're now logged in and can access your data",
      });
    }
  }, [user, toast]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradient />
      
      <header className="relative z-10 p-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold text-gradient">Stellar Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm hidden sm:block">{user.user_metadata.full_name || user.email}</span>
          </div>
          
          <Button 
            variant="outline" 
            onClick={signOut}
            className="border border-white/20 hover:bg-white/10"
          >
            Sign out
          </Button>
        </div>
      </header>
      
      <main className="relative z-10 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/40 glass-morphism border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Welcome to your Dashboard!</h2>
            <p className="text-gray-300">
              You've successfully signed in with Google. This dashboard can be expanded
              with more features as you build your application.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 glass-morphism border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-2">Your Profile</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Name:</span> {user.user_metadata.full_name || "Not provided"}</p>
                <p><span className="text-gray-400">Email:</span> {user.email}</p>
                <p><span className="text-gray-400">User ID:</span> <span className="text-xs">{user.id}</span></p>
              </div>
            </div>
            
            <div className="bg-black/40 glass-morphism border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-2">Session Info</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Provider:</span> Google</p>
                <p><span className="text-gray-400">Last Sign In:</span> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
