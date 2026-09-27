const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
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
  // Use the local yt-dlp binary downloaded by the build script
  const command = `./yt-dlp --js-runtime node -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Download failed: ' + error.message);
    }
    res.send('Download completed to your Downloads folder!');
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
