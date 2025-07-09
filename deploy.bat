@echo off
cd /d "C:\dev\swos"
echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit: SWOS MCP Server v1.0"

echo Adding remote origin...
git remote add origin https://github.com/keyser1884/SWOS-MCP.git

echo Pushing to GitHub...
git push -u origin main

echo.
echo Deployment complete!
echo Repository: https://github.com/keyser1884/SWOS-MCP
pause
