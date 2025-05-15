import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { encryptData, decryptData } from "@/lib/encryption";
import type { Profile } from "@/integrations/supabase/types";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [geminiKey, setGeminiKey] = useState("");
  const [useCompanyKey, setUseCompanyKey] = useState<null | boolean>(null);
  const [saving, setSaving] = useState(false);
  const [geminiError, setGeminiError] = useState("");
  const geminiInputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState("");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

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
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSwitchToCompany = async () => {
    toast({
      title: "Coming Soon!",
      description:
        "The company key feature will be available soon. Please use your personal API key for now.",
    });
  };

  const handleSwitchToUserKey = async () => {
    setSaving(true);
    setGeminiError("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, use_company_key: false });
    if (error) {
      setGeminiError("Failed to switch to your key. Please try again later.");
      setSaving(false);
      return;
    }
    setUseCompanyKey(false);
    setSaving(false);
    toast({ title: "Switched to your Gemini API key" });
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
        console.error("Gemini key save error:", error);
        setGeminiError("Failed to save API key. Please try again later.");
        setSaving(false);
        return;
      }
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been securely saved.",
      });
      setSaving(false);
      setEditingKey(false);
    } catch (err) {
      console.error("Gemini key save error:", err);
      setGeminiError("Unexpected error. Please try again later.");
      setSaving(false);
    }
  };

  const handleGeminiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiKey(e.target.value);
    // Only set editing mode if the value actually changed
    if (e.target.value !== geminiKey) {
      setEditingKey(true);
    }
  };

  const handleModelSelect = async (model: string) => {
    setModelSaving(true);
    setModelError("");
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, gemini_model: model });
      if (error) {
        console.error("Error saving model:", error);
        setModelError(
          "Unable to save model preference. Please try signing out and signing back in."
        );
        setModelSaving(false);
        return;
      }
      setSelectedModel(model);
      toast({ title: `Gemini model set to ${model}` });
      setShowModelSelector(false);
      setModelSaving(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setModelError(
        "Unable to save model preference. Please try signing out and signing back in."
      );
      setModelSaving(false);
    }
  };

  const setupIncomplete =
    loadingProfile ||
    useCompanyKey === null ||
    (useCompanyKey === false && (!geminiKey || !selectedModel));

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative z-10 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container flex h-14 items-center px-4">
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-4">
              <UserAvatar user={user} />
              <span className="text-sm text-white">
                {user.user_metadata.full_name || user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
              >
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/40 glass-morphism border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              Welcome to your Dashboard!
            </h2>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-300 mb-2 md:mb-0">
                  <b>Current Model:</b>{" "}
                  {selectedModel
                    ? selectedModel
                        .split("-")
                        .map(
                          (part) => part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join(" ")
                    : "Not selected"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
                size="sm"
                className="min-w-[160px]"
              >
                Manage Settings
              </Button>
            </div>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-300 mb-2 md:mb-0">
                  <b>You are currently using:</b>{" "}
                  {useCompanyKey === null
                    ? "..."
                    : useCompanyKey
                    ? "Elysminx Agent's company key (limited)"
                    : "Your own Gemini API key (unlimited)"}
                </p>
              </div>
              <div className="flex gap-2 md:gap-4">
                <Button
                  variant={useCompanyKey === false ? "secondary" : "outline"}
                  onClick={handleSwitchToUserKey}
                  size="sm"
                  className="min-w-[160px]"
                  disabled={saving || useCompanyKey === false}
                >
                  Use my Gemini API key
                </Button>
                <Button
                  variant={useCompanyKey === true ? "secondary" : "outline"}
                  onClick={handleSwitchToCompany}
                  size="sm"
                  className="min-w-[160px]"
                  disabled={saving || useCompanyKey === true}
                >
                  Use company key
                </Button>
              </div>
            </div>

            {useCompanyKey === false && (!geminiKey || editingKey) && (
              <form
                onSubmit={handleGeminiSubmit}
                className="w-full max-w-lg mx-auto flex flex-col gap-4 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg"
                aria-live="polite"
              >
                <label className="text-white text-lg font-semibold">
                  {editingKey
                    ? "Update your Google Gemini API Key"
                    : "Enter your Google Gemini API Key"}
                </label>
                <span className="text-gray-400 text-sm mb-2 text-center">
                  We use your Gemini API key to enable advanced AI features.
                  <br />
                  Your key is stored securely and never shared.
                </span>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 w-full">
                    <input
                      ref={geminiInputRef}
                      type={showApiKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={handleGeminiKeyChange}
                      placeholder="Enter your Gemini API key"
                      className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition hover:bg-white/10"
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowApiKey(!showApiKey);
                      }}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span className="sr-only">
                        {showApiKey ? "Hide" : "Show"} API Key
                      </span>
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://aistudio.google.com/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 flex items-center justify-center p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          aria-label="Get your Gemini API key"
                        >
                          <HelpCircle className="w-5 h-5 text-indigo-300" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Get your Gemini API key from Google AI Studio
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-full flex justify-end">
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-300 hover:underline flex items-center gap-1"
                    >
                      Get your API key
                      <HelpCircle className="w-4 h-4 inline" />
                    </a>
                  </div>

                  {geminiError && (
                    <p className="text-red-400 text-sm">{geminiError}</p>
                  )}

                  {editingKey && (
                    <Button
                      type="submit"
                      disabled={saving || !geminiKey}
                      className="w-full"
                    >
                      {saving ? "Saving..." : "Save API Key"}
                    </Button>
                  )}
                </div>
              </form>
            )}

            {useCompanyKey === false && geminiKey && !editingKey && (
              <>
                <div className="w-full max-w-lg mx-auto flex flex-col gap-2 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                  <label className="text-white text-lg font-semibold mb-2">
                    Your saved Gemini API Key
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type={showApiKey ? "text" : "password"}
                      className="w-full rounded px-3 py-2 text-black"
                      value={geminiKey}
                      disabled
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition hover:bg-white/10"
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowApiKey((v) => !v);
                      }}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span>{showApiKey ? "Hide" : "Show"} API Key</span>
                    </Button>
                  </div>
                </div>

                <div className="w-full max-w-lg mx-auto flex flex-col gap-4 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                  <label className="text-white text-lg font-semibold mb-2">
                    Select your preferred Gemini model
                  </label>
                  <span className="text-gray-400 text-sm mb-2 text-center">
                    Choose the Gemini model that best fits your needs.
                  </span>
                  <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
                    <Button
                      variant={
                        selectedModel === "gemini-2.5-pro"
                          ? "secondary"
                          : "outline"
                      }
                      className="flex-1 min-w-[140px]"
                      onClick={() => handleModelSelect("gemini-2.5-pro")}
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
                      onClick={() => handleModelSelect("gemini-2.0-flash")}
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
                      onClick={() => handleModelSelect("gemini-1.5-pro")}
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
              <div className="w-full text-center text-white mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                <p>
                  You are using Elysminx Agent's free company key.
                  <br />
                  <b>Limited free tokens apply.</b>
                </p>
              </div>
            )}
          </div>

          {/* Bento-style options */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
              setupIncomplete
                ? "pointer-events-none opacity-50 blur-sm select-none"
                : ""
            }`}
            aria-disabled={setupIncomplete}
          >
            {/* Content AI Card */}
            <div
              onClick={() => !setupIncomplete && navigate("/content-ai")}
              className="group cursor-pointer bg-gradient-to-br from-indigo-700/60 to-purple-700/60 hover:from-indigo-600/80 hover:to-purple-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]"
            >
              <span className="text-4xl mb-4">🤖</span>
              <h3 className="text-2xl font-bold mb-2 text-white">Content AI</h3>
              <p className="text-gray-300 text-center mb-4">
                Generate, edit, and manage your content with AI-powered tools.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  !setupIncomplete && navigate("/content-ai");
                }}
                disabled={setupIncomplete}
              >
                Go to Content AI
              </Button>
            </div>

            {/* Built your own MCP Card */}
            <div
              onClick={() =>
                window.open(
                  "https://github.com/jadstrike/local-mcp.git",
                  "_blank"
                )
              }
              className="group cursor-pointer bg-gradient-to-br from-yellow-700/60 to-orange-700/60 hover:from-yellow-600/80 hover:to-orange-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]"
            >
              <span className="text-4xl mb-4">🛠️</span>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Built your own MCP
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Start building your own Model Context Protocol (MCP) agent.
                Open-source starter kit on GitHub.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    "https://github.com/jadstrike/local-mcp.git",
                    "_blank"
                  );
                }}
                disabled={setupIncomplete}
              >
                View on GitHub
              </Button>
            </div>

            {/* Agent-Rag Card */}
            <div
              onClick={() =>
                window.open(
                  "https://github.com/jadstrike/rag-agent.git",
                  "_blank"
                )
              }
              className="group cursor-pointer bg-gradient-to-br from-pink-700/60 to-red-700/60 hover:from-pink-600/80 hover:to-red-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]"
            >
              <span className="text-4xl mb-4">📚</span>
              <h3 className="text-2xl font-bold mb-2 text-white">Agent-Rag</h3>
              <p className="text-gray-300 text-center mb-4">
                Retrieval-Augmented Generation (RAG) agent template. Open-source
                on GitHub.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    "https://github.com/jadstrike/rag-agent.git",
                    "_blank"
                  );
                }}
                disabled={setupIncomplete}
              >
                View on GitHub
              </Button>
            </div>

            {/* LinkedIn Job Apply Card (Coming Soon) */}
            <div className="group cursor-not-allowed bg-gradient-to-br from-blue-700/60 to-cyan-700/60 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg opacity-60">
              <span className="text-4xl mb-4">💼</span>
              <h3 className="text-2xl font-bold mb-2 text-white">
                LinkedIn Job Apply
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Automate your job applications and track your progress on
                LinkedIn.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-not-allowed"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Gmail Agent Card (Coming Soon) */}
            <div className="group cursor-not-allowed bg-gradient-to-br from-green-700/60 to-teal-700/60 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg opacity-60">
              <span className="text-4xl mb-4">📧</span>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Gmail Agent
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Get AI-powered summaries of your Gmail inbox and important
                emails.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-not-allowed"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>

          {setupIncomplete && (
            <div className="mt-6 text-center text-yellow-300 text-lg font-semibold">
              Please complete your Gemini setup above to access all features.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
