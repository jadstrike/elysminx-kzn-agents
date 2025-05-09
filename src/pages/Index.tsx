
import BackgroundGradient from "@/components/BackgroundGradient";
import SignInForm from "@/components/SignInForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <BackgroundGradient />
      
      <div className="w-full max-w-md mb-8 text-center animate-fade-in">
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Stellar Login</h1>
        </div>
        <p className="text-gray-400 text-sm">Secure, fast, and beautiful authentication</p>
      </div>
      
      <SignInForm />
      
      <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in">
        <p>© 2025 Stellar Login. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
