import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiMagicFill } from "react-icons/ri";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { decryptData } from "@/lib/encryption";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { Database } from "@/types/supabase";

export default function ContentGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetAge, setTargetAge] = useState("");
  const [location, setLocation] = useState("");
  const [marketingPurpose, setMarketingPurpose] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [contentPurpose, setContentPurpose] = useState("");
  const [contentTone, setContentTone] = useState("");
  const [emotion, setEmotion] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>("gemini-1.5-flash");
  const [editedContent, setEditedContent] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [previousContents, setPreviousContents] = useState<
    Database["public"]["Tables"]["user_generated_content"]["Row"][]
  >([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  // Add a custom event listener to refetch profile when API key is updated
  useEffect(() => {
    const handleApiKeyUpdated = () => {
      fetchProfile();
    };
    window.addEventListener("apiKeyUpdated", handleApiKeyUpdated);
    return () => {
      window.removeEventListener("apiKeyUpdated", handleApiKeyUpdated);
    };
  }, [user]);

  // Refactor fetchProfile to be outside useEffect so it can be called from the event
  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = (await supabase
      .from("profiles")
      .select("encrypted_gemini_key, gemini_key_iv, gemini_model")
      .eq("id", user.id)
      .single()) as {
      data: import("@/integrations/supabase/types").Profile | null;
      error: any;
    };
    if (error || !data) return;
    if (data.encrypted_gemini_key && data.gemini_key_iv) {
      const key = await decryptData(
        data.encrypted_gemini_key,
        data.gemini_key_iv
      );
      setApiKey(key);
    }
    if (data.gemini_model) setModel(data.gemini_model);
  };

  // Update the original useEffect to call fetchProfile
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image under 10MB",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
      });
      return;
    }

    // Create a preview URL for the image
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });
  };

  // Cleanup preview URL when component unmounts or image changes
  React.useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  // Helper to convert image to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Retry Gemini API call once on internal error
  async function safeGenerateContent(
    ai: any,
    model: string,
    contents: any,
    systemInstruction: string
  ) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
    } catch (error: any) {
      const msg = error?.message || error?.error?.message || "";
      if (msg.toLowerCase().includes("internal error")) {
        // Wait and retry once
        await new Promise((res) => setTimeout(res, 1500));
        return await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction },
        });
      }
      throw error;
    }
  }

  // Fetch previous generated content
  const fetchPreviousContents = async () => {
    if (!user) return;
    setLoadingPrevious(true);
    const { data, error } = await supabase
      .from("user_generated_content")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (!error && data) setPreviousContents(data);
    setLoadingPrevious(false);
  };

  useEffect(() => {
    if (user) fetchPreviousContents();
  }, [user]);

  // Store generated content after generation
  const storeGeneratedContent = async (content: string) => {
    if (!user) return;
    const parameters = {
      targetAge,
      location,
      marketingPurpose,
      productDetails,
      contentPurpose,
      contentTone,
      emotion,
      model,
    };
    await supabase.from("user_generated_content").insert({
      user_id: user.id,
      content,
      parameters,
    });
    fetchPreviousContents();
  };

  // Update handleGenerate to store content
  const handleGenerate = async () => {
    if (!user) {
      setApiError("You must be signed in to generate content.");
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate content",
      });
      return;
    }
    if (!apiKey) {
      setApiError(
        "Missing Gemini API Key. Please set your Gemini API key in settings."
      );
      toast({
        variant: "destructive",
        title: "Missing Gemini API Key",
        description: "Please set your Gemini API key in settings.",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedContent("");
    setEditedContent("");
    setApiError("");
    try {
      const ai = new GoogleGenAI({ apiKey });
      // Build prompt
      const promptText = `Generate marketing content for the following product.\n\nIMPORTANT: ONLY output the final marketing content. Do NOT include any explanations, reasoning, or your thinking process.\n\n- Target Age: ${targetAge}\n- Location: ${location}\n- Marketing Purpose: ${marketingPurpose}\n- Product Details: ${productDetails}\n- Content Purpose: ${contentPurpose}\n- Content Tone: ${contentTone}\n- Emotion: ${emotion}${
        selectedImage ? "\n- Use the attached image as a visual reference." : ""
      }`;
      let contents;
      if (selectedImage) {
        // Upload the image and get a URI
        const imageFile = selectedImage.file;
        const uploaded = await ai.files.upload({ file: imageFile });
        contents = [
          createUserContent([
            promptText,
            createPartFromUri(uploaded.uri, uploaded.mimeType),
          ]),
        ];
      } else {
        contents = [createUserContent([promptText])];
      }
      const systemInstruction = `You are a digital marketing content creator powered by Google Gemini, specializing in producing social media content for the UK market. Your sole purpose is to generate high-quality, compliant social media posts based on user input.\n\nCore Responsibilities:\n- Create social media content (e.g., posts, captions, tweets) as specified by the user, tailored for UK audiences.\n- Ensure content uses British English, incorporates UK-specific cultural references, holidays (e.g., Bank Holidays), and consumer trends, and is optimized for engagement.\n- Comply with UK legal standards, including GDPR for data protection and ASA advertising regulations.\n- Include emojis when appropriate, based on the tone and style provided in the user's input.\n\nContent Standards:\n- Use British English with correct spelling (e.g., "optimise", "colour"), grammar, and UK date formats (dd/mm/yyyy).\n- Ensure content is accurate, well-structured, plagiarism-free, and uses the metric system with UK-specific terminology (e.g., "high street" for retail).\n- Maintain high-quality standards suitable for professional social media marketing.\n\nEthical and Legal Guidelines:\n- Adhere strictly to GDPR and ASA regulations. Do not collect, store, or process personal data without explicit user consent.\n- Ensure content is inclusive, culturally sensitive, and respects the diversity of UK audiences.\n- Avoid unethical practices or violating intellectual property rights.\n\nConstraints:\n- Do not access real-time data unless provided by the user. Rely on your training to simulate insights.\n- Avoid generating non-text elements (e.g., images) unless explicitly requested.\n- Take time to process and think through the user's request to ensure the output aligns with their specifications.\n\nOutput:\n- Deliver only the requested social media content in the format specified by the user (e.g., plain text for posts or captions).\n- Apply tone, style, emotion and emoji usage as provided in the user's input.\n- Do not include explanations, commentary, or additional information unless explicitly requested.`;
      // Use safeGenerateContent for retry logic
      const response = await safeGenerateContent(
        ai,
        model,
        contents,
        systemInstruction
      );
      setGeneratedContent(
        response.text || "No content generated. Try different parameters."
      );
      setEditedContent(response.text || "");
      setApiError("");
      if (response.text) {
        await storeGeneratedContent(response.text);
      }
    } catch (error: any) {
      // If error is an API error with a 'message' property, show only that message
      let displayMessage = "";
      if (typeof error === "string") {
        displayMessage = error;
      } else if (error?.error?.message) {
        displayMessage = error.error.message;
      } else if (error?.message) {
        displayMessage = error.message;
      } else if (error?.toString) {
        displayMessage = error.toString();
      } else {
        displayMessage =
          "AI generation failed. Please check your API key and model.";
      }

      // Check for rate limit error
      if (
        displayMessage &&
        (displayMessage.toLowerCase().includes("rate limit") ||
          displayMessage.toLowerCase().includes("too many requests") ||
          error?.status === 429)
      ) {
        setApiError(
          "You have reached the Gemini API rate limit for your current tier. Please wait a minute and try again. " +
            "Learn more about rate limits in the " +
            "[Gemini API documentation](https://ai.google.dev/gemini-api/docs/rate-limits#free-tier_1)."
        );
      } else if (
        displayMessage &&
        displayMessage.toLowerCase().includes("internal error")
      ) {
        setApiError(
          "An internal error occurred while processing your image. This may be a temporary issue with the Gemini API or your image file. Please try a different image, reduce the file size, or try again later."
        );
      } else if (
        displayMessage &&
        displayMessage.toLowerCase().includes("unavailable")
      ) {
        setApiError(
          "The Gemini AI model is unavailable to respond right now. Please try again later."
        );
      } else {
        setApiError(displayMessage);
      }
      setGeneratedContent("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete content (soft delete)
  const handleDeleteContent = async (id: string) => {
    await supabase
      .from("user_generated_content")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    setPreviousContents((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Deleted", description: "Content deleted." });
  };

  // Copy content
  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gradient">
        AI Content Generator
      </h1>
      {apiError && (
        <div className="mb-4 text-center text-red-400 bg-red-900/30 border border-red-500 rounded-lg py-2 px-4 font-semibold animate-fade-in">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parameters Section */}
        <Card className="p-6 bg-black/40 border-white/10 h-fit">
          <h2 className="text-xl font-semibold mb-6 text-white">
            Content Parameters
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Target Age Range</Label>
              <Select value={targetAge} onValueChange={setTargetAge}>
                <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45-54">45-54</SelectItem>
                  <SelectItem value="55-64">55-64</SelectItem>
                  <SelectItem value="65+">65+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location (UK Cities)</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="Manchester">Manchester</SelectItem>
                  <SelectItem value="Birmingham">Birmingham</SelectItem>
                  <SelectItem value="Liverpool">Liverpool</SelectItem>
                  <SelectItem value="Leeds">Leeds</SelectItem>
                  <SelectItem value="Glasgow">Glasgow</SelectItem>
                  <SelectItem value="Edinburgh">Edinburgh</SelectItem>
                  <SelectItem value="Bristol">Bristol</SelectItem>
                  <SelectItem value="Sheffield">Sheffield</SelectItem>
                  <SelectItem value="Cardiff">Cardiff</SelectItem>
                  <SelectItem value="Belfast">Belfast</SelectItem>
                  <SelectItem value="Newcastle">Newcastle</SelectItem>
                  <SelectItem value="Nottingham">Nottingham</SelectItem>
                  <SelectItem value="Southampton">Southampton</SelectItem>
                  <SelectItem value="Leicester">Leicester</SelectItem>
                  <SelectItem value="Coventry">Coventry</SelectItem>
                  <SelectItem value="Hull">Hull</SelectItem>
                  <SelectItem value="Stoke-on-Trent">Stoke-on-Trent</SelectItem>
                  <SelectItem value="Wolverhampton">Wolverhampton</SelectItem>
                  <SelectItem value="Plymouth">Plymouth</SelectItem>
                  <SelectItem value="Swansea">Swansea</SelectItem>
                  <SelectItem value="Aberdeen">Aberdeen</SelectItem>
                  <SelectItem value="Dundee">Dundee</SelectItem>
                  <SelectItem value="Portsmouth">Portsmouth</SelectItem>
                  <SelectItem value="York">York</SelectItem>
                  <SelectItem value="Cambridge">Cambridge</SelectItem>
                  <SelectItem value="Oxford">Oxford</SelectItem>
                  <SelectItem value="Milton Keynes">Milton Keynes</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Luton">Luton</SelectItem>
                  <SelectItem value="Derby">Derby</SelectItem>
                  <SelectItem value="Preston">Preston</SelectItem>
                  <SelectItem value="Norwich">Norwich</SelectItem>
                  <SelectItem value="Exeter">Exeter</SelectItem>
                  <SelectItem value="Bath">Bath</SelectItem>
                  <SelectItem value="Chester">Chester</SelectItem>
                  <SelectItem value="Lincoln">Lincoln</SelectItem>
                  <SelectItem value="Lancaster">Lancaster</SelectItem>
                  <SelectItem value="Sunderland">Sunderland</SelectItem>
                  <SelectItem value="Wakefield">Wakefield</SelectItem>
                  <SelectItem value="Salford">Salford</SelectItem>
                  <SelectItem value="Worcester">Worcester</SelectItem>
                  <SelectItem value="Durham">Durham</SelectItem>
                  <SelectItem value="St Albans">St Albans</SelectItem>
                  <SelectItem value="Winchester">Winchester</SelectItem>
                  <SelectItem value="Canterbury">Canterbury</SelectItem>
                  <SelectItem value="Hereford">Hereford</SelectItem>
                  <SelectItem value="Ripon">Ripon</SelectItem>
                  <SelectItem value="Truro">Truro</SelectItem>
                  <SelectItem value="Wells">Wells</SelectItem>
                  <SelectItem value="Ely">Ely</SelectItem>
                  <SelectItem value="Bangor">Bangor</SelectItem>
                  <SelectItem value="Stirling">Stirling</SelectItem>
                  <SelectItem value="Inverness">Inverness</SelectItem>
                  <SelectItem value="Perth">Perth</SelectItem>
                  <SelectItem value="Armagh">Armagh</SelectItem>
                  <SelectItem value="Lisburn">Lisburn</SelectItem>
                  <SelectItem value="Newry">Newry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marketing Purpose</Label>
              <Select
                value={marketingPurpose}
                onValueChange={setMarketingPurpose}
              >
                <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Sales Conversion</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Reference Image{" "}
                <span className="text-xs text-white/50 font-normal">
                  (optional)
                </span>
              </Label>
              <div className="border-2 border-dashed border-primary/60 bg-black/40 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors shadow-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {selectedImage ? (
                    <div className="space-y-2">
                      <img
                        src={selectedImage.preview}
                        alt="Reference"
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-white/70">
                        Click to upload a different image
                      </p>
                    </div>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="mx-auto h-12 w-12 text-white/50" />
                      <p className="mt-2 text-sm text-white/70">
                        (Optional) Click or drag and drop to upload
                      </p>
                      <p className="text-xs text-white/50">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <p className="text-xs text-white/60 mt-2">
                        <span className="font-semibold">Tip:</span> The AI can
                        create more visual and engaging content if you provide a
                        product image.
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Details</Label>
              <Textarea
                placeholder="Describe your product..."
                value={productDetails}
                onChange={(e) => setProductDetails(e.target.value)}
                className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white placeholder-white/60 rounded-lg shadow-sm transition-all min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Content's Purpose</Label>
              <Select value={contentPurpose} onValueChange={setContentPurpose}>
                <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                  <SelectValue placeholder="Select content purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Promotion Program">
                    Promotion Program
                  </SelectItem>
                  <SelectItem value="Sharing and Helping Program">
                    Sharing and Helping Program
                  </SelectItem>
                  <SelectItem value="To Receive Comments">
                    To Receive Comments
                  </SelectItem>
                  <SelectItem value="To Improve Technologies">
                    To Improve Technologies
                  </SelectItem>
                  <SelectItem value="To Increase Staff">
                    To Increase Staff
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content's Tone</Label>
                <Select value={contentTone} onValueChange={setContentTone}>
                  <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Emotion</Label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger className="bg-black/60 border-2 border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/40 text-white rounded-lg shadow-sm transition-all">
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-2 text-xs text-white/70 text-center">
              <span className="font-semibold">Current model:</span> {model}
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RiMagicFill className="mr-2 h-5 w-5" />
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </Card>

        {/* Generated Content Section */}
        <Card className="p-6 bg-black/40 border-white/10">
          <h2 className="text-xl font-semibold mb-6 text-white">
            Generated Content
          </h2>
          <div className="mb-2 text-xs text-white/60">
            <span className="font-semibold">Tip:</span> You can edit the
            generated content below before copying or using it.
          </div>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[300px] animate-fade-in">
              <svg
                className="animate-spin h-16 w-16 text-primary mb-4"
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
              <div className="text-lg font-semibold text-primary mb-2">
                Generating your content...
              </div>
              <div className="text-white/70 text-sm text-center max-w-xs">
                Our AI is crafting your marketing content. This may take a few
                seconds depending on your input and image size.
              </div>
            </div>
          ) : !generatedContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/70 space-y-4 mt-4">
              <RiMagicFill className="h-16 w-16 text-primary" />
              <div>
                <p className="text-lg font-medium">No Content Generated Yet</p>
                <p className="text-sm text-white/50">
                  Fill in the parameters and click "Generate Content" to create
                  your AI-powered marketing content.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {isEditing ? (
                <Textarea
                  className="min-h-[180px] w-full bg-black/20 border border-white/10 text-white rounded-lg p-3"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  disabled={isGenerating}
                  autoFocus
                />
              ) : (
                <div
                  className="whitespace-pre-line bg-black/20 border border-white/10 text-white rounded-lg p-3 min-h-[180px] max-h-[400px] overflow-auto font-mono text-base transition-all"
                  style={{ cursor: "text" }}
                >
                  {editedContent}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (isEditing) setIsEditing(false);
                    else setIsEditing(true);
                  }}
                >
                  {isEditing ? "Done" : "Edit"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(editedContent);
                    toast({
                      title: "Copied!",
                      description: "Content copied to clipboard.",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Previous Content Section (moved below generator UI) */}
      <div className="mt-10 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Your Previous Content
        </h2>
        {loadingPrevious ? (
          <div className="text-white/70">Loading...</div>
        ) : previousContents.length === 0 ? (
          <div className="text-white/50">No previous content found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousContents.map((item) => (
              <Card
                key={item.id}
                className="p-4 bg-black/30 border-white/10 flex flex-col gap-2"
              >
                <div className="whitespace-pre-line text-white font-mono text-base mb-2 max-h-40 overflow-auto">
                  {item.content}
                </div>
                <div className="text-xs text-white/50 mb-2">
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(item.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyContent(item.content)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteContent(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
