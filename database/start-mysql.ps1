# =============================================================================
# UDAAN AI — START LOCAL MYSQL SERVER
# Runs the local MySQL Server on port 3306
# =============================================================================

$mySqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$dataDir = "$PSScriptRoot\data"

Write-Host "Starting MySQL Server for Udaan AI on port 3306..." -ForegroundColor Green
Start-Process -FilePath "$mySqlBin\mysqld.exe" -ArgumentList "--datadir=`"$dataDir`"", "--port=3306", "--console" -NoNewWindow
Write-Host "MySQL Server started successfully!" -ForegroundColor Green
