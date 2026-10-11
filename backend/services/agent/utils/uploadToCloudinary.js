
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadToCloudinary = async (fileBuffer, filename) => {
    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        throw new Error("Cloudinary environment variables are missing");
    }

    return new Promise((resolve, reject) => {
        const publicId = filename;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                type: "upload",
                public_id: publicId,
                overwrite: true,
                use_filename: false,
                unique_filename: false
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result?.secure_url) {
                    return reject(
                        new Error("Cloudinary returned no file URL")
                    );
                }

                console.log("Cloudinary upload:", {
                    resource_type: result.resource_type,
                    format: result.format,
                    bytes: result.bytes,
                    url: result.secure_url
                });

                resolve(result.secure_url);
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};
