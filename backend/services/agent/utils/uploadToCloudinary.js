
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadToCloudinary = async (pdfBuffer, filename) => {
    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        throw new Error("Cloudinary environment variables are missing");
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                public_id: filename,
                overwrite: true
            },
            (error, result) => {
                if (error) return reject(error);

                if (!result?.secure_url) {
                    return reject(
                        new Error("Cloudinary returned no PDF URL")
                    );
                }

                resolve(result.secure_url);
            }
        );

        Readable.from(pdfBuffer).pipe(stream);
    });
};
