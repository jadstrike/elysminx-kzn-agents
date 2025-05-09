import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundGradient from "@/components/BackgroundGradient";
import SignInForm from "@/components/SignInForm";

const Auth = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Sign In - Finix Content AI";
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <BackgroundGradient />
      
      <div className="w-full max-w-md mb-8 text-center animate-fade-in">
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Finix Content AI</h1>
        </div>
        <p className="text-gray-400 text-sm">Secure, fast, and beautiful authentication</p>
      </div>
      
      <SignInForm />
      
      <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in">
        <p>© 2025 Finix Content AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Auth;
