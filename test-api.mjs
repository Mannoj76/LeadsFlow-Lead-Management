// Test API endpoints
const baseUrl = 'http://localhost:5001/api';

async function testAuthMethods() {
  try {
    console.log('Testing GET /config/auth/methods...');
    const response = await fetch(`${baseUrl}/config/auth/methods`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testAuthConfig() {
  try {
    console.log('\nTesting GET /config/auth...');
    const response = await fetch(`${baseUrl}/config/auth`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  await testAuthMethods();
  await testAuthConfig();
}

main();
