import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  return res.json({ status: "All is good" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add(
    "file-ready",
    JSON.stringify({
      fileName: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  res.json({ message: "File uploaded successfully!" });
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY,
  });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
    }
  );
  const retriever = vectorStore.asRetriever({
    // Optional filter
    //   filter: filter,
    k: 5,
  });
  const result = await retriever.invoke(userQuery);
  const SYSTEM_PROMPT = `
  You are helfull AI Assistant who answeres the user query based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
  const chatResult = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: userQuery }],
      },
    ],
  });
  console.log(chatResult.response.text());
  return res.json({
    message: chatResult.response.text(),
    docs: result,
  });
});

app.listen(8000, () => {
  console.log(`server running on PORT:8000`);
});
