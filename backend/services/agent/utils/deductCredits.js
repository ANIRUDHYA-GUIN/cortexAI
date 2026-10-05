import axios from "axios"

// export const deductCredits=async (userId,agent)=>{
//     try {
//        const {data}=await axios.post(`${process.env.AUTH_SERVICE}/deduct-credits`,{userId,agent})
//        return data
//     } catch (error) {
//         console.log(error)
//         return null
//     }
// }

export const deductCredits = async (userId, agent) => {
    try {
        const { data } = await axios.post(
            `${process.env.AUTH_SERVICE}/deduct-credits`,
            { userId, agent }
        )

        console.log("CREDIT RESPONSE:", data)

        return data
    } catch (error) {
        console.log(
            "CREDIT ERROR:",
            error.response?.data || error.message
        )
        throw error
    }
}