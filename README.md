# AI Agent Project – Main Dashboard Centre

This repository showcases the work I submitted for an **AI Agent Project Competition**. Throughout the competition, I explored several key areas and built practical tools using modern AI agent frameworks like [Multi-Agent Control Plane (MCP)](https://smitheryai.notion.site/MCP-Quickstart-2772e76a7583499db3e3a77f6cc7fa14).

---

## 🧠 What I Explored

### 1. UK Market Content Creation Tool
I developed a content creator tool tailored for the **UK market** using **Google's Gemini model**.  
> 🎯 Goal: Help small businesses set up and generate content easily and freely.

---

### 2. Local MCP Server + Client Setup
I learned how to build and connect a local MCP server and client.

📂 GitHub Repo: [local-mcp](https://github.com/jadstrike/local-mcp)

---

### 3. LinkedIn Job Search & Apply Automation
I set up **job search and application automation** on [n8n](https://n8n.io/) using **MCP agents**.  
> ⛔️ This feature is not yet available on the main dashboard due to time needed to fix bugs.  

---

### 4. Multi-Tool RAG Agent with Human-in-the-Loop
I built an agent capable of:
- Using **RAG** (Retrieval-Augmented Generation)
- Generating **structured output**
- Including **human-in-the-loop** steps (e.g., asking for "yes" or "no" approval)
- Handling **memory management**

📂 GitHub Repo: [rag-agent](https://github.com/jadstrike/rag-agent)

---

## 🚀 How to Run the Main Dashboard Centre

This dashboard integrates all the features mentioned above.

### 🔐 Environment Variables

Create a `.env` file and include the following:

```env
COMPANY_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_URL=https://your-project.supabase.co
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
SMITHERY_API_KEY=your-smithery-api-key
PORT=3001
