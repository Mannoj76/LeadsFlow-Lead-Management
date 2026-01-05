import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAPIUsers() {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 TESTING USER API ENDPOINT');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Step 1: Login to get token
    console.log('📋 STEP 1: Logging in to get authentication token');
    console.log('─────────────────────────────────────────────────────────');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'sujeet.karn@erpca.com',
      password: 'Admin@123',
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('');
    
    // Step 2: Fetch all users from API
    console.log('📋 STEP 2: Fetching users from API endpoint');
    console.log('─────────────────────────────────────────────────────────');
    const usersResponse = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const users = usersResponse.data;
    console.log(`✅ API returned ${users.length} users\n`);
    
    // Step 3: Display all users
    console.log('📋 STEP 3: Users returned by API');
    console.log('─────────────────────────────────────────────────────────');
    users.forEach((user: any, index: number) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  id:', user.id);
      console.log('  username:', user.username);
      console.log('  name:', user.name);
      console.log('  email:', user.email || '(not set)');
      console.log('  role:', user.role);
      console.log('  isActive:', user.isActive);
      console.log('  createdAt:', user.createdAt);
      console.log('  updatedAt:', user.updatedAt);
    });
    console.log('');
    
    // Step 4: Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('API Endpoint: GET /api/users');
    console.log('Total Users Returned:', users.length);
    console.log('');
    
    console.log('User List:');
    users.forEach((user: any, index: number) => {
      console.log(`  ${index + 1}. ${user.name} (${user.username}) - ${user.role}`);
    });
    console.log('');
    
    console.log('✅ This is what the frontend sees when it calls userService.getAll()');
    console.log('');
    
    // Step 5: Check if there are any recently created users
    const now = new Date();
    const recentUsers = users.filter((user: any) => {
      const createdAt = new Date(user.createdAt);
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      return diffMinutes < 30; // Created in last 30 minutes
    });
    
    if (recentUsers.length > 0) {
      console.log('🆕 Recently Created Users (last 30 minutes):');
      console.log('─────────────────────────────────────────────────────────');
      recentUsers.forEach((user: any) => {
        const createdAt = new Date(user.createdAt);
        const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
        console.log(`  - ${user.name} (${user.username})`);
        console.log(`    Created: ${minutesAgo} minutes ago`);
        console.log(`    ID: ${user.id}`);
      });
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIUsers();

