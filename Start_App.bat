@echo off
title YouTube Downloader Setup
echo Starting YouTube Clone Downloader...

:: 1. Start the Node.js Server in a new window
start "Node Server" cmd /k "node server.js"

:: 2. Wait 3 seconds to ensure the server is ready
timeout /t 3

:: 3. Start ngrok using the path you found
start "Ngrok Tunnel" cmd /k "C:\Users\rajsi\AppData\Local\Microsoft\WindowsApps\ngrok.exe http 3000"

echo.
echo All processes started!
echo 1. Keep these two new windows open.
echo 2. Open http://localhost:3000 in your browser.
echo 3. Check the Ngrok window for your public URL to use on mobile.
echo.
pause