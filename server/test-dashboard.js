const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testDashboard() {
  try {
    console.log('🔍 Testing Admin Dashboard API Endpoints\n');

    // Step 1: Login
    console.log('📝 Step 1: Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@meditrack.com',
      password: 'password123',
    });
    const token = loginRes.data.token;
    console.log(`✅ Login successful. Token: ${token.substring(0, 20)}...\n`);

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Test /admin/overview
    console.log('📊 Step 2: Testing /admin/overview...');
    try {
      const overviewRes = await axios.get(`${BASE_URL}/admin/overview`, { headers });
      console.log(`✅ Overview endpoint works. Data:`, JSON.stringify(overviewRes.data, null, 2));
    } catch (err) {
      console.error(`❌ Overview endpoint failed:`, err.response?.status, err.response?.data);
    }
    console.log();

    // Step 3: Test /admin/users
    console.log('👥 Step 3: Testing /admin/users...');
    try {
      const usersRes = await axios.get(`${BASE_URL}/admin/users`, { headers });
      console.log(`✅ Users endpoint works. Count: ${usersRes.data.length}`);
      console.log('Data:', JSON.stringify(usersRes.data, null, 2));
    } catch (err) {
      console.error(`❌ Users endpoint failed:`, err.response?.status, err.response?.data);
    }
    console.log();

    // Step 4: Test /admin/appointments
    console.log('📅 Step 4: Testing /admin/appointments...');
    try {
      const appointmentsRes = await axios.get(`${BASE_URL}/admin/appointments`, { headers });
      console.log(`✅ Appointments endpoint works. Count: ${appointmentsRes.data.length}`);
      console.log('Data:', JSON.stringify(appointmentsRes.data, null, 2));
    } catch (err) {
      console.error(`❌ Appointments endpoint failed:`, err.response?.status, err.response?.data);
    }
    console.log();

    // Step 5: Test /admin/patients
    console.log('🏥 Step 5: Testing /admin/patients...');
    try {
      const patientsRes = await axios.get(`${BASE_URL}/admin/patients`, { headers });
      console.log(`✅ Patients endpoint works. Count: ${patientsRes.data.length}`);
      console.log('Data:', JSON.stringify(patientsRes.data, null, 2));
    } catch (err) {
      console.error(`❌ Patients endpoint failed:`, err.response?.status, err.response?.data);
    }

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

testDashboard();
