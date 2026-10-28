// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "./embeddings.js";
// import dotenv from "dotenv"
// dotenv.config()
// export const vectorStore = async (docs, collectionName) => {
//     return await QdrantVectorStore.fromDocuments(docs, embeddings, {
//         url: process.env.QDRANT_URL,
//         collectionName
//     });
// }


// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "./embeddings.js";
// import dotenv from "dotenv";

// dotenv.config();

// export const vectorStore = async (docs, collectionName) => {
//     try {
//         const qdrantUrl = process.env.QDRANT_URL?.trim();

//         if (!qdrantUrl) {
//             throw new Error("QDRANT_URL is missing from environment variables.");
//         }

//         if (!Array.isArray(docs) || docs.length === 0) {
//             throw new Error("No PDF text chunks were provided.");
//         }

//         // Step A: Test the embedding provider separately
//         console.log("Testing embedding provider...");

//         try {
//             const testEmbedding = await embeddings.embedQuery(
//                 "CortexAI PDF connection test"
//             );

//             if (!testEmbedding?.length) {
//                 throw new Error("The embedding provider returned an empty embedding.");
//             }

//             console.log("Embedding provider connected successfully.");
//         } catch (error) {
//             console.error("EMBEDDING CONNECTION ERROR:", error);

//             throw new Error(
//                 `Embedding provider failed: ${error.message}`
//             );
//         }

//         // Step B: Connect to Qdrant and create the vector store
//         console.log("Connecting to Qdrant...");

//         const store = await QdrantVectorStore.fromDocuments(
//             docs,
//             embeddings,
//             {
//                 url: qdrantUrl,
//                 collectionName,
//                 ...(process.env.QDRANT_API_KEY
//                     ? { apiKey: process.env.QDRANT_API_KEY }
//                     : {})
//             }
//         );

//         console.log("Qdrant vector store created successfully.");

//         return store;
//     } catch (error) {
//         console.error("VECTOR STORE ERROR:", error);
//         throw error;
//     }
// };


// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "./embeddings.js";
// import dotenv from "dotenv";

// dotenv.config();

// export const vectorStore = async (docs, collectionName) => {
//     try {
//         const qdrantUrl = process.env.QDRANT_URL?.trim().replace(/\/+$/, "");
//         const apiKey = process.env.QDRANT_API_KEY?.trim();

//         if (!qdrantUrl) {
//             throw new Error("QDRANT_URL is missing.");
//         }

//         if (!apiKey) {
//             throw new Error("QDRANT_API_KEY is missing.");
//         }

//         if (!Array.isArray(docs) || docs.length === 0) {
//             throw new Error("No PDF text chunks were provided.");
//         }

//         console.log("PDF chunks:", docs.length);
//         console.log("Collection:", collectionName);
//         console.log("Qdrant URL configured:", Boolean(qdrantUrl));

//         // Step 1: Test Gemini embeddings
//         console.log("STEP 1: Testing Gemini embeddings...");

//         const testEmbedding = await embeddings.embedQuery(
//             "CortexAI PDF connection test"
//         );

//         if (!testEmbedding?.length) {
//             throw new Error("Gemini returned an empty embedding.");
//         }

//         console.log("Gemini embedding test successful.");

//         // Step 2: Test Qdrant REST connectivity
//         console.log("STEP 2: Testing Qdrant REST connection...");

//         const response = await fetch(
//             `${qdrantUrl}/collections`,
//             {
//                 headers: {
//                     "api-key": apiKey
//                 },
//                 signal: AbortSignal.timeout(15000)
//             }
//         );

//         console.log("Qdrant HTTP status:", response.status);

//         if (!response.ok) {
//             const body = await response.text();

//             throw new Error(
//                 `Qdrant HTTP ${response.status}: ${body.slice(0, 300)}`
//             );
//         }

//         console.log("Qdrant REST connection successful.");

//         // Step 3: Create the vector store
//         console.log("STEP 3: Creating Qdrant vector store...");
        
//         console.log("QDRANT URL:", qdrantUrl);
//         console.log("QDRANT API KEY present:", Boolean(apiKey));

//         const store = await QdrantVectorStore.fromDocuments(
//             docs,
//             embeddings,
//             {
//                 url: qdrantUrl,
//                 apiKey,
//                 collectionName,
//                 checkCompatibility: false
//             }
//         );

//         console.log("Qdrant vector store created successfully.");

//         return store;

//     } catch (error) {
//         console.error("VECTOR STORE ERROR:", error?.message);
//         console.error("VECTOR STORE ERROR CAUSE:", error?.cause);
//         console.error("VECTOR STORE FULL ERROR:", error);

//         throw error;
//     }
// };
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js";
import dotenv from "dotenv"
dotenv.config()
export const vectorStore = async (docs, collectionName) => {
    return await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: process.env.QDRANT_URL,
        collectionName
    });
}