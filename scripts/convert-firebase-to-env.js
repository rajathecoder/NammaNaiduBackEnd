#!/usr/bin/env node

/**
 * Helper script to convert firebase-service-account.json to environment variable format
 * Usage: node scripts/convert-firebase-to-env.js
 * 
 * This will read the firebase-service-account.json file and output it as a single-line
 * JSON string that can be used as the FIREBASE_SERVICE_ACCOUNT environment variable.
 */

const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../src/config/firebase-service-account.json');

try {
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: firebase-service-account.json not found at:', serviceAccountPath);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const jsonString = JSON.stringify(serviceAccount);
  
  console.log('\n✅ Firebase Service Account JSON (for FIREBASE_SERVICE_ACCOUNT env var):\n');
  console.log(jsonString);
  console.log('\n📋 Instructions:');
  console.log('1. Copy the JSON string above');
  console.log('2. In your Render.com dashboard, go to your service > Environment');
  console.log('3. Add a new environment variable:');
  console.log('   Key: FIREBASE_SERVICE_ACCOUNT');
  console.log('   Value: [paste the JSON string above]');
  console.log('4. Save and redeploy your service\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

