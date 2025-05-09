
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Stellar Login - Home";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <BackgroundGradient />
      
      <div className="w-full max-w-3xl mb-8 text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-5xl font-bold tracking-tight text-gradient">Stellar Login</h1>
          <p className="text-xl mt-4 text-gray-300">Secure, fast, and beautiful authentication</p>
        </div>
        
        <div className="flex justify-center mt-8">
          {user ? (
            <Button
              as={Link}
              to="/dashboard"
              className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20"
            >
              Go to Dashboard <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              as={Link}
              to="/auth"
              className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20"
            >
              Sign In <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in">
        <p>© 2025 Stellar Login. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
