
import "dotenv/config";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function generateVectorEmbeddingsForFile(filepath) {
  // 1. Load the PDF
  const loader = new PDFLoader(filepath);
  const documents = await loader.load();

  console.log(`Loaded ${documents.length} PDF pages`);

  // 2. Split pages into smaller chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(documents);
  console.log(`Created ${chunks.length} chunks`);

  // 3. Initialize the embedding model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 4. Connect to Qdrant and ensure the collection exists
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "cn_docs",
    }
  );

  // 5. Generate embeddings and store the chunks
  await vectorStore.addDocuments(chunks);

  console.log("All document chunks indexed successfully!");
}

generateVectorEmbeddingsForFile("./ONLYRESUME.pdf").catch(
  (error) => {
    console.error("Indexing failed:", error);
  }
);
