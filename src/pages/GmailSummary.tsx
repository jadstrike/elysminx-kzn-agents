import { useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ArrowLeft, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

export default function GmailSummary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const latestAIResponse =
    chatHistory.length > 0
      ? [...chatHistory].reverse().find((m) => m.role === "ai")?.content
      : "";

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    // Add user message to chat
    setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    const userMessage = input;
    setInput("");
    try {
      // Use the production n8n webhook URL for chat
      const res = await fetch(
        "https://elysminx.app.n8n.cloud/webhook/e3eacf1e-b697-4509-9724-626d23eb27fb",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: userMessage }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response from backend");
      }
      const data = await res.json();
      const aiResponse =
        typeof data.message === "string"
          ? data.message
          : JSON.stringify(data.message, null, 2);
      setChatHistory((prev) => [...prev, { role: "ai", content: aiResponse }]);
      setTimeout(() => {
        resultRef.current?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setTimeout(() => {
        resultRef.current?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 h-[80vh]">
          {/* Left: Chatbox */}
          <div className="flex-1 flex flex-col bg-black/40 rounded-lg p-4 max-h-full">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Gmail Agent</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-white/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    We use a secure service account to access and summarize
                    recent emails. <br />
                    <b>Your emails are never stored.</b>
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              {chatHistory.length === 0 && (
                <div className="text-white/50 text-center mt-8">
                  Start chatting with your Gmail Agent!
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`inline-block px-3 py-2 rounded-lg max-w-[80%] break-words ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
              {error && (
                <div
                  className="text-red-400 text-center mb-4 outline-none"
                  tabIndex={-1}
                  ref={resultRef}
                >
                  {error}
                  <Button
                    variant="outline"
                    className="ml-4"
                    onClick={() => setError("")}
                    disabled={loading}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading}
                autoFocus
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
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
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </div>
          {/* Right: Latest AI Response */}
          <div className="w-full md:w-1/2 flex flex-col">
            <Card className="p-6 bg-black/40 border-white/10 flex-1">
              <h2 className="text-xl font-semibold mb-4 text-white">
                AI Response
              </h2>
              <div className="whitespace-pre-line text-white font-mono text-base min-h-[120px] flex items-center justify-center">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-primary mr-2"
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
                    <span>AI is thinking...</span>
                  </>
                ) : latestAIResponse ? (
                  latestAIResponse
                ) : (
                  <span className="text-white/50">No response yet.</span>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
// Note: Gmail OAuth flow is commented out in the codebase but left for future use if needed.
