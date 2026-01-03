import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    // console.log('Job :', job.data)
    const file = JSON.parse(job.data);
    // console.log(file.path);
    try {
      const loader = new PDFLoader(file.path);
      const docs = await loader.load();
      console.log("docs" ,docs);
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300, chunkOverlap: 0 })
    const texts = await splitter.splitDocuments(docs)
    console.log("texts", texts);

        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "text-embedding-004",
          apiKey: "AIzaSyCBA34mC-d9i-1IH0Frv30SdbWlc70WMeU",
        });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: "http://localhost:6333",
            collectionName: "langchainjs-testing",
          }
        );
        await vectorStore.addDocuments(texts);
        console.log('vector store added')
    } catch (err) {
        console.log("error :", err);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);
