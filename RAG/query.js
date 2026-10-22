 
 import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
 import openai from "openai";
  import "dotenv/config";
  const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
 async function query(userQuery) {

   //convert user query into vector embedding
   const embeddings = new OpenAIEmbeddings({
       model: "text-embedding-3-small",
       apiKey: process.env.OPENAI_API_KEY,
     });
  //search the vectors in qdrant
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "cn_docs",
    }
  );

  //get similar vectors ands chunks
  const vectorRetriver=vectorStore.asRetriever(3);
  const results=await vectorRetriver.invoke(userQuery);
  //feed those chuks to llm and do chat

  const SYSTEM_PROMPT=`You are a helpful assistant that answers questions based on the context provided. If you don't know the answer, just say "I don't know".
    User documents:
    ${results.map(e=>JSON.stringify({pageContent:e.pageContent,metadata:e.metadata})).join("\n")}
    Answer the user in short and tell them on which page they can find the answer.
  
  
  `;
 const llmresponse=await  client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery }
    ]
  });

  console.log(console.log(llmresponse.choices[0].message.content));


 }
 query("What is the difference between TCP and UDP?");
 