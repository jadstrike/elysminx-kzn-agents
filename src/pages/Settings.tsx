import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { encryptData, decryptData } from "@/lib/encryption";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [geminiKey, setGeminiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("encrypted_gemini_key, gemini_key_iv, gemini_model")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setSelectedModel(data.gemini_model || "");
          if (data.encrypted_gemini_key && data.gemini_key_iv) {
            const decryptedKey = await decryptData(
              data.encrypted_gemini_key,
              data.gemini_key_iv
            );
            setGeminiKey(decryptedKey);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Failed to load your settings. Please try again.",
        });
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { encryptedData, iv } = await encryptData(geminiKey);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        encrypted_gemini_key: encryptedData,
        gemini_key_iv: iv,
        gemini_model: selectedModel,
      });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your API key and model preferences have been updated.",
      });

      // Notify other components to refetch the API key
      window.dispatchEvent(new Event("apiKeyUpdated"));

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "Failed to save your settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradient />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container flex h-14 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-white/90 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <UserAvatar user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-black/40 border-white/10">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Gemini API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="pr-24"
                    placeholder="Enter your Gemini API key"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Model</Label>
                <div className="w-full flex justify-center">
                  <div className="flex items-center gap-2 bg-yellow-100/90 border border-yellow-400 text-yellow-900 rounded-md px-4 py-2 mb-3 text-sm font-medium shadow-sm animate-fade-in">
                    <svg
                      className="h-4 w-4 text-yellow-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                    Gemini 2.5 Pro has a daily usage limit. If the limit is
                    exceeded, use Gemini 2.0 Flash or 1.5 Pro.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro"].map(
                    (model) => (
                      <Button
                        key={model}
                        variant={
                          selectedModel === model ? "secondary" : "outline"
                        }
                        onClick={() => setSelectedModel(model)}
                        className="w-full"
                      >
                        {model
                          .split("-")
                          .map(
                            (part) =>
                              part.charAt(0).toUpperCase() + part.slice(1)
                          )
                          .join(" ")}
                      </Button>
                    )
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
