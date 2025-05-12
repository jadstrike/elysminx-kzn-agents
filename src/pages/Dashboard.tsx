import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch profile from DB on mount and upsert a row if missing
  useEffect(() => {
    if (user && typeof user.id === "string" && user.id.length > 0) {
      setLoadingProfile(true);
      // Upsert a row with just the user's id to guarantee existence
      supabase
        .from("profiles")
        .upsert({ id: user.id })
        .then(() => {
          supabase
            .from("profiles")
            .select("gemini_api_key, gemini_model, use_company_key")
            .eq("id", user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("Supabase error:", error);
                setLoadingProfile(false);
                return;
              }
              setGeminiKey(data?.gemini_api_key || "");
              setSelectedModel(data?.gemini_model || "");
              setUseCompanyKey(
                typeof data?.use_company_key === "boolean"
                  ? data.use_company_key
                  : null
              );
              setLoadingProfile(false);
            });
        });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Update use_company_key in DB
  const handleSwitchToCompany = async () => {
    setSaving(true);
    setGeminiError("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, use_company_key: true });
    if (error) {
      setGeminiError(
        "Failed to switch to company key. Please try again later."
      );
      setSaving(false);
      return;
    }
    setUseCompanyKey(true);
    setSaving(false);
    toast({ title: "Switched to company key" });
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

  // Save Gemini API key
  const handleGeminiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiError("");
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, gemini_api_key: geminiKey });
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

  // Save Gemini model
  const handleModelSelect = async (model: string) => {
    setModelSaving(true);
    setModelError("");
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, gemini_model: model });
      if (error) {
        setModelError("Failed to save model preference. Please try again.");
        setModelSaving(false);
        return;
      }
      setSelectedModel(model);
      toast({ title: `Gemini model set to ${model}` });
      setShowModelSelector(false);
      setModelSaving(false);
    } catch (err) {
      setModelError("Unexpected error. Please try again.");
      setModelSaving(false);
    }
  };

  // Block main features until setup is complete
  const setupIncomplete =
    loadingProfile ||
    useCompanyKey === null ||
    (useCompanyKey === false && (!geminiKey || !selectedModel));

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradient />
      <header className="relative z-10 p-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold text-gradient">Finix Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden sm:block">
              {user.user_metadata.full_name || user.email}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="border border-white/20 hover:bg-white/10"
          >
            Sign out
          </Button>
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
                  <b>You are currently using:</b>{" "}
                  {useCompanyKey === null
                    ? "..."
                    : useCompanyKey
                    ? "Finix AI's company key (limited)"
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
            {/* Only show API key form if useCompanyKey === false and (!geminiKey || editingKey) */}
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
                  <div className="text-red-400 text-sm w-full text-center">
                    {geminiError}
                  </div>
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
            {/* If useCompanyKey === false and geminiKey exists and not editing, show saved key (masked) and model selection UI */}
            {useCompanyKey === false && geminiKey && !editingKey && (
              <div className="w-full max-w-lg mx-auto flex flex-col gap-2 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
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
            )}
            {/* If both key and model are present, show current model and allow switching */}
            {useCompanyKey === false &&
              geminiKey &&
              selectedModel &&
              !showModelSelector && (
                <div className="w-full max-w-lg mx-auto flex flex-col gap-4 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                  <label className="text-white text-lg font-semibold mb-2">
                    Your current Gemini model
                  </label>
                  <span className="text-gray-400 text-sm mb-2 text-center">
                    <b>
                      {selectedModel === "gemini-2.5-pro"
                        ? "Gemini 2.5 Pro"
                        : selectedModel === "gemini-2.0-flash"
                        ? "Gemini 2.0 Flash"
                        : selectedModel === "gemini-1.5-pro"
                        ? "Gemini 1.5 Pro"
                        : selectedModel}
                    </b>
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setShowModelSelector(true)}
                    className="w-full"
                  >
                    Switch Gemini Model
                  </Button>
                </div>
              )}
            {/* Show model selection if switching or if key is present but no model selected */}
            {useCompanyKey === false &&
              geminiKey &&
              (!selectedModel || showModelSelector) && (
                <div className="w-full max-w-lg mx-auto flex flex-col gap-4 items-center mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
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
                      onClick={async () => {
                        await handleModelSelect("gemini-2.5-pro");
                        setShowModelSelector(false);
                      }}
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
                      onClick={async () => {
                        await handleModelSelect("gemini-2.0-flash");
                        setShowModelSelector(false);
                      }}
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
                      onClick={async () => {
                        await handleModelSelect("gemini-1.5-pro");
                        setShowModelSelector(false);
                      }}
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
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => setShowModelSelector(false)}
                    disabled={modelSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            {/* If both key and model are present, show neither form */}
            {useCompanyKey === true && (
              <div className="w-full text-center text-white mt-6 bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg">
                <p>
                  You are using Finix AI's free company key.
                  <br />
                  <b>Limited free tokens apply.</b>
                </p>
              </div>
            )}
          </div>

          {/* Bento-style options */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
              setupIncomplete
                ? "pointer-events-none opacity-50 blur-sm select-none"
                : ""
            }`}
            aria-disabled={setupIncomplete}
          >
            {/* Content AI Card */}
            <div className="group cursor-pointer bg-gradient-to-br from-indigo-700/60 to-purple-700/60 hover:from-indigo-600/80 hover:to-purple-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]">
              <span className="text-4xl mb-4">🤖</span>
              <h3 className="text-2xl font-bold mb-2 text-white">Content AI</h3>
              <p className="text-gray-300 text-center mb-4">
                Generate, edit, and manage your content with AI-powered tools.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={() => navigate("/content-ai")}
                disabled={setupIncomplete}
              >
                Go to Content AI
              </Button>
            </div>
            {/* Linkedin Job Apply Card */}
            <div
              onClick={() => !setupIncomplete && navigate("/job-apply")}
              className="group cursor-pointer bg-gradient-to-br from-blue-700/60 to-cyan-700/60 hover:from-blue-600/80 hover:to-cyan-600/80 glass-morphism border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:scale-[1.03]"
            >
              <span className="text-4xl mb-4">💼</span>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Linkedin Job Apply
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Automate your job applications and track your progress on
                Linkedin.
              </p>
              <Button
                variant="secondary"
                className="mt-auto cursor-pointer"
                onClick={() => navigate("/job-apply")}
                disabled={setupIncomplete}
              >
                Go to Job Apply
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
