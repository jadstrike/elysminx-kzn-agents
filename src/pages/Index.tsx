import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CircleUser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { encryptData, decryptData } from "@/lib/encryption";
import type { Profile } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const Index = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showGeminiPrompt, setShowGeminiPrompt] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiError, setGeminiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingGemini, setCheckingGemini] = useState(false);
  const geminiInputRef = useRef<HTMLInputElement>(null);
  const [useCompanyKey, setUseCompanyKey] = useState<null | boolean>(null);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Elysminx Agent";
  }, []);

  // Autofocus Gemini input when prompt appears
  useEffect(() => {
    if (showGeminiPrompt && geminiInputRef.current) {
      geminiInputRef.current.focus();
    }
  }, [showGeminiPrompt]);

  // Check if user needs to provide Gemini API key or model
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setCheckingGemini(true);

      try {
        const { data, error } = (await supabase
          .from("profiles")
          .select(
            "encrypted_gemini_key, gemini_key_iv, gemini_key_auth_tag, use_company_key, gemini_model"
          )
          .eq("id", user.id)
          .single()) as { data: Profile | null; error: any };

        if (error) throw error;

        if (data) {
          setUseCompanyKey(data.use_company_key);
          setSelectedModel(data.gemini_model || "");

          // Decrypt the API key if it exists
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
      } finally {
        setCheckingGemini(false);
      }
    };

    loadProfile();
  }, [user]);

  // Fetch remaining tokens if company key is selected
  useEffect(() => {
    if (useCompanyKey) {
      // TODO: Replace with real fetch from Supabase or your backend
      // Example: fetch(`/api/company-tokens?user=${user.id}`)
      setRemainingTokens(1000); // Placeholder
    }
  }, [useCompanyKey, user]);

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

  const handleGeminiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiError("");
    setSaving(true);
    try {
      // Encrypt the API key
      const { encryptedData, iv } = await encryptData(geminiKey);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        encrypted_gemini_key: encryptedData,
        gemini_key_iv: iv,
      });

      if (error) {
        setGeminiError("Failed to save API key. Please try again later.");
        setSaving(false);
        return;
      }
      setSaving(false);
      setEditingKey(false);
    } catch (err) {
      setGeminiError("Unexpected error. Please try again later.");
      setSaving(false);
    }
  };

  const handleModelSelect = async (model: string) => {
    setModelSaving(true);
    setModelError("");
    const { error } = await supabase
      .from("profiles")
      .update({ gemini_model: model })
      .eq("id", user.id);
    if (error) {
      setModelError("Failed to save model preference. Please try again.");
      setModelSaving(false);
      return;
    }
    setSelectedModel(model);
    setModelSaving(false);
    setShowGeminiPrompt(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <BackgroundGradient />

      <div className="w-full max-w-3xl mb-8 text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-5xl font-bold tracking-tight text-gradient">
            Elysminx Agent
          </h1>
          <p className="text-xl mt-4 text-gray-300">
            Faster Content, Faster Job Apply, MCPs
          </p>
        </div>

        <div className="flex justify-center mt-8">
          {user ? (
            checkingGemini ? (
              <div className="flex flex-col items-center" aria-live="polite">
                <svg
                  className="animate-spin h-6 w-6 text-white mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <div className="text-white text-lg">
                  Checking your API key...
                </div>
              </div>
            ) : showGeminiPrompt ? (
              <div
                className="w-full sm:w-96 md:w-[28rem] bg-black/40 glass-morphism border border-white/10 rounded-xl p-6 flex flex-col gap-4 items-center"
                aria-live="polite"
              >
                <label className="text-white text-lg font-semibold mb-2">
                  Choose how you want to use Elysminx Agent
                </label>
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    variant={useCompanyKey === false ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => setUseCompanyKey(false)}
                  >
                    Use your own Google Gemini API key (unlimited, free)
                  </Button>
                  <Button
                    variant={useCompanyKey === true ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => {}}
                    disabled
                  >
                    Use Elysminx Agent's free company key (coming soon)
                  </Button>
                </div>
                {useCompanyKey === false && (!geminiKey || editingKey) && (
                  <form
                    onSubmit={handleGeminiSubmit}
                    className="w-full flex flex-col gap-4 items-center mt-4"
                    aria-live="polite"
                  >
                    <label className="text-white text-lg font-semibold">
                      {editingKey
                        ? "Update your Google Gemini API Key"
                        : "Enter your Google Gemini API Key"}
                    </label>
                    <span className="text-gray-400 text-sm mb-2">
                      We use your Gemini API key to enable advanced AI features.
                      <br />
                      Your key is stored securely and never shared.
                    </span>
                    <input
                      type={showApiKey ? "text" : "password"}
                      className="w-full rounded px-3 py-2 text-black"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="sk-..."
                      required
                      disabled={saving}
                      ref={geminiInputRef}
                    />
                    <div className="flex w-full justify-between items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => setShowApiKey((v) => !v)}
                      >
                        {showApiKey ? "Hide" : "Show"} API Key
                      </Button>
                      {editingKey && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => setEditingKey(false)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    {geminiError && (
                      <div className="text-red-400 text-sm">{geminiError}</div>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={saving || !geminiKey}
                      aria-busy={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingKey
                        ? "Update API Key"
                        : "Save API Key"}
                    </Button>
                  </form>
                )}
                {useCompanyKey === false && geminiKey && !editingKey && (
                  <>
                    <div className="w-full flex flex-col gap-2 items-center mt-4 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                      <label className="text-white text-lg font-semibold mb-2">
                        Your saved Gemini API Key
                      </label>
                      <input
                        type={showApiKey ? "text" : "password"}
                        className="w-full rounded px-3 py-2 text-black"
                        value={geminiKey}
                        disabled
                        readOnly
                      />
                      <div className="flex w-full justify-between items-center mb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => setShowApiKey((v) => !v)}
                        >
                          {showApiKey ? "Hide" : "Show"} API Key
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setEditingKey(true)}
                        >
                          Update API Key
                        </Button>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-4 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                      <label className="text-white text-lg font-semibold mb-2">
                        Select your preferred Gemini model
                      </label>
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
                          Gemini 2.5 Pro has a daily usage limit. If the limit
                          is exceeded, use Gemini 2.0 Flash or 1.5 Pro.
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm mb-2 text-center">
                        Choose the model that best fits your needs.{" "}
                        <b>Gemini 2.0 Flash Lite</b> is best for free,
                        high-volume use.
                      </span>
                      <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
                        <Button
                          variant={
                            selectedModel === "gemini-2.5-pro"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex-1 min-w-[140px]"
                          onClick={() => setSelectedModel("gemini-2.5-pro")}
                          disabled={modelSaving}
                        >
                          Gemini 2.5 Pro
                          <span className="block text-xs text-white/60 font-normal mt-1">
                            Most capable for complex reasoning, coding, and
                            advanced tasks. May require billing.
                          </span>
                        </Button>
                        <Button
                          variant={
                            selectedModel === "gemini-2.5-flash"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex-1 min-w-[140px]"
                          onClick={() => setSelectedModel("gemini-2.5-flash")}
                          disabled={modelSaving}
                        >
                          Gemini 2.5 Flash
                          <span className="block text-xs text-white/60 font-normal mt-1">
                            Fastest Gemini model, great for chat, summarization,
                            and rapid responses. Generous free tier.
                          </span>
                        </Button>
                        <Button
                          variant={
                            selectedModel === "gemini-2.0-flash-lite"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex-1 min-w-[140px]"
                          onClick={() =>
                            setSelectedModel("gemini-2.0-flash-lite")
                          }
                          disabled={modelSaving}
                        >
                          Gemini 2.0 Flash Lite
                          <span className="block text-xs text-white/60 font-normal mt-1">
                            Lightweight, cost-effective, and very fast. Best for
                            simple, high-volume, or low-latency tasks. Most
                            permissive free tier.
                          </span>
                        </Button>
                      </div>
                      {modelError && (
                        <div className="text-red-400 text-sm w-full text-center">
                          {modelError}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {useCompanyKey === true && (
                  <div className="w-full text-center text-white mt-4">
                    <p>
                      You are using Elysminx Agent's free company key.
                      <br />
                      <b>
                        {remainingTokens !== null ? remainingTokens : "..."}
                      </b>{" "}
                      free tokens left this month.
                    </p>
                  </div>
                )}
                {(useCompanyKey === true ||
                  (useCompanyKey === false && geminiKey && selectedModel)) && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => navigate("/dashboard")}
                  >
                    Continue
                  </Button>
                )}
              </div>
            ) : null
          ) : (
            <Button
              type="button"
              className="w-full sm:w-96 md:w-[28rem] relative cursor-comic transform hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_8px_0px_0px_#4c1d95] hover:shadow-[0_4px_0px_0px_#4c1d95] hover:translate-y-1 border-4 border-white/20"
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
        <p>© 2025 Elysminx Agent. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
