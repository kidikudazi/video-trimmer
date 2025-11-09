import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware for parsing JSON
app.use(express.json());

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("output")) fs.mkdirSync("output");

// Set FFmpeg paths using installed packages
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

console.log("FFmpeg path:", ffmpegPath.path);
console.log("FFprobe path:", ffprobePath.path);

// Serve static files
app.use(express.static("uploads"));
app.use("/output", express.static("output"));

app.post("/api/crop-video", upload.single("video"), async (req, res) => {
  try {
    // Two cropping modes:
    // 1. Edge-based: { top, bottom, left, right } - removes pixels from edges
    // 2. Region-based: { cropX, cropY, cropWidth, cropHeight } - crops to specific rectangle
    const { 
      top = 0, bottom = 0, left = 0, right = 0,
      cropX, cropY, cropWidth, cropHeight 
    } = req.body;
    
    const inputPath = req.file.path;

    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return res.status(500).json({ error: "Failed to read video metadata" });
      console.log("Video metadata:", metadata);
      const videoStream = metadata.streams.find((s) => s.width && s.height);
      if (!videoStream) {
      return res.status(500).json({ error: "No video stream found" });
      }

      const { width, height } = videoStream;
      let finalWidth, finalHeight, startX, startY;

      // Determine cropping mode
      if (cropWidth !== undefined && cropHeight !== undefined) {
      // Region-based cropping: crop to specific rectangle
      finalWidth = parseInt(cropWidth);
      finalHeight = parseInt(cropHeight);
      startX = parseInt(cropX || 0);
      startY = parseInt(cropY || 0);
      
      console.log(`Region crop: ${width}x${height} → ${finalWidth}x${finalHeight} at (${startX}, ${startY})`);
      } else {
      // Edge-based cropping: remove pixels from edges
      finalWidth = width - parseInt(left) - parseInt(right);
      finalHeight = height - parseInt(top) - parseInt(bottom);
      startX = parseInt(left);
      startY = parseInt(top);
      
      console.log(`Edge crop: ${width}x${height} → ${finalWidth}x${finalHeight} (removed: T:${top} B:${bottom} L:${left} R:${right})`);
      }

      // Validate dimensions
      if (finalWidth <= 0 || finalHeight <= 0 || startX < 0 || startY < 0) {
      fs.unlinkSync(inputPath);
      return res.status(400).json({
        error: `Invalid crop values. Resulting dimensions would be ${finalWidth}x${finalHeight} at (${startX}, ${startY}).`,
      });
      }

      if (startX + finalWidth > width || startY + finalHeight > height) {
      fs.unlinkSync(inputPath);
      return res.status(400).json({
        error: `Crop region exceeds video boundaries. Video is ${width}x${height}, crop would extend to ${startX + finalWidth}x${startY + finalHeight}.`,
      });
      }

      const outputPath = path.join("output", `cropped-${Date.now()}.mp4`);

      // FFmpeg crop filter: crop=width:height:x:y
      ffmpeg(inputPath)
      .videoFilter(`crop=${finalWidth}:${finalHeight}:${startX}:${startY}`)
      .on("end", () => {
        console.log("✅ Video processed:", outputPath);
        fs.unlinkSync(inputPath);

        // Send a download URL with proper path separator
        const downloadUrl = `${req.protocol}://${req.get("host")}/${outputPath.replace(/\\/g, '/')}`;
        res.json({ message: "Video processed successfully", downloadUrl });
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg processing error:", err.message);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        res.status(500).json({ error: "Failed to process video" });
      })
      .save(outputPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
