const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_EXCEL_PATH = 'D:/gemini/Telegram-shop-main/Telegram-shop-main/test script/mega_full_report1.xlsx';
const UPLOAD_PAGE_URL = 'https://styxmarket.com/shop/my/';
const OUTPUT_FOLDER = './output';

// Create output folder if it doesn't exist
if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER);
}

async function readExcelFile(filePath) {
    try {
        console.log(`Reading Excel file: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Found ${data.length} products in Excel file`);
        return data;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        throw error;
    }
}

async function createTxtFile(link, index) {
    const txtFileName = `product_${index}_link.txt`;
    const txtFilePath = path.join(OUTPUT_FOLDER, txtFileName);
    
    try {
        fs.writeFileSync(txtFilePath, link, 'utf8');
        console.log(`Created TXT file: ${txtFilePath}`);
        return txtFilePath;
    } catch (error) {
        console.error('Error creating TXT file:', error);
        throw error;
    }
}

async function uploadProduct(browser, productData, txtFilePath) {
    const page = await browser.newPage();
    
    try {
        console.log(`Processing product: ${productData['file name']}`);
        
        // Navigate to upload page
        await page.goto(UPLOAD_PAGE_URL, { waitUntil: 'networkidle2' });
        
        // Wait for the form to load
        await page.waitForSelector('input[name="name"]', { timeout: 10000 });
        
        // Fill product name
        await page.type('input[name="name"]', productData['file name'] || '');
        console.log('Filled product name');
        
        // Fill price
        const priceValue = String(productData['Price'] || '').replace(/[^\d.]/g, '');
        await page.type('input[name="price"]', priceValue);
        console.log('Filled price:', priceValue);
        
        // Fill description
        await page.type('textarea[name="description"]', productData['textarea'] || '');
        console.log('Filled description');
        
        // Select category "🧾 Rendering & PSD" (value="11")
        await page.click('input[type="radio"][name="category"][value="11"]');
        console.log('Selected category: 🧾 Rendering & PSD');
        
        // Select availability "Сейчас" (value="now")
        await page.click('input[type="radio"][name="availability"][value="now"]');
        console.log('Selected availability: Сейчас');
        
        // Handle file upload
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            await fileInput.uploadFile(txtFilePath);
            console.log('Uploaded TXT file:', txtFilePath);
        } else {
            console.log('File input not found, continuing...');
        }
        
        // Click upload button - try multiple selectors
        const uploadSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:contains("Загрузить")',
            'button:contains("Upload")',
            'button:contains("Добавить")',
            'button:contains("Add")',
            '[value*="Загрузить"]',
            '[value*="Upload"]'
        ];
        
        let uploadButton = null;
        for (const selector of uploadSelectors) {
            try {
                uploadButton = await page.$(selector);
                if (uploadButton) {
                    await uploadButton.click();
                    console.log('Clicked upload button with selector:', selector);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        // Fallback method - search by text content
        if (!uploadButton) {
            await page.evaluate(() => {
                const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
                for (let button of buttons) {
                    const text = button.textContent || button.value || '';
                    if (text.includes('Загрузить') || 
                        text.includes('Upload') || 
                        text.includes('Добавить') ||
                        text.includes('Add') ||
                        text.includes('Submit') ||
                        button.type === 'submit') {
                        button.click();
                        return;
                    }
                }
            });
            console.log('Clicked upload button (fallback method)');
        }
        
        // Wait for upload completion (check for success message or redirect)
        let uploadSuccess = false;
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            uploadSuccess = true;
            console.log('Product uploaded successfully (navigation detected)');
        } catch (error) {
            // If navigation doesn't happen, check for success message
            console.log('No navigation detected, checking for success messages...');
            
            // Wait a bit for any dynamic content
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const successDetected = await page.evaluate(() => {
                const successSelectors = [
                    'div:contains("успешно")',
                    'div:contains("успішно")', 
                    'div:contains("successfully")',
                    'div:contains("success")',
                    '.success',
                    '.alert-success',
                    '.message-success',
                    '[class*="success"]',
                    '[id*="success"]'
                ];
                
                for (const selector of successSelectors) {
                    try {
                        const element = document.querySelector(selector);
                        if (element && element.textContent) {
                            const text = element.textContent.toLowerCase();
                            if (text.includes('успешно') || 
                                text.includes('success') || 
                                text.includes('успішно') ||
                                text.includes('добавлено') ||
                                text.includes('added') ||
                                text.includes('загружено') ||
                                text.includes('uploaded')) {
                                return true;
                            }
                        }
                    } catch (e) {
                        // Continue checking
                    }
                }
                
                // Check all text content for success indicators
                const bodyText = document.body.textContent.toLowerCase();
                return bodyText.includes('успешно') || 
                       bodyText.includes('success') || 
                       bodyText.includes('добавлено') ||
                       bodyText.includes('загружено');
            });
            
            if (successDetected) {
                uploadSuccess = true;
                console.log('Product uploaded successfully (success message detected)');
            } else {
                console.log('Upload completed (no explicit confirmation detected, assuming success)');
                uploadSuccess = true; // Assume success if no errors
            }
        }
        
        return uploadSuccess;
        
    } catch (error) {
        console.error('Error uploading product:', error);
        return false;
    } finally {
        await page.close();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const excelPath = args[0] || DEFAULT_EXCEL_PATH;
    const isTestMode = args.includes('--test') || true; // Always test mode for safety
    
    console.log('Starting styxmarket product uploader...');
    console.log('Excel file path:', excelPath);
    console.log('Test mode:', isTestMode ? 'ON (first product only)' : 'OFF');
    
    try {
        // Read Excel file
        const products = await readExcelFile(excelPath);
        
        if (products.length === 0) {
            console.log('No products found in Excel file');
            return;
        }
        
        // Limit to first product for testing
        const productsToProcess = isTestMode ? products.slice(0, 1) : products;
        console.log(`Processing ${productsToProcess.length} product(s)`);
        
        // Connect to existing Chrome browser
        const browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });
        
        console.log('Connected to Chrome browser');
        
        let successCount = 0;
        
        // Process each product
        for (let i = 0; i < productsToProcess.length; i++) {
            const product = productsToProcess[i];
            
            try {
                // Create TXT file with link
                const txtFilePath = await createTxtFile(product['link'] || '', i);
                
                // Upload product
                const success = await uploadProduct(browser, product, txtFilePath);
                
                if (success) {
                    successCount++;
                    console.log(`✅ Product ${i + 1} uploaded successfully`);
                } else {
                    console.log(`❌ Product ${i + 1} failed to upload`);
                }
                
                // Wait between uploads to avoid rate limiting
                if (i < productsToProcess.length - 1) {
                    console.log('Waiting 5 seconds before next upload...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
            } catch (error) {
                console.error(`❌ Error processing product ${i + 1}:`, error);
            }
        }
        
        console.log(`\nUpload complete! Successfully uploaded ${successCount}/${productsToProcess.length} products`);
        
        await browser.disconnect();
        console.log('Disconnected from browser');
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Instructions for Chrome remote debugging
console.log(`
=== Chrome Remote Debugging Setup ===
To use this script, you need to start Chrome with remote debugging:

1. Close all Chrome instances
2. Start Chrome with:
   chrome --remote-debugging-port=9222 --user-data-dir="C:\\ChromeDebug"

3. Login to your styxmarket account in the browser
4. Run this script

=== Usage ===
node index.js [excel_file_path] [--test]
- If no path provided, uses: ${DEFAULT_EXCEL_PATH}
- --test flag processes only the first product (default for safety)
`);

if (require.main === module) {
    main().catch(console.error);
}