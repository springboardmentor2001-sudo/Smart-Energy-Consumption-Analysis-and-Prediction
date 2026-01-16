@echo off
echo ==========================================
echo    Preparing Deployment Commit
echo ==========================================

echo [INFO] Adding Vercel configurations...
git add Backend/vercel.json
git add UI/vercel.json
git add UI/vite.config.js
git add UI/src/services/api.js

echo [INFO] Committing changes...
git commit -m "Add Dual Vercel Deployment Configuration"

echo.
echo ==========================================
echo    Success! 
echo    Now run: git push origin Rahul-Rai
echo ==========================================
pause
