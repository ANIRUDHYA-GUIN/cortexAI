import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
// import { getFromS3 } from "../utils/getFromS3.js"
// import { uploadToS3 } from "../utils/uploadToS3.js"
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
export const pdfAgent=async (state) => {
    try {
        const rate=await checkAgentLimit(state.userId,"pdf")
        
        
        const llm=await getModel("pdf")
        const prompt=`
        You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
"title":"",
"subtitle":"",
"sections":[
{
"heading":"",
"points":[]
}
]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
        `

        const res=await llm.invoke(prompt)
        const data=JSON.parse(res.content)
        await deductCredits(state.userId,"pdf")
        
        const pdfBuffer=await generatePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        const downloadUrl=await uploadToCloudinary(pdfBuffer, filename)
        // Deduct credits only after upload succeeds
         await deductCredits(state.userId, "pdf");


        return {
          ...state,
          aiResponse:`# PDF Generated

**${data.title}**

📥 [Download PDF](${downloadUrl})

    Your PDF is ready to download.`
        }

    } catch (error) {
    console.error("PDF AGENT ERROR:", error);
    console.error("PDF ERROR MESSAGE:", error?.message);
    console.error("PDF ERROR RESPONSE:", error?.response?.data);

    return {
        ...state,
        aiResponse: `PDF generation failed: ${error?.message || "Unknown error"}`
    };
}}
