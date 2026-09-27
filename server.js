const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const app = express();

app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

const downloadDir = path.join(os.tmpdir()); // Use temp folder for cloud hosting

// Root route to ensure we serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/download', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('No URL provided');

  console.log(`Downloading: ${url}`);
  
  const outputPath = path.join(downloadDir, 'video.mp4');
  
  // Write cookies to a temp file if provided via env var
  const cookiesPath = path.join(os.tmpdir(), 'cookies.txt');
  if (process.env.COOKIES) {
    fs.writeFileSync(cookiesPath, process.env.COOKIES);
  }

  const cookiesFlag = fs.existsSync(cookiesPath)
    ? `--cookies "${cookiesPath}"`
    : '';

  const command = `./yt-dlp --js-runtime node ${cookiesFlag} -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Download failed: ' + error.message);
    }

    if (fs.existsSync(outputPath)) {
      res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
      res.download(outputPath, 'video.mp4', (err) => {
        if (err) console.error('Send error:', err);
        try { fs.unlinkSync(outputPath); } catch (e) {}
      });
    } else {
      res.status(500).send('File not found after download');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
