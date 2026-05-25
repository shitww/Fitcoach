@echo off
chcp 65001 >nul
title FitCoach 手机测试

echo 正在停止旧服务...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo 正在构建最新代码...
call npm run build

echo 正在启动服务...
start "FitCoach Server" cmd /k "npm start"

echo.
echo ✓ 服务已启动！
echo ✓ 现在双击 run_natapp.bat 开启隧道
echo ✓ 手机访问: http://na3c6afe.natappfree.cc
echo.
pause
