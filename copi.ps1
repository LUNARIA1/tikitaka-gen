# GitHub OAuth Device Flow Script
$CLIENT_ID = "01ab8ac9400c4e429b23"

Write-Host "GitHub OAuth Device Flow" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

try {
    # Get device code
    Write-Host "Getting device code..."
    $deviceBody = @{
        client_id = $CLIENT_ID
        scope = "user:email"
    } | ConvertTo-Json

    $deviceHeaders = @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }

    $deviceResponse = Invoke-RestMethod -Uri "https://github.com/login/device/code" -Method POST -Headers $deviceHeaders -Body $deviceBody

    # Show instructions
    Write-Host ""
    Write-Host "1. Go to: $($deviceResponse.verification_uri)" -ForegroundColor Cyan
    Write-Host "2. Enter the code: $($deviceResponse.user_code)" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after completing authentication"

    # Poll for access token
    Write-Host "Getting access token..." -ForegroundColor Yellow
    
    $tokenBody = @{
        client_id = $CLIENT_ID
        device_code = $deviceResponse.device_code
        grant_type = "urn:ietf:params:oauth:grant-type:device_code"
        scope = "user:email"
    } | ConvertTo-Json

    $maxAttempts = 30
    $attempt = 0

    do {
        $attempt++
        Start-Sleep -Seconds 5
        
        try {
            $tokenResponse = Invoke-RestMethod -Uri "https://github.com/login/oauth/access_token" -Method POST -Headers $deviceHeaders -Body $tokenBody
            
            if ($tokenResponse.access_token) {
                # Save token to file
                $tokenResponse.access_token | Out-File -FilePath "token.txt" -Encoding UTF8 -NoNewline
                Write-Host ""
                Write-Host "Success! Token saved to: $(Get-Location)\token.txt" -ForegroundColor Green
                Write-Host "Token: $($tokenResponse.access_token)" -ForegroundColor Green
                return
            }
            elseif ($tokenResponse.error -eq "authorization_pending") {
                Write-Host "Waiting for authorization... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
                continue
            }
            else {
                Write-Host "Error: $($tokenResponse.error)" -ForegroundColor Red
                exit 1
            }
        }
        catch {
            Write-Host "Error getting access token: $_" -ForegroundColor Red
            exit 1
        }
    } while ($attempt -lt $maxAttempts)

    Write-Host "Timeout waiting for authorization" -ForegroundColor Red
    exit 1
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}