@echo off
echo ==========================================
echo    FORCE CLEANUP for Vercel 126 Error
echo ==========================================

echo [INFO] Step 1: Force untrack 'node_modules' in root...
git rm -r -f --cached node_modules 2>nul

echo [INFO] Step 2: Force untrack 'UI/node_modules'...
git rm -r -f --cached UI/node_modules 2>nul

echo [INFO] Step 3: Ensure .gitignore is correct...
findstr /C:"node_modules/" .gitignore >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo node_modules/ >> .gitignore
)

echo [INFO] Step 4: Committing changes...
git add .gitignore
git commit -m "FIX: Force remove node_modules binaries to resolve Vercel Error 126"

echo.
echo ==========================================
echo    DONE!
echo    Please run: git push origin Rahul-Rai
echo ==========================================
pause
