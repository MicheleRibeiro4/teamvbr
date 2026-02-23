import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let openaiClient: OpenAI | null = null;

  function getOpenAI(): OpenAI {
    // Tenta pegar com o nome padrão ou com o erro de digitação comum
    const key = process.env.OPENAI_API_KEY || process.env.OPENIA_API_KEY;
    
    if (!key) {
      throw new Error("API Key da OpenAI não encontrada. Configure OPENAI_API_KEY nas variáveis de ambiente.");
    }
    
    // Não guardamos em cache para garantir que trocas de chave no ambiente 
    // sejam refletidas sem precisar de reinicialização complexa
    return new OpenAI({ apiKey: key });
  }

  // API routes
  app.post("/api/generate-protocol", async (req, res) => {
    try {
      const { prompt } = req.body;

      const openai = getOpenAI();

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using a standard high-quality model
        messages: [
          { role: "system", content: "Você é um treinador e nutricionista de elite do 'Team VBR'. Responda apenas com JSON válido." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      res.json(JSON.parse(content || "{}"));
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
