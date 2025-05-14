import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { encryptData } from "@/lib/encryption";
import { toast } from "@/components/ui/use-toast";

export default function GmailCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Failed to connect Gmail. Please try again.",
        });
        navigate("/gmail-agent");
        return;
      }

      if (!code || !state) {
        toast({
          variant: "destructive",
          title: "Invalid Request",
          description: "Missing required parameters.",
        });
        navigate("/gmail-agent");
        return;
      }

      try {
        // Verify state from database
        const { data: stateData, error: stateError } = await supabase
          .from("oauth_states")
          .select()
          .eq("user_id", user.id)
          .eq("state", state)
          .eq("provider", "gmail")
          .single();
        if (stateError || !stateData) throw new Error("Invalid state");

        // Exchange code for tokens
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: `${window.location.origin}/gmail-callback`,
              grant_type: "authorization_code",
            }),
          }
        );
        if (!tokenResponse.ok)
          throw new Error("Failed to exchange code for tokens");
        const tokens = await tokenResponse.json();

        // Encrypt tokens before storing
        const { encryptedData: encryptedAccessToken, iv: accessTokenIv } =
          await encryptData(tokens.access_token);
        const { encryptedData: encryptedRefreshToken, iv: refreshTokenIv } =
          await encryptData(tokens.refresh_token);

        // Store encrypted tokens in database
        await supabase.from("gmail_tokens").upsert({
          user_id: user.id,
          access_token: encryptedAccessToken,
          access_token_iv: accessTokenIv,
          refresh_token: encryptedRefreshToken,
          refresh_token_iv: refreshTokenIv,
          expires_at: new Date(
            Date.now() + tokens.expires_in * 1000
          ).toISOString(),
        });

        // Clean up used state
        await supabase
          .from("oauth_states")
          .delete()
          .eq("user_id", user.id)
          .eq("state", state)
          .eq("provider", "gmail");

        toast({
          title: "Gmail Connected",
          description: "Successfully connected your Gmail account.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect Gmail. Please try again.",
        });
      }
      navigate("/gmail-agent");
    };
    handleCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connecting Gmail...</h2>
        <p className="text-gray-400">
          Please wait while we complete the connection.
        </p>
      </div>
    </div>
  );
}
