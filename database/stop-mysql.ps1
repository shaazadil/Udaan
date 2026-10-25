# =============================================================================
# UDAAN AI — STOP LOCAL MYSQL SERVER
# Cleanly shuts down the local MySQL Server
# =============================================================================

$mySqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"

Write-Host "Shutting down MySQL Server..." -ForegroundColor Yellow
& "$mySqlBin\mysqladmin.exe" -u root -p170308 shutdown
Write-Host "MySQL Server stopped." -ForegroundColor Green
