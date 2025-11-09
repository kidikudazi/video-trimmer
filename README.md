# Video Trimmer/Cropper

A Node.js web application for cropping videos using FFmpeg. Supports both edge-based and region-based cropping.

## Features

- 🎬 **Two Cropping Modes:**
  - **Edge Crop**: Remove pixels from top, bottom, left, and right edges
  - **Region Crop**: Crop to a specific rectangle (x, y, width, height)
- 📤 Drag & drop or click to upload videos
- 🎨 Beautiful, responsive UI
- ⚡ FFmpeg bundled with the project (no system installation required)

## Installation

1. Install dependencies:
```bash
npm install
```

This will install:
- `express` - Web server framework
- `multer` - File upload handling
- `fluent-ffmpeg` - FFmpeg wrapper for Node.js
- `@ffmpeg-installer/ffmpeg` - FFmpeg binaries (bundled)
- `@ffprobe-installer/ffprobe` - FFprobe binaries (bundled)

## Usage

1. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:4000
```

3. Upload a video and choose your cropping method:
   - **Edge Crop**: Specify how many pixels to remove from each edge
   - **Region Crop**: Specify the exact rectangle to crop to

4. Click "Crop Video" and wait for processing

5. Download your cropped video!

## Project Structure

```
video-trimmer-main/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── uploads/            # Temporary upload storage
│   └── index.html      # Frontend UI
├── output/             # Processed videos
└── node_modules/       # Dependencies (including FFmpeg binaries)
```

## How It Works

1. **Upload**: Videos are uploaded to the `/uploads` directory
2. **Processing**: FFmpeg crops the video based on your specifications
3. **Output**: Cropped videos are saved to the `/output` directory
4. **Download**: You receive a download link to your processed video
5. **Cleanup**: Original uploads are automatically deleted after processing

## API Endpoint

### POST /upload

Upload and crop a video.

**Parameters (multipart/form-data):**
- `video` (file): The video file to process

**Edge Crop Mode:**
- `top` (number): Pixels to remove from top
- `bottom` (number): Pixels to remove from bottom
- `left` (number): Pixels to remove from left
- `right` (number): Pixels to remove from right

**Region Crop Mode:**
- `cropX` (number): Starting X coordinate
- `cropY` (number): Starting Y coordinate
- `cropWidth` (number): Width of crop region
- `cropHeight` (number): Height of crop region

**Response:**
```json
{
  "message": "Video processed successfully",
  "downloadUrl": "http://localhost:4000/output/cropped-1234567890.mp4"
}
```

## Technical Details

- **FFmpeg**: Bundled via `@ffmpeg-installer/ffmpeg` - no system installation needed
- **Server**: Express.js on port 4000
- **File Upload**: Multer middleware
- **Video Processing**: fluent-ffmpeg with crop filter
- **Supported Formats**: Any format supported by FFmpeg (MP4, AVI, MOV, etc.)

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Check that ports 4000 is available

3. Ensure you have enough disk space for video processing

4. Check the console for detailed error messages

## License

ISC
