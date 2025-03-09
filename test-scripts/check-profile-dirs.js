/**
 * Simple Profile Directories Check
 * 
 * Checks if profile and avatar directories exist in the file system.
 */

const fs = require('fs');

// Check if a directory exists
const dirExists = (path) => {
  try {
    return fs.statSync(path).isDirectory();
  } catch (error) {
    return false;
  }
};

// Get home directory
const HOME_DIR = process.env.HOME;
const PROFILE_DIR = `${HOME_DIR}/profiles`;
const AVATAR_DIR = `${HOME_DIR}/avatars`;

console.log('Profile Directories Check');
console.log('========================');
console.log(`Home directory: ${HOME_DIR}`);
console.log(`Checking: ${PROFILE_DIR}`);

if (dirExists(PROFILE_DIR)) {
  console.log(`✅ Profiles directory exists: ${PROFILE_DIR}`);
} else {
  console.log(`❌ Profiles directory DOES NOT exist: ${PROFILE_DIR}`);
}

console.log(`Checking: ${AVATAR_DIR}`);
if (dirExists(AVATAR_DIR)) {
  console.log(`✅ Avatars directory exists: ${AVATAR_DIR}`);
} else {
  console.log(`❌ Avatars directory DOES NOT exist: ${AVATAR_DIR}`);
}

// Check permissions
try {
  fs.accessSync(PROFILE_DIR, fs.constants.R_OK | fs.constants.W_OK);
  console.log(`✅ Profiles directory has read/write permissions`);
} catch (error) {
  console.log(`❌ Profiles directory lacks proper permissions`);
}

try {
  fs.accessSync(AVATAR_DIR, fs.constants.R_OK | fs.constants.W_OK);
  console.log(`✅ Avatars directory has read/write permissions`);
} catch (error) {
  console.log(`❌ Avatars directory lacks proper permissions`);
}

// Check if we can create a test file
const TEST_FILE_PROFILE = `${PROFILE_DIR}/test-file.txt`;
const TEST_FILE_AVATAR = `${AVATAR_DIR}/test-file.txt`;

try {
  fs.writeFileSync(TEST_FILE_PROFILE, 'Test content');
  console.log(`✅ Successfully wrote test file to profiles directory`);
  fs.unlinkSync(TEST_FILE_PROFILE);
  console.log(`✅ Successfully removed test file from profiles directory`);
} catch (error) {
  console.log(`❌ Failed to write/remove test file in profiles directory: ${error.message}`);
}

try {
  fs.writeFileSync(TEST_FILE_AVATAR, 'Test content');
  console.log(`✅ Successfully wrote test file to avatars directory`);
  fs.unlinkSync(TEST_FILE_AVATAR);
  console.log(`✅ Successfully removed test file from avatars directory`);
} catch (error) {
  console.log(`❌ Failed to write/remove test file in avatars directory: ${error.message}`);
}

console.log('\nSummary');
console.log('=======');
const profileOk = dirExists(PROFILE_DIR);
const avatarOk = dirExists(AVATAR_DIR);

if (profileOk && avatarOk) {
  console.log('✅ All profile directories exist and are accessible.');
  console.log('Ready to proceed with testing the Profile Settings feature.');
} else {
  console.log('❌ Some directories are missing or inaccessible.');
  console.log('Please create these directories before proceeding.');
}
