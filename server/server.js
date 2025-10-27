require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary config
console.log("Cloudinary configured:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗",
    api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "✗",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "✗"
});

app.use(cors());
app.use(express.json());

// Multer configuration for handling file in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Upload endpoint
app.post("/upload", upload.single("image"), async (req, res) => {
    console.log("Upload request received");
    
    if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file.originalname, "Size:", req.file.size);

    try {
        // Convert buffer to stream for Cloudinary
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: "pilates-uploads", // Optional: organize uploads in a folder
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ error: "Upload failed" });
                }

                console.log("Upload successful:", result.secure_url);
                res.json({
                    message: "Image uploaded successfully!",
                    imageUrl: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        // Pipe the file buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
        console.error("Error processing upload:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});

// Optional: Delete endpoint
app.delete("/delete-image/:publicId", async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Delete failed" });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: "File size too large. Maximum size is 10MB." 
            });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});