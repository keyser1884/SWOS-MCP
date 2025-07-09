@echo off
cd /d "C:\dev\swos"

echo Setting up git configuration...
git config --global init.defaultBranch main
git config --global user.email "you@example.com"
git config --global user.name "keyser1884"

echo Checking current branch...
git branch

echo Renaming branch to main if needed...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
echo Deployment complete!
echo Repository: https://github.com/keyser1884/SWOS-MCP
pause
