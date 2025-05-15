import "dotenv/config";
import express from "express";
import cors from "cors";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createSmitheryUrl } from "@smithery/sdk/dist/shared/config.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/summarize-emails", async (req, res) => {
  console.log("/summarize-emails endpoint hit");
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const smitheryApiKey = process.env.SMITHERY_API_KEY;

  if (
    !googleClientId ||
    !googleClientSecret ||
    !googleRefreshToken ||
    !smitheryApiKey
  ) {
    console.error("Missing required environment variables");
    return res
      .status(500)
      .json({ error: "Missing required environment variables" });
  }

  try {
    const config = {
      googleClientId,
      googleClientSecret,
      googleRefreshToken,
    };
    // Use the standard Smithery URL (no /mcp at the end)
    const serverUrl = createSmitheryUrl(
      "https://server.smithery.ai/@rishipradeep-think41/gsuite-mcp",
      { config, apiKey: smitheryApiKey }
    );
    const transport = new StreamableHTTPClientTransport(serverUrl);
    const client = new Client({
      name: "Elysminx AI client",
      version: "1.0.0",
    });
    await client.connect(transport);
    const tools = await client.listTools();
    console.log(`Available tools: ${tools.map((t) => t.name).join(", ")}`);
    // Find a summarize tool by name
    const summarizeTool =
      Array.isArray(tools) &&
      tools.find((t) => t.name && t.name.toLowerCase().includes("summarize"));
    if (!summarizeTool) {
      console.error("Summarize tool not found on MCP server");
      return res
        .status(500)
        .json({ error: "Summarize tool not found on MCP server" });
    }
    const toolInput = { maxEmails: 10 };
    const result = await client.runTool(summarizeTool.name, toolInput);
    res.json({ summary: result });
    console.log("/summarize-emails endpoint completed");
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({
      error: "Failed to summarize emails",
      details: err && (err.message || err.toString()),
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
