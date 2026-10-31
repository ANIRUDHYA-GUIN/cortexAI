// import redis from "../../shared/redis/redis.js"

// const protect=async (req,res,next) => {
//     try {
//         const sessionId=req.cookies?.session
//         if(!sessionId){
//             return res.status(400).json({message:"unauthorized"})
//         }
//         const session=await redis.get(`session-${sessionId}`)
//         console.log(session)
//         if(!session){
//             return res.status(400).json({message:"session expired"})
//         }
//         req.user=JSON.parse(session)
//         next()
       
//     } catch (error) {
//         return res.status(500).json({message:`protect error ${error}`})
//     }
// }

// export default protect


import redis from "../../shared/redis/redis.js";

const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session;

        console.log("SESSION COOKIE RECEIVED:", !!sessionId);

        if (!sessionId) {
            return res.status(401).json({
                message: "Session cookie missing"
            });
        }

        const session = await redis.get(`session-${sessionId}`);

        console.log("REDIS SESSION FOUND:", !!session);

        if (!session) {
            return res.status(401).json({
                message: "Session expired or not found"
            });
        }

        req.user = JSON.parse(session);

        console.log("AUTHENTICATED USER:", req.user.userId);

        next();

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            message: "Authentication middleware error"
        });
    }
};

export default protect;
