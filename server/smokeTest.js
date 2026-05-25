const API_URL = 'http://localhost:5002/api';

async function req(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = text; }
  
  if (!res.ok) {
     const err = new Error(data?.message || 'Request failed');
     err.response = { status: res.status, data };
     throw err;
  }
  return { data };
}

async function runSmokeTests() {
  console.log('🚀 Starting MediTrack API E2E Smoke Tests...\n');

  try {
    // 1. Doctor Login
    console.log('--- Test 1: Doctor Authentication ---');
    const doctorLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'house@meditrack.com', password: 'password123'})
    });
    const doctorToken = doctorLogin.data.token;
    const doctorUser = doctorLogin.data.user;
    console.log(`✅ Doctor Logged in successfully.`);

    // 2. Doctor Dashboard
    console.log('--- Test 2: Doctor Dashboard Fetch ---');
    const dashboard = await req(`/doctors/${doctorUser.id}/dashboard`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log(`✅ Doctor Dashboard retrieved. Found ${dashboard.data.appointments.length} appointments.`);

    // 3. Admin/Pharmacist Login & Initial Inventory Check
    console.log('--- Test 3: Admin Inventory Check ---');
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@meditrack.com', password: 'password123'})
    });
    const adminToken = adminLogin.data.token;
    
    const inventoryBefore = await req('/prescriptions/medications', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const lisinoprilBefore = inventoryBefore.data.find(m => m.name === 'Lisinopril').inventory.stockLevel;
    const lisinoprilId = inventoryBefore.data.find(m => m.name === 'Lisinopril').id;
    console.log(`✅ Pharmacy Catalog loaded. Lisinopril stock is: ${lisinoprilBefore}`);

    // 4. Patient Login & Profile Fetch
    console.log('--- Test 4: Patient Portal Setup ---');
    const patientLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'patient@example.com', password: 'password123'})
    });
    const patientToken = patientLogin.data.token;
    const patientUser = patientLogin.data.user;
    
    const patientProfile = await req(`/patients/${patientUser.id}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    const activePrescription = patientProfile.data.prescriptions[0];
    const targetPMed = activePrescription.medications[0];
    console.log(`✅ Patient Profile verified. Targets pMed ID: ${targetPMed.id}`);

    // 5. Patient Marks Dose
    console.log('--- Test 5: Verify Adherence & Inventory Auto-Depletion ---');
    await req('/patients/mark-dose', {
      method: 'POST',
      body: JSON.stringify({ prescriptionMedicationId: targetPMed.id }),
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✅ Dose logged as Taken.');

    // Validate Stock Depleted
    const inventoryAfter = await req('/prescriptions/medications', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const lisinoprilAfter = inventoryAfter.data.find(m => m.name === 'Lisinopril').inventory.stockLevel;
    
    if (lisinoprilBefore - lisinoprilAfter === 1) {
       console.log(`✅ Inventory Successfully Auto-Deducted! (${lisinoprilBefore} -> ${lisinoprilAfter})`);
    } else {
       console.log(`❌ Inventory DID NOT deplete exactly 1 unit! (${lisinoprilBefore} -> ${lisinoprilAfter})`);
    }

    // 6. Safety Engine Test (Warfarin + Aspirin Clash)
    console.log('--- Test 6: Safety Engine Drug Interaction Rule ---');
    const aspirinId = inventoryAfter.data.find(m => m.name === 'Aspirin').id;
    const warfarinId = inventoryAfter.data.find(m => m.name === 'Warfarin').id;
    
    try {
      await req('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patientId: patientProfile.data.id,
          doctorId: dashboard.data.id,
          diagnosis: "Clotting disorder",
          medications: [
            { medicationId: aspirinId, dosage: "100mg", frequency: "daily", durationDays: 30 },
            { medicationId: warfarinId, dosage: "5mg", frequency: "daily", durationDays: 30 }
          ]
        }),
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('❌ Safety Engine FAILED. Prescription allowed without override warning!');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('✅ Safety Engine SUCCESS: Blocked prescription. Returned JSON Warning:');
        console.log(JSON.stringify(err.response.data.conflicts[0], null, 2));
      } else {
         console.log('❌ Unexpected error on safety check:', err.message);
      }
    }

    console.log('\n🎉 ALL TESTS COMPLETED 🎉');
  } catch (error) {
    console.error('\n❌ TEST SUITE CRASHED:', error.response?.data || error);
  }
}

runSmokeTests();
