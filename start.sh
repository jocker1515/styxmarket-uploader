#!/bin/bash

echo "=== Styxmarket Product Uploader Quick Start ==="
echo

echo "Checking if Chrome is running with remote debugging..."
sleep 2

echo
echo "If Chrome is not running, please start it with:"
echo "chrome --remote-debugging-port=9222 --user-data-dir=\"/tmp/chrome-debug\""
echo
echo "Then login to your styxmarket account."
echo

echo "Starting test suite..."
npm test

echo
echo "If all tests pass, run:"
echo "npm run upload-test"
echo

read -p "Press Enter to continue..."