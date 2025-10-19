const express = require('express');
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');

app.use(cors());

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    console.log(req.file); 
    res.json({
      message: "Image uploaded successfully!",
      imageUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });
  });
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});