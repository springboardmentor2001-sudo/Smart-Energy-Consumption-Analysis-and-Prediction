# Run backend and frontend together for the Energy Prediction Web Application.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir 'backend'
$frontendDir = Join-Path $scriptDir 'frontend'

Start-Process pwsh -ArgumentList "-NoExit","-Command","Set-Location -Path '$backendDir'; if (Test-Path '.\\venv\\Scripts\\Activate.ps1') { .\\venv\\Scripts\\Activate.ps1 }; python app.py" -WindowStyle Normal
Start-Process pwsh -ArgumentList "-NoExit","-Command","Set-Location -Path '$frontendDir'; npm run dev -- --host 127.0.0.1" -WindowStyle Normal
