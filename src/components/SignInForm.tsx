
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CircleUser } from "lucide-react";

const SignInForm = () => {
  const { toast } = useToast();
  const { signInWithGoogle, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error with Google Sign In",
        description: "Could not authenticate with Google",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center animate-fade-in">
      <Card className="w-full max-w-md bg-black/40 glass-morphism border border-white/10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gradient">Welcome</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            type="button"
            className="w-full relative cursor-comic transform hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
