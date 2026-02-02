# Clear All Caches Script for EcoCred
Write-Host "🧹 Clearing all caches..." -ForegroundColor Green

# 1. Clear Next.js build cache
Write-Host "📁 Clearing Next.js build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Next.js cache cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Next.js cache found" -ForegroundColor Blue
}

# 2. Clear TypeScript build cache
Write-Host "📁 Clearing TypeScript build cache..." -ForegroundColor Yellow
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item -Force "tsconfig.tsbuildinfo"
    Write-Host "✅ TypeScript cache cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No TypeScript cache found" -ForegroundColor Blue
}

# 3. Clear npm cache
Write-Host "📦 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ npm cache cleared" -ForegroundColor Green

# 4. Clear node_modules (optional - uncomment if needed)
# Write-Host "📦 Clearing node_modules..." -ForegroundColor Yellow
# if (Test-Path "node_modules") {
#     Remove-Item -Recurse -Force "node_modules"
#     Write-Host "✅ node_modules cleared" -ForegroundColor Green
# }

# 5. Clear package-lock.json (optional - uncomment if needed)
# Write-Host "📦 Clearing package-lock.json..." -ForegroundColor Yellow
# if (Test-Path "package-lock.json") {
#     Remove-Item -Force "package-lock.json"
#     Write-Host "✅ package-lock.json cleared" -ForegroundColor Green
# }

Write-Host "🎉 All caches cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Clear your browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Start the development server: npm run dev" -ForegroundColor White
Write-Host "3. Use the admin panel to wipe MongoDB data if needed" -ForegroundColor White
