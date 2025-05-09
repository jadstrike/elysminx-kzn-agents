import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CircleUser } from "lucide-react";

const Index = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Finix AI";
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Optionally show a toast or alert here
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <BackgroundGradient />

      <div className="w-full max-w-3xl mb-8 text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-5xl font-bold tracking-tight text-gradient">
            Finix AI
          </h1>
          <p className="text-xl mt-4 text-gray-300">Your Daily AI Companion</p>
        </div>

        <div className="flex justify-center mt-8">
          {user ? (
            <Button
              asChild
              className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20 cursor-pointer"
            >
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2" />
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-96 md:w-[28rem] relative cursor-comic transform hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20 cursor-pointer"
              onClick={handleGoogleSignIn}
              disabled={isLoading || loading}
            >
              <div className="absolute -left-10 -top-10 bg-white/20 w-20 h-20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -right-10 -bottom-10 bg-purple-300/20 w-20 h-20 rounded-full blur-xl animate-pulse"></div>
              <span className="flex items-center justify-center gap-3 relative z-10">
                <CircleUser className="h-6 w-6" />
                {isLoading || loading ? "Signing in..." : "Sign in with Google"}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in">
        <p>© 2025 Finix AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
