@echo off
echo ==========================================
echo    Fixing Frontend Deployment (Error 126)
echo ==========================================

echo [INFO] Removing UI/node_modules from git tracking (if present)...
git rm -r --cached UI/node_modules
git rm -r --cached node_modules

echo [INFO] Updating gitignore rules...
echo node_modules/ >> .gitignore
echo UI/node_modules/ >> .gitignore

echo [INFO] Committing fix...
git add .gitignore
git commit -m "Fix: Remove node_modules from git to prevent platform conflicts"

echo.
echo ==========================================
echo    Success! Now run: git push origin Rahul-Rai
echo ==========================================
pause
