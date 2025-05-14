import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function GmailAuth() {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGmailConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/gmail-callback`;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const scope =
        "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent`;
      const state = Math.random().toString(36).substring(7);
      await supabase.from("oauth_states").insert({
        user_id: user.id,
        state,
        provider: "gmail",
      });
      window.location.href = `${authUrl}&state=${state}`;
    } catch (error) {
      console.error("Gmail connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect Gmail. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGmailConnect}
        disabled={isConnecting}
        className="w-full"
        variant="outline"
      >
        {isConnecting ? "Connecting..." : "Connect Gmail"}
      </Button>
    </div>
  );
}
