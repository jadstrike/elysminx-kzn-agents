import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CircleUser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
    document.title = "Finix AI";
  }, []);

  // Autofocus Gemini input when prompt appears
  useEffect(() => {
    if (showGeminiPrompt && geminiInputRef.current) {
      geminiInputRef.current.focus();
    }
  }, [showGeminiPrompt]);

  // Check if user needs to provide Gemini API key or model
  useEffect(() => {
    if (user) {
      setCheckingGemini(true);
      supabase
        .from("profiles")
        .select("gemini_api_key, gemini_model, use_company_key")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (!data || !data.gemini_api_key) {
            setShowGeminiPrompt(true);
            setGeminiKey("");
            setSelectedModel("");
          } else {
            setGeminiKey(data.gemini_api_key);
            setShowGeminiPrompt(true);
            setSelectedModel(data.gemini_model || "");
            // If model is also set, skip prompt and go to dashboard
            if (data.gemini_model) {
              setShowGeminiPrompt(false);
              navigate("/dashboard");
            }
          }
          setUseCompanyKey(
            typeof data?.use_company_key === "boolean"
              ? data.use_company_key
              : null
          );
          setCheckingGemini(false);
        });
    }
  }, [user, navigate]);

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
    const { error } = await supabase
      .from("profiles")
      .update({ gemini_api_key: geminiKey })
      .eq("id", user.id);
    if (error) {
      setGeminiError("Failed to save API key. Please try again later.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setGeminiError("");
    setSelectedModel(""); // Prompt for model selection
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
            Finix AI
          </h1>
          <p className="text-xl mt-4 text-gray-300">
            Secure, fast, and beautiful authentication
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
                  Choose how you want to use Finix AI
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
                    Use Finix AI's free company key (coming soon)
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
                      <span className="text-gray-400 text-sm mb-2 text-center">
                        Gemini 2.5 Pro has a daily usage limit. If the limit is
                        exceeded, use Gemini 2.0 Flash or 1.5 Pro.
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
                        </Button>
                        <Button
                          variant={
                            selectedModel === "gemini-2.0-flash"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex-1 min-w-[140px]"
                          onClick={() => setSelectedModel("gemini-2.0-flash")}
                          disabled={modelSaving}
                        >
                          Gemini 2.0 Flash
                        </Button>
                        <Button
                          variant={
                            selectedModel === "gemini-1.5-pro"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex-1 min-w-[140px]"
                          onClick={() => setSelectedModel("gemini-1.5-pro")}
                          disabled={modelSaving}
                        >
                          Gemini 1.5 Pro
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
                      You are using Finix AI's free company key.
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
        <p>© 2025 Finix AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
