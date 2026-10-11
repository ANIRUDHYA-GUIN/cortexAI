// import { getModel } from "../config/llmModels.js"
// import axios from "axios"
// import { uploadToS3 } from "../utils/uploadToS3.js"
// import { getFromS3 } from "../utils/getFromS3.js"
// import { deductCredits } from "../utils/deductCredits.js"
// import { checkAgentLimit } from "../config/agentLimit.js"
// export const visionAgent=async (state) => {

//     try {
//         await checkAgentLimit(state.userId,"image")
//          const llm=await getModel("image")
//     const res=await llm.invoke(`
//         You are an elite AI image prompt engineer.

// Convert the user request into a highly detailed image generation prompt.

// Requirements:

// - Cinematic lighting
// - Professional composition
// - Ultra realistic
// - High detail
// - Beautiful color palette
// - Sharp focus
// - 8K quality
// - Photorealistic
// - Depth of field
// - Professional photography
// - Stunning visuals

// Return only the image prompt.

// User Request:
// ${state.prompt}

//         `)

// const prompt=res.content.trim()

// const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

// const imageRes=await axios.get(imageUrl,{responseType:"arraybuffer"})
// await deductCredits(state.userId,"vision")
// const buffer=Buffer.from(imageRes.data)
// const filename=`image-${Date.now()}.png`

// await uploadToS3(filename,buffer,"image/png")
// const downloadUrl=await getFromS3(filename,24*60)

// return {
//     ...state,
//     aiResponse:`
// ![Generated Image](${downloadUrl})

// 📥 [Download Image](${downloadUrl})

// ⏳ Link expires in 10 minutes.`
// }
//     } catch (error) {
//        console.log(error)
//          return {
//             ...state,
//             aiResponse:error?.data?.message || "failed to generate image"
//         }
//     }
   


// }



import { getModel } from "../config/llmModels.js";
import axios from "axios";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const visionAgent = async (state) => {
    try {
        // 1. Check usage limit
        await checkAgentLimit(state.userId, "image");

        // 2. Generate a detailed image prompt
        const llm = await getModel("image");

        const res = await llm.invoke(`
You are an expert AI image prompt engineer.

Convert the user's request into a detailed image generation prompt.

Requirements:
- Cinematic lighting
- Professional composition
- High detail and sharp focus
- Beautiful color palette
- Photorealistic style where appropriate
- Realistic depth of field where appropriate
- Professional-quality visuals

Return only the image prompt, without explanations.

User request:
${state.prompt}
`);

        const prompt =
            typeof res.content === "string"
                ? res.content.trim()
                : String(res.content).trim();

        if (!prompt) {
            throw new Error("Failed to generate an image prompt");
        }

        // 3. Request image generation
        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 120000
        });

        const contentType =
            imageRes.headers["content-type"] || "";

        if (!contentType.startsWith("image/")) {
            throw new Error(
                `Image provider returned an unexpected content type: ${contentType}`
            );
        }

        // 4. Convert the response to a buffer
        const buffer = Buffer.from(imageRes.data);

        if (buffer.length === 0) {
            throw new Error("Generated image is empty");
        }

        // 5. Select extension from the response content type
        const extension =
            contentType.includes("png") ? "png" :
            contentType.includes("webp") ? "webp" :
            contentType.includes("jpeg") || contentType.includes("jpg")
                ? "jpg"
                : null;

        if (!extension) {
            throw new Error(
                `Unsupported generated image format: ${contentType}`
            );
        }

        const filename = `image-${Date.now()}.${extension}`;

        // 6. Upload image to Cloudinary as an image
        const downloadUrl = await uploadToCloudinary(
            buffer,
            filename,
            "image"
        );

        // 7. Deduct credits only after successful upload
        await deductCredits(state.userId, "vision");

        // 8. Return the image and download link
        return {
            ...state,
            aiResponse: `# Image Generated

![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

Your image is ready.`
        };

    } catch (error) {
        console.error("VISION AGENT ERROR:", error);
        console.error(
            "VISION ERROR MESSAGE:",
            error?.response?.data || error?.message
        );

        return {
            ...state,
            aiResponse: `Image generation failed: ${
                error?.message || "Unknown error"
            }`
        };
    }
};
