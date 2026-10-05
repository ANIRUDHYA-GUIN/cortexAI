// import { initializeApp, cert } from "firebase-admin/app"
// import serviceAccount from "../serviceAccountKey.json" with { type: "json" }

// export const app = initializeApp({
//     credential: cert(serviceAccount)
// })

import { initializeApp, cert } from "firebase-admin/app"

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

export const app = initializeApp({
    credential: cert(serviceAccount)
})

