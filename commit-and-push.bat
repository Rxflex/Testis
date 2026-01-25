@echo off
echo Committing Docker configuration fixes...

git add .
git commit -m "fix: resolve Docker deployment issues

- Fix ClickHouse IPv6 configuration conflict (use IPv4 only)
- Replace curl with wget in health checks for better Alpine compatibility
- Increase health check start periods and retries for stability
- Update collector, web, and ClickHouse health check configurations"

echo Pushing to remote repository...
git push

echo Done!
pause