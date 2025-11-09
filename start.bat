@echo off
echo === Styxmarket Product Uploader Quick Start ===
echo.

echo Checking if Chrome is running with remote debugging...
timeout /t 2 >nul

echo.
echo If Chrome is not running, please start it with:
echo chrome --remote-debugging-port=9222 --user-data-dir="C:\ChromeDebug"
echo.
echo Then login to your styxmarket account.
echo.

echo Starting test suite...
npm test

echo.
echo If all tests pass, run:
echo npm run upload-test
echo.

pause