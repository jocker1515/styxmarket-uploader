const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Simple test script to verify Excel reading
async function testExcelReading() {
    const testPath = 'D:/gemini/Telegram-shop-main/Telegram-shop-main/test script/mega_full_report1.xlsx';
    
    try {
        console.log('Testing Excel file reading...');
        const workbook = XLSX.readFile(testPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Found ${data.length} rows`);
        if (data.length > 0) {
            console.log('First row data:', data[0]);
            console.log('Available columns:', Object.keys(data[0]));
        }
        
        return data;
    } catch (error) {
        console.error('Error reading Excel:', error.message);
        return null;
    }
}

// Test TXT file creation
async function testTxtCreation() {
    try {
        console.log('\nTesting TXT file creation...');
        
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output');
        }
        
        const testContent = 'https://example.com/test-link';
        const testFile = './output/test_link.txt';
        
        fs.writeFileSync(testFile, testContent, 'utf8');
        console.log('Created test file:', testFile);
        console.log('File content:', fs.readFileSync(testFile, 'utf8'));
        
        return true;
    } catch (error) {
        console.error('Error creating TXT file:', error.message);
        return false;
    }
}

// Test Puppeteer connection
async function testPuppeteerConnection() {
    try {
        console.log('\nTesting Puppeteer connection...');
        console.log('Make sure Chrome is running with: chrome --remote-debugging-port=9222');
        
        const browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });
        
        console.log('✅ Successfully connected to Chrome');
        
        const pages = await browser.pages();
        console.log(`Found ${pages.length} open tabs`);
        
        await browser.disconnect();
        console.log('✅ Successfully disconnected');
        
        return true;
    } catch (error) {
        console.error('❌ Puppeteer connection failed:', error.message);
        console.log('Please start Chrome with remote debugging enabled');
        return false;
    }
}

async function runTests() {
    console.log('=== Styxmarket Uploader Test Suite ===\n');
    
    // Test 1: Excel reading
    const excelData = await testExcelReading();
    
    // Test 2: TXT file creation
    const txtResult = await testTxtCreation();
    
    // Test 3: Puppeteer connection
    const puppeteerResult = await testPuppeteerConnection();
    
    console.log('\n=== Test Results ===');
    console.log('Excel Reading:', excelData ? '✅ PASS' : '❌ FAIL');
    console.log('TXT Creation:', txtResult ? '✅ PASS' : '❌ FAIL');
    console.log('Puppeteer Connection:', puppeteerResult ? '✅ PASS' : '❌ FAIL');
    
    if (excelData && txtResult && puppeteerResult) {
        console.log('\n🎉 All tests passed! Ready to run the main script.');
    } else {
        console.log('\n⚠️  Some tests failed. Please fix issues before running the main script.');
    }
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testExcelReading,
    testTxtCreation,
    testPuppeteerConnection
};