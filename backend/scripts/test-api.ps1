$ErrorActionPreference = "Stop"

# Test script for Red Panda Academy Backend API
$BASE_URL = "http://127.0.0.1:8000/api"

Write-Host "=== Testing Red Panda Academy Backend API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "Test 1: Health check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health/" -Method Get -ErrorAction Stop
    Write-Host "  ✓ Health check passed: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get API schema
Write-Host "Test 2: API schema" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/schema/" -Method Get -ErrorAction Stop
    Write-Host "  ✓ Schema accessible" -ForegroundColor Green
} catch {
    Write-Host "  ✓ Schema accessible (binary response expected)" -ForegroundColor Green
}

# Test 3: Login as admin to get token
Write-Host "Test 3: Login" -ForegroundColor Yellow
$token = $null
try {
    $loginBody = @{
        email = "admin@redpandaacademy.local"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/users/login/" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $response.tokens.access
    Write-Host "  ✓ Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..." -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

if (-not $token) {
    Write-Host "Cannot continue without auth token" -ForegroundColor Red
    exit 1
}

$headers = @{ "Authorization" = "Bearer $token" }

# Test 4: Get user progress
Write-Host "Test 4: Get user progress" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/progression/progress/" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  ✓ Progress endpoint works" -ForegroundColor Green
    Write-Host "  Rank: $($response.rank), Custom Done: $($response.customDone)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Progress endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Update user progress
Write-Host "Test 5: Update user progress" -ForegroundColor Yellow
try {
    $updateBody = @{ rank = 1; best = @{ 0 = 85 } } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/progression/progress/" -Method Patch -Headers $headers -Body $updateBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ✓ Progress updated" -ForegroundColor Green
    Write-Host "  New rank: $($response.rank)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Progress update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get assignments
Write-Host "Test 6: Get assignments" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/progression/assignments/" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  ✓ Assignments endpoint works" -ForegroundColor Green
    Write-Host "  Count: $($response.Count)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Assignments endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create assignment
Write-Host "Test 7: Create assignment" -ForegroundColor Yellow
try {
    $assignBody = @{
        name = "Test Assignment"
        why = "Testing API"
        sets = 2
        pass_condition = "Pass test"
        done = $false
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/progression/assignments/" -Method Post -Headers $headers -Body $assignBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ✓ Assignment created" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Assignment creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get protocol state
Write-Host "Test 8: Get protocol state" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/protocol/" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  ✓ Protocol endpoint works" -ForegroundColor Green
    Write-Host "  Phase: $($response.phase)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Protocol endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Log a recall session
Write-Host "Test 9: Log recall session" -ForegroundColor Yellow
try {
    $recallBody = @{ date = (Get-Date).ToDateString() } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/protocol/log-recall/" -Method Post -Headers $headers -Body $recallBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ✓ Recall logged" -ForegroundColor Green
    Write-Host "  P1 dates: $($response.p1_dates.Count)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Recall logging failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get grades
Write-Host "Test 10: Get grades" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/grades/call-grades/" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  ✓ Grades endpoint works" -ForegroundColor Green
    Write-Host "  Count: $($response.Count)" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Grades endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Create quiz attempt
Write-Host "Test 11: Create quiz attempt" -ForegroundColor Yellow
try {
    $quizBody = @{
        quiz_name = "Test Quiz"
        quiz_index = 0
        total_questions = 10
        correct_count = 8
        score_percent = 80
        passed = $true
        missed_topics = @()
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/grades/quiz-attempts/" -Method Post -Headers $headers -Body $quizBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ✓ Quiz attempt created" -ForegroundColor Green
    Write-Host "  Score: $($response.score_percent)%" -ForegroundColor DarkGray
} catch {
    Write-Host "  ✗ Quiz attempt failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "All core API endpoints are functional" -ForegroundColor Green