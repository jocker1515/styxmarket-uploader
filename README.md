# Styxmarket Product Uploader

Node.js + Puppeteer script for automated product upload to styxmarket.com

## Features

- Reads product data from Excel files
- Creates TXT files with product links
- Automates form filling and file upload
- Connects to existing Chrome browser (to avoid CAPTCHA)
- Test mode for processing single product

## Installation

```bash
npm install
```

## Setup

### Chrome Remote Debugging

1. Close all Chrome instances
2. Start Chrome with remote debugging enabled:

**Windows:**
```cmd
chrome --remote-debugging-port=9222 --user-data-dir="C:\ChromeDebug"
```

**Mac/Linux:**
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

3. Login to your styxmarket account in the browser
4. Run the script

## Usage

```bash
# Default usage (processes first product only for safety)
node index.js

# Specify custom Excel file path
node index.js "path/to/your/file.xlsx"

# Process all products (disable test mode)
node index.js --all

# Test mode with custom file
node index.js "path/to/file.xlsx" --test
```

## Excel File Format

The Excel file should contain the following columns:

| Column | Field | Description |
|--------|-------|-------------|
| file name | Product Name | Used for "Название предмета" field |
| Price | Price | Used for "Цена" field |
| textarea | Description | Used for "Описание" field |
| link | Link | Used to create TXT file for upload |

## How It Works

1. **Reads Excel file** - Extracts product data
2. **Creates TXT files** - For each product, creates a TXT file containing the link
3. **Connects to Chrome** - Uses existing browser session
4. **Fills form** - Automatically fills all required fields
5. **Uploads file** - Selects and uploads the created TXT file
6. **Submits form** - Clicks upload button and waits for completion

## Output

- Created TXT files are saved in `./output/` folder
- Console logs show progress and results
- Successful uploads are counted and reported

## Safety Features

- **Test mode enabled by default** - Only processes first product
- **Rate limiting** - 5-second delay between uploads
- **Error handling** - Continues processing even if individual uploads fail
- **Detailed logging** - Complete visibility into the process

## Troubleshooting

### Chrome Connection Issues
- Ensure Chrome is running with remote debugging on port 9222
- Check that no firewall is blocking the connection
- Verify Chrome is not already running without remote debugging

### Form Field Issues
- The script waits for form elements to load
- If the website structure changes, selectors may need updating
- Check browser console for any JavaScript errors

### File Upload Issues
- Ensure the output folder has write permissions
- Verify TXT files are being created correctly
- Check file input element exists on the form

## Dependencies

- `puppeteer` - Browser automation
- `xlsx` - Excel file reading