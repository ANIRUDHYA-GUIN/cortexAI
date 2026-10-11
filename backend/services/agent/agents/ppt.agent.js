import { getModel } from "../config/llmModels.js";
import { generatePpt } from "../utils/generatePpt.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pptAgent = async (state) => {
    try {
        // Check PPT agent rate limit
        await checkAgentLimit(state.userId, "ppt");

        // Get LLM model
        const llm = await getModel("ppt");

        // Create prompt
        const prompt = `
You are a professional presentation designer.

Return ONLY valid JSON.

Format:
{
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": ["", "", "", ""]
    }
  ]
}

Rules:
- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY valid JSON.

Topic:
${state.prompt}
`;

        // Generate presentation content
        const res = await llm.invoke(prompt);

        // Parse JSON response
        const content = typeof res.content === "string"
            ? res.content
            : JSON.stringify(res.content);

        const data = JSON.parse(content);

        // Generate PPT file
        const ppt = await generatePpt(data);

        // Convert PPT to buffer
        const buffer = await ppt.write({
            outputType: "nodebuffer"
        });

        // Upload PPT to Cloudinary
        const filename = `ppt-${Date.now()}.pptx`;

        const downloadUrl = await uploadToCloudinary(
            buffer,
            filename
        );

        // Deduct credits only after successful upload
        await deductCredits(state.userId, "ppt");

        // Return download link
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