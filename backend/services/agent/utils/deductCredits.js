import axios from "axios";

export const deductCredits = async (userId, agent) => {
    try {
        const { data } = await axios.post(
            `${process.env.AUTH_SERVICE}/api/auth/deduct-credits`,
            { userId, agent }
        );

        console.log("CREDIT RESPONSE:", data);
        return data;
    } catch (error) {
        console.log(
            "CREDIT ERROR:",
            error.response?.data || error.message
        );
        throw error;
    }
};