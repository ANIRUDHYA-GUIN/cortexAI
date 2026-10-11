
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadToCloudinary = async (
    fileBuffer,
    filename,
    resourceType = "raw"
) => {
    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        throw new Error("Cloudinary environment variables are missing");
    }

    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
        throw new Error("File buffer is empty or invalid");
    }

    const publicId =
        resourceType === "image"
            ? filename.replace(/\.[^.]+$/, "")
            : filename;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
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

                console.log("Cloudinary upload successful:", {
                    resourceType: result.resource_type,
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
