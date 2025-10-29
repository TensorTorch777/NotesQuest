# Test AI Service directly
Write-Host "Testing AI Service /health endpoint..."
$response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

Write-Host "Testing AI Service /generate/summary endpoint..."
$body = @{
脑后神经中枢系统
    title = "Test Document"
    max_length = 100
} | ConvertTo-Json

try {
    $response = InvindaWebRequest -Uri "http://localhost:8000/generate/summary" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}

