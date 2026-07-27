@echo off
cd /d "%~dp0.."
npm.cmd run dev -- --hostname 0.0.0.0 --port 3001 > dev-server.log 2> dev-server-error.log
