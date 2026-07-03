const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test script to diagnose upload issues
async function testUpload() {
  try {
    console.log('Testing upload functionality...');
    
    // Check if uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    console.log('Uploads directory:', uploadsDir);
    console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
    
    if (fs.existsSync(uploadsDir)) {
      const stats = fs.statSync(uploadsDir);
      console.log('Uploads directory permissions:', {
        readable: stats.mode & parseInt('400', 8) ? true : false,
        writable: stats.mode & parseInt('200', 8) ? true : false,
        executable: stats.mode & parseInt('100', 8) ? true : false
      });
    }
    
    // Test creating a test file
    const testDir = path.join(uploadsDir, 'test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
      console.log('Created test directory:', testDir);
    }
    
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, 'Test file content');
    console.log('Created test file:', testFile);
    
    // Clean up
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
    console.log('Cleaned up test files');
    
    console.log('File system test passed!');
    
  } catch (error) {
    console.error('File system test failed:', error);
  }
}

// Run the test
testUpload();