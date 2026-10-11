// import { getModel } from "../config/llmModels.js";
// import { generatePpt } from "../utils/generatePpt.js";
// import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
// import { deductCredits } from "../utils/deductCredits.js";
// import { checkAgentLimit } from "../config/agentLimit.js";

// export const pptAgent = async (state) => {
//     try {
//         // Check PPT agent rate limit
//         await checkAgentLimit(state.userId, "ppt");

//         // Get LLM model
//         const llm = await getModel("ppt");

//         // Create prompt
//         const prompt = `
// You are a professional presentation designer.

// Return ONLY valid JSON.

// Format:
// {
//   "title": "",
//   "subtitle": "",
//   "slides": [
//     {
//       "title": "",
//       "points": ["", "", "", ""]
//     }
//   ]
// }

// Rules:
// - Generate exactly 6 content slides.
// - Each slide should have 4-6 concise bullet points.
// - No markdown.
// - No explanation.
// - No code block.
// - Return ONLY valid JSON.

// Topic:
// ${state.prompt}
// `;

//         // Generate presentation content
//         const res = await llm.invoke(prompt);

//         // Parse JSON response
//         const content = typeof res.content === "string"
//             ? res.content
//             : JSON.stringify(res.content);

//         const data = JSON.parse(content);

//         // Generate PPT file
//         const ppt = await generatePpt(data);

//         // Convert PPT to buffer
//         const buffer = await ppt.write({
//             outputType: "nodebuffer"
//         });

//         // Upload PPT to Cloudinary
//         const filename = `ppt-${Date.now()}.pptx`;

//         const downloadUrl = await uploadToCloudinary(
//             buffer,
//             filename
//         );

//         // Deduct credits only after successful upload
//         await deductCredits(state.userId, "ppt");

//         // Return download link
//         return {
//             ...state,
//             aiResponse: `# Presentation Generated

// **${data.title}**

// 📥 [Download PPT](${downloadUrl})

// Your presentation is ready to download.`
//         };

//     } catch (error) {
//         console.error("PPT AGENT ERROR:", error);
//         console.error("PPT ERROR MESSAGE:", error?.message);
//         console.error(
//             "PPT ERROR RESPONSE:",
//             error?.response?.data
//         );

//         return {
//             ...state,
//             aiResponse: `PPT generation failed: ${
//                 error?.message || "Unknown error"
//             }`
//         };
//     }
// };


import { getModel } from "../config/llmModels.js";
import { generatePpt } from "../utils/generatePpt.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pptAgent = async (state) => {
    try {
        // 1. Check agent rate limit
        await checkAgentLimit(state.userId, "ppt");

        // 2. Get LLM model
        const llm = await getModel("ppt");

        // 3. Generate presentation content
        const prompt = `
You are a professional presentation designer.

Create a PowerPoint presentation about:
${state.prompt}

Return ONLY a valid JSON object in this exact structure:
{
  "title": "Computer Networks",
  "subtitle": "Introduction to Computer Networks",
  "slides": [
    {
      "title": "Network Fundamentals",
      "points": [
        "A computer network connects multiple devices.",
        "Networks enable communication and resource sharing.",
        "Examples include LAN, MAN, and WAN.",
        "Protocols define communication rules."
      ]
    }
  ]
}

STRICT RULES:
- Generate exactly 6 slides.
- Each slide must contain a title and 4-6 bullet points.
- Every JSON key and string must use double quotes.
- Escape any double quotes appearing inside string values.
- Do not include comments or trailing commas.
- Do not return Markdown, code fences, or explanations.
- Return syntactically valid JSON only.
`;

        const res = await llm.invoke(prompt);

        // 4. Read AI response
        let content =
            typeof res.content === "string"
                ? res.content
                : Array.isArray(res.content)
                    ? res.content
                        .map((item) =>
                            typeof item === "string"
                                ? item
                                : item.text || ""
                        )
                        .join("\n")
                    : JSON.stringify(res.content);

        console.log("PPT AI RAW RESPONSE:", content);

        // 5. Remove Markdown code fences
        content = content
            .replace(/^\s*```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();

        // 6. Extract JSON object
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");

        if (start === -1 || end === -1 || end < start) {
            throw new Error(
                "AI did not return a valid JSON object. Please try again."
            );
        }

        content = content.slice(start, end + 1);

        // 7. Parse JSON safely
        let data;

        try {
            data = JSON.parse(content);
        } catch (error) {
            console.error("INVALID PPT JSON:", content);

            throw new Error(
                "AI returned malformed JSON. Please try generating the PPT again."
            );
        }

        // 8. Validate presentation data
        if (
            !data.title ||
            !Array.isArray(data.slides) ||
            data.slides.length === 0
        ) {
            throw new Error(
                "AI returned incomplete presentation data."
            );
        }

        for (const slide of data.slides) {
            if (
                !slide.title ||
                !Array.isArray(slide.points) ||
                slide.points.length === 0
            ) {
                throw new Error(
                    "A slide has missing title or bullet points."
                );
            }
        }

        // 9. Generate PowerPoint
        const ppt = await generatePpt(data);

        // 10. Convert PPT to buffer
        const buffer = await ppt.write({
            outputType: "nodebuffer"
        });

        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
            throw new Error("Generated PPT file is empty.");
        }

        // 11. Upload to Cloudinary
        const filename = `ppt-${Date.now()}.pptx`;

        const downloadUrl = await uploadToCloudinary(
            buffer,
            filename
        );

        if (!downloadUrl) {
            throw new Error("PPT upload failed.");
        }

        // 12. Deduct credits after successful upload
        await deductCredits(state.userId, "ppt");

        // 13. Return download link
        return {
            ...state,
            aiResponse: `# Presentation Generated

**${data.title}**

📥 [Download PPT](${downloadUrl})

Your presentation is ready to download.`
        };

    } catch (error) {
        console.error("PPT AGENT ERROR:", error);
        console.error("PPT ERROR MESSAGE:", error?.message);
        console.error(
            "PPT ERROR RESPONSE:",
            error?.response?.data
        );

        return {
            ...state,
            aiResponse: `PPT generation failed: ${
                error?.message || "Unknown error"
            }`
        };
    }
};
