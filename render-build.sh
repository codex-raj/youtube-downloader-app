#!/usr/bin/env bash
# Download the latest yt-dlp Linux binary
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
# Make it executable
chmod a+rx yt-dlp
# Install your dependencies
npm install