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


// import redis from "../../shared/redis/redis.js";

// const protect = async (req, res, next) => {
//     try {
//         const sessionId = req.cookies?.session;

//         console.log("SESSION COOKIE RECEIVED:", !!sessionId);

//         if (!sessionId) {
//             return res.status(401).json({
//                 message: "Session cookie missing"
//             });
//         }

//         const session = await redis.get(`session-${sessionId}`);

//         console.log("REDIS SESSION FOUND:", !!session);

//         if (!session) {
//             return res.status(401).json({
//                 message: "Session expired or not found"
//             });
//         }

//         req.user = JSON.parse(session);

//         console.log("AUTHENTICATED USER:", req.user.userId);

//         next();

//     } catch (error) {
//         console.error("AUTH MIDDLEWARE ERROR:", error);

//         return res.status(500).json({
//             message: "Authentication middleware error"
//         });
//     }
// };

// export default protect;


import redis from "../../shared/redis/redis.js";
import User from "../models/user.model.js";
import firebaseApp from "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";

const protect = async (req, res, next) => {
    try {
        // 1. Try existing Redis session first
        const sessionId = req.cookies?.session;

        if (sessionId) {
            const session = await redis.get(`session-${sessionId}`);

            if (session) {
                req.user = JSON.parse(session);

                console.log("REDIS AUTH SUCCESS:", req.user.userId);

                return next();
            }
        }

        // 2. Fallback to Firebase ID token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        // 3. Verify Firebase token
        const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

        console.log("FIREBASE TOKEN VERIFIED:", decodedToken.uid);

        // 4. Find existing MongoDB user
        const user = await User.findOne({
            firebaseUid: decodedToken.uid
        });

        if (!user) {
            return res.status(401).json({
                message: "User account not found"
            });
        }

        // 5. Set user information for existing services
        req.user = {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpiresAt: user.planExpiresAt
        };

        console.log("FIREBASE AUTH SUCCESS:", req.user.userId);

        next();

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error.message);

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

export default protect;
