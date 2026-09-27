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

const downloadDir = path.join(os.homedir(), 'Downloads');

// Root route to ensure we serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/download', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('No URL provided');

  console.log(`Downloading: ${url}`);

  const outputPath = path.join(downloadDir, '%(title)s.%(ext)s');

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

    // Find the downloaded file (yt-dlp may add extension like .mp4)
    const files = fs.readdirSync(downloadDir)
      .filter(f => fs.statSync(path.join(downloadDir, f)).mtime > new Date(Date.now() - 10000)
      && f !== 'cookies.txt');

    if (files.length === 0) {
      return res.status(500).send('File not found after download');
    }

    const filePath = path.join(downloadDir, files[0]);
    res.download(filePath, (err) => {
      if (err) console.error('Send error:', err);
      // Clean up temp file
      try { fs.unlinkSync(filePath); } catch (e) {}
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});