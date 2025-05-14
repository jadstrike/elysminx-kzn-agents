import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import BackgroundGradient from "@/components/BackgroundGradient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GmailAuth from "@/integrations/gmail/GmailAuth";

export default function GmailSummary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryType, setSummaryType] = useState("daily");
  const [emailCount, setEmailCount] = useState("10");
  const [summary, setSummary] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      // TODO: Implement Gmail OAuth connection
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated delay
      setIsConnected(true);
      toast({
        title: "Gmail Connected",
        description: "Successfully connected to your Gmail account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Gmail. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement actual Gmail fetching and summarization
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
      setSummary(`Here's your ${summaryType} email summary:
      
1. Project Update from Team Lead
   Priority: High
   Key Points: Sprint review scheduled, new features discussed

2. Client Meeting Follow-up
   Priority: Medium
   Action Items: Send proposal by Friday

3. Newsletter Subscription
   Type: Marketing
   Content: Latest tech trends and updates

... More emails summarized here...`);

      toast({
        title: "Summary Generated",
        description: "Your email summary has been generated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate summary. Please try again.",
      });
    } finally {
      setIsGenerating(false);
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
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-black/40 border-white/10">
            <h2 className="text-2xl font-bold mb-6">Gmail Agent</h2>

            {!isConnected ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-4">
                  Connect Your Gmail Account
                </h3>
                <p className="text-gray-400 mb-6">
                  Connect your Gmail account to start generating AI-powered
                  summaries of your emails.
                </p>
                <GmailAuth />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Summary Type</Label>
                    <Select value={summaryType} onValueChange={setSummaryType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select summary type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                        <SelectItem value="unread">Unread Emails</SelectItem>
                        <SelectItem value="important">
                          Important Emails
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Emails</Label>
                    <Select value={emailCount} onValueChange={setEmailCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Last 5 Emails</SelectItem>
                        <SelectItem value="10">Last 10 Emails</SelectItem>
                        <SelectItem value="20">Last 20 Emails</SelectItem>
                        <SelectItem value="50">Last 50 Emails</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? "Generating Summary..." : "Generate Summary"}
                </Button>

                {summary && (
                  <div className="mt-6">
                    <Label className="mb-2">Summary</Label>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
