$content = Get-Content "D:\FitCoach\src\app\page.tsx" -Raw -Encoding UTF8
$lines = $content -split "`n"
$line = $lines[102]  # line 103 (0-indexed)
$chars = $line.ToCharArray()
for ($i = 0; $i -lt $chars.Count; $i++) {
    Write-Host ("{0:X4} " -f [int]$chars[$i]) -NoNewline
    if (($i + 1) % 20 -eq 0) { Write-Host "" }
}
Write-Host ""
Write-Host "Length: $($line.Length)"
# Find position of drop-shadow
$pos = $line.IndexOf("drop-shadow")
if ($pos -ge 0) {
    Write-Host "drop-shadow at pos $pos"
    Write-Host "Context: `"$($line.Substring([Math]::Max(0,$pos-5), 60))`""
}
