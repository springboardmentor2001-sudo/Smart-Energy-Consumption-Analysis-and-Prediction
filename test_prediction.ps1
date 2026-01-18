# Test the prediction API endpoint
$body = @{
    Temperature = 30
    Humidity = 65
    SquareFootage = 1500
    Occupancy = 5
    HVACUsage = 'On'
    LightingUsage = 'On'
    RenewableEnergy = 5
    DayOfWeek = 'Friday'
    Holiday = 'No'
} | ConvertTo-Json

Write-Host "Testing Smart Energy Prediction API..." -ForegroundColor Cyan
Write-Host "Input Data:" -ForegroundColor Yellow
Write-Host $body

Write-Host "`nSending request to http://localhost:5000/api/predict..." -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/predict' -Method POST -Body $body -ContentType 'application/json'

Write-Host "`nPrediction Result:" -ForegroundColor Green
Write-Host "Predicted Consumption: $($response.prediction) $($response.unit)" -ForegroundColor Green
Write-Host "`nInput Summary:" -ForegroundColor Yellow
$response.input_summary | Format-List

Write-Host "`nSmart Suggestions:" -ForegroundColor Magenta
foreach ($suggestion in $response.suggestions) {
    Write-Host "`n$($suggestion.icon) $($suggestion.title)" -ForegroundColor Cyan
    Write-Host "  $($suggestion.message)" -ForegroundColor White
    Write-Host "  Potential Savings: $($suggestion.savings)" -ForegroundColor Green
}
