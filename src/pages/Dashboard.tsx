import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      toast({
        title: "Welcome to your dashboard",
        description: "You're now logged in and can access your data",
      });
    }
  }, [user, toast]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradient />

      <header className="relative z-10 p-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold text-gradient">Finix Dashboard</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden sm:block">
              {user.user_metadata.full_name || user.email}
            </span>
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
            <h2 className="text-xl font-bold mb-4">
              Welcome to your Dashboard!
            </h2>
            <p className="text-gray-300">
              You've successfully signed in with Google. Choose an option below
              to get started.
            </p>
          </div>

          {/* Bento-style options */}
          <div
            onClick={() => navigate("/content-ai")}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Content AI Card */}
            <div className="group cursor-pointer bg-gradient-to-br from-indigo-700/60 to-purple-700/60 hover:from-indigo-600/80 hover:to-purple-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]">
              <span className="text-4xl mb-4">🤖</span>
              <h3 className="text-2xl font-bold mb-2 text-white">Content AI</h3>
              <p className="text-gray-300 text-center mb-4">
                Generate, edit, and manage your content with AI-powered tools.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={() => navigate("/content-ai")}
              >
                Go to Content AI
              </Button>
            </div>
            {/* Linkedin Job Apply Card */}
            <div
              onClick={() => navigate("/job-apply")}
              className="group cursor-pointer bg-gradient-to-br from-blue-700/60 to-cyan-700/60 hover:from-blue-600/80 hover:to-cyan-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]"
            >
              <span className="text-4xl mb-4">💼</span>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Linkedin Job Apply
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Automate your job applications and track your progress on
                Linkedin.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={() => navigate("/job-apply")}
              >
                Go to Job Apply
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
