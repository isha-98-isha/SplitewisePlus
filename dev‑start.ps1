$pid = (netstat -ano | Select-String ':8080\s+LISTENING' | foreach { $_.Line.Split()[-1] }) -as [int]
if ($pid) {
    Write-Host "Killing stray process $pid on port 8080..."
    Stop-Process -Id $pid -Force
}