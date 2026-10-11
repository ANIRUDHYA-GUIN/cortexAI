// import fs, { stat } from "fs"
// import {PDFParse} from "pdf-parse"
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
// import { vectorStore } from "../config/vectorDb.js"
// import { getModel } from "../config/llmModels.js"
// import { HumanMessage, SystemMessage } from "@langchain/core/messages"
// import { deductCredits } from "../utils/deductCredits.js"
// import { checkAgentLimit } from "../config/agentLimit.js"
// export const pdfRag=async (state)=>{
//    try {
//     await checkAgentLimit(state.userId,"pdf")
//       const buffer=fs.readFileSync(state.file.path)
//       const pdf=new PDFParse({
//         data:buffer
//       })

//       const result=await pdf.getText()
//       const text=result.text

//       const spilliter=new RecursiveCharacterTextSplitter({
//         chunkSize:1000,
//         chunkOverlap:200
//       })

//       const docs=await spilliter.createDocuments([text])
//       const collectionName=`pdf-${Date.now()}`;
//       const store=await vectorStore(docs,collectionName)

//       const relevantDocs=await store.similaritySearch(state.prompt,5)
      
//       const context=relevantDocs.map(d=>d.pageContent).join("\n\n")
      
//       const llm=await getModel("pdf-rag")

//        const messages=[
//         new SystemMessage(`You are CortexAI PDF Assistant.

// Rules:

// - Answer ONLY from the uploaded PDF.

// - Never make up information.

// - If the answer is not present in the PDF, reply:

// "I couldn't find this information in the uploaded PDF."

// - Use Markdown formatting.
// `),

// new HumanMessage(`
//     Context:${context}
//      Question:${state.prompt}
//     `)
//        ]


//       const response=await llm.invoke(messages)
//       await deductCredits(state.userId,"pdf")
//       console.log(response)
//       return {
//         ...state,
//         aiResponse:response.content
//       }



//    } catch (error) {
//     console.log(error)
//          return {
//             ...state,
//             aiResponse:error?.data?.message || "failed to analyze pdf"
//         }
//    }finally{
//          fs.unlinkSync(state.file.path)
//    }

// }


import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDb.js";
import { getModel } from "../config/llmModels.js";
import {
    HumanMessage,
    SystemMessage
} from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfRag = async (state) => {
    let parser;

    try {
        // 1. Check agent usage limit
        await checkAgentLimit(state.userId, "pdf");

        // 2. Validate uploaded PDF
        if (!state.file?.path) {
            throw new Error("No PDF file was uploaded.");
        }

        if (!fs.existsSync(state.file.path)) {
            throw new Error("Uploaded PDF file was not found on the server.");
        }

        const buffer = fs.readFileSync(state.file.path);

        if (buffer.length === 0) {
            throw new Error("The uploaded PDF is empty.");
        }

        // 3. Extract text from PDF
        parser = new PDFParse({ data: buffer });

        const result = await parser.getText();
        const pdfText = result?.text?.trim();

        if (!pdfText) {
            throw new Error(
                "No readable text was found. This may be a scanned PDF requiring OCR."
            );
        }

        console.log("PDF text extracted:", pdfText.length, "characters");

        // 4. Split PDF text into smaller chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        const docs = await splitter.createDocuments([pdfText]);

        if (!docs.length) {
            throw new Error("Failed to split the PDF into text chunks.");
        }

        console.log("PDF chunks created:", docs.length);

        // 5. Create a vector store for this PDF
        const collectionName = `pdf-${Date.now()}`;

        const store = await vectorStore(docs, collectionName);

        // 6. Find relevant PDF content
        const question = state.prompt?.trim();

        if (!question) {
            throw new Error("Please enter a question about the PDF.");
        }

        const relevantDocs = await store.similaritySearch(question, 5);

        const context = relevantDocs
            .map((doc) => doc.pageContent)
            .filter(Boolean)
            .join("\n\n");

        if (!context.trim()) {
            return {
                ...state,
                aiResponse:
                    "I couldn't find this information in the uploaded PDF."
            };
        }

        console.log("Relevant PDF chunks found:", relevantDocs.length);

        // 7. Ask the language model using retrieved PDF content
        const llm = await getModel("pdf-rag");

        const messages = [
            new SystemMessage(
                `You are CortexAI PDF Assistant.

Rules:
- Answer only using the provided context from the uploaded PDF.
- Do not invent or assume information.
- If the answer is not present in the context, say:
  "I couldn't find this information in the uploaded PDF."
- Use clear, helpful Markdown formatting.`
            ),
            new HumanMessage(
                `PDF context:
${context}

User question:
${question}`
            )
        ];

        const response = await llm.invoke(messages);

        if (!response?.content) {
            throw new Error("The AI model returned an empty response.");
        }

        // 8. Deduct credits only after a successful answer
        await deductCredits(state.userId, "pdf");

        console.log("PDF analysis completed successfully.");

        return {
            ...state,
            aiResponse: response.content
        };
    } catch (error) {
        console.error("PDF RAG ERROR:", error);
        console.error("PDF RAG ERROR MESSAGE:", error?.message);

        return {
            ...state,
            aiResponse: `PDF analysis failed: ${
                error?.message || "Unknown error"
            }`
        };
    } finally {
        // 9. Clean up the temporary uploaded PDF
        if (parser && typeof parser.destroy === "function") {
            try {
                await parser.destroy();
            } catch (error) {
                console.error("PDF PARSER CLEANUP ERROR:", error.message);
            }
        }

        if (state.file?.path) {
            try {
                if (fs.existsSync(state.file.path)) {
                    fs.unlinkSync(state.file.path);
                }
            } catch (error) {
                console.error("PDF FILE CLEANUP ERROR:", error.message);
            }
        }
    }
};









































