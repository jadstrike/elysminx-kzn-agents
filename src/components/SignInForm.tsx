
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CircleUser } from "lucide-react";

const SignInForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would be where you'd implement Supabase auth
      console.log("Sign in with:", formData);
      
      toast({
        title: "Sign in attempted",
        description: "This is a demo. Integration with Supabase would go here.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: "Please check your credentials and try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    try {
      // This would be where you'd implement Google auth with Supabase
      console.log("Google sign in clicked");
      
      toast({
        title: "Google Sign In",
        description: "This is a demo. Integration with Google auth would go here.",
      });
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
          <CardTitle className="text-3xl font-bold text-gradient">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-xs text-primary hover:text-primary/90 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center my-6">
            <Separator className="flex-1 bg-white/10" />
            <span className="mx-4 text-xs text-gray-400">OR</span>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <CircleUser className="h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-primary hover:text-primary/90 transition-colors">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInForm;
