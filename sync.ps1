# FitCoach 自动同步脚本
# 用法: .\sync.ps1 ["提交信息"]

$msg = if ($args[0]) { $args[0] } else { "auto sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Write-Host "🔄 正在同步到 GitHub..." -ForegroundColor Cyan

# 检查是否有更改
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ 没有要提交的更改" -ForegroundColor Green
    exit 0
}

try {
    git add -A
    git commit -m "$msg"
    git push FitCoach master
    Write-Host "✅ 同步成功! $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
} catch {
    Write-Host "❌ 同步失败: $_" -ForegroundColor Red
}
