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


import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js";
import dotenv from "dotenv";

dotenv.config();

export const vectorStore = async (docs, collectionName) => {
    try {
        const qdrantUrl = process.env.QDRANT_URL?.trim();

        if (!qdrantUrl) {
            throw new Error("QDRANT_URL is missing from environment variables.");
        }

        if (!Array.isArray(docs) || docs.length === 0) {
            throw new Error("No PDF text chunks were provided.");
        }

        // Step A: Test the embedding provider separately
        console.log("Testing embedding provider...");

        try {
            const testEmbedding = await embeddings.embedQuery(
                "CortexAI PDF connection test"
            );

            if (!testEmbedding?.length) {
                throw new Error("The embedding provider returned an empty embedding.");
            }

            console.log("Embedding provider connected successfully.");
        } catch (error) {
            console.error("EMBEDDING CONNECTION ERROR:", error);

            throw new Error(
                `Embedding provider failed: ${error.message}`
            );
        }

        // Step B: Connect to Qdrant and create the vector store
        console.log("Connecting to Qdrant...");

        const store = await QdrantVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                url: qdrantUrl,
                collectionName,
                ...(process.env.QDRANT_API_KEY
                    ? { apiKey: process.env.QDRANT_API_KEY }
                    : {})
            }
        );

        console.log("Qdrant vector store created successfully.");

        return store;
    } catch (error) {
        console.error("VECTOR STORE ERROR:", error);
        throw error;
    }
};
