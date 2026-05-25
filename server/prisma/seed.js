const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DB Seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create 30 Medications
  const medicinesData = [
    { name: 'Aspirin', activeIngredient: 'Acetylsalicylic Acid', description: 'Pain reliever and fever reducer, anti-inflammatory' },
    { name: 'Ibuprofen', activeIngredient: 'Ibuprofen', description: 'NSAID for pain, fever, and inflammation relief' },
    { name: 'Paracetamol', activeIngredient: 'Acetaminophen', description: 'Mild pain reliever and fever reducer' },
    { name: 'Metformin', activeIngredient: 'Metformin Hydrochloride', description: 'Diabetes medication, improves blood sugar control' },
    { name: 'Lisinopril', activeIngredient: 'Lisinopril', description: 'ACE inhibitor for hypertension and heart failure' },
    { name: 'Atorvastatin', activeIngredient: 'Atorvastatin Calcium', description: 'Statin for cholesterol management' },
    { name: 'Omeprazole', activeIngredient: 'Omeprazole', description: 'Proton pump inhibitor for acid reflux and GERD' },
    { name: 'Amoxicillin', activeIngredient: 'Amoxicillin Trihydrate', description: 'Penicillin antibiotic for bacterial infections' },
    { name: 'Azithromycin', activeIngredient: 'Azithromycin Dihydrate', description: 'Macrolide antibiotic for respiratory infections' },
    { name: 'Ciprofloxacin', activeIngredient: 'Ciprofloxacin HCl', description: 'Fluoroquinolone antibiotic for various infections' },
    { name: 'Loratadine', activeIngredient: 'Loratadine', description: 'Antihistamine for allergy relief' },
    { name: 'Cetirizine', activeIngredient: 'Cetirizine Dihydrochloride', description: 'Second-generation antihistamine for allergies' },
    { name: 'Sertraline', activeIngredient: 'Sertraline Hydrochloride', description: 'SSRI antidepressant for depression and anxiety' },
    { name: 'Escitalopram', activeIngredient: 'Escitalopram Oxalate', description: 'SSRI for depression and anxiety disorders' },
    { name: 'Alprazolam', activeIngredient: 'Alprazolam', description: 'Benzodiazepine for anxiety and panic disorders' },
    { name: 'Salbutamol', activeIngredient: 'Salbutamol Sulfate', description: 'Beta-2 agonist bronchodilator for asthma' },
    { name: 'Fluticasone', activeIngredient: 'Fluticasone Propionate', description: 'Inhaled corticosteroid for asthma control' },
    { name: 'Warfarin', activeIngredient: 'Warfarin Sodium', description: 'Anticoagulant for blood clot prevention' },
    { name: 'Amlodipine', activeIngredient: 'Amlodipine Besylate', description: 'Calcium channel blocker for hypertension' },
    { name: 'Metoprolol', activeIngredient: 'Metoprolol Tartrate', description: 'Beta-blocker for hypertension and heart conditions' },
    { name: 'Insulin Glargine', activeIngredient: 'Insulin Glargine', description: 'Long-acting insulin for diabetes management' },
    { name: 'Levothyroxine', activeIngredient: 'Levothyroxine Sodium', description: 'Thyroid hormone replacement for hypothyroidism' },
    { name: 'Prednisone', activeIngredient: 'Prednisone', description: 'Corticosteroid for inflammation and immune conditions' },
    { name: 'Gabapentin', activeIngredient: 'Gabapentin', description: 'Anticonvulsant for nerve pain and seizures' },
    { name: 'Morphine', activeIngredient: 'Morphine Sulfate', description: 'Opioid pain reliever for severe pain' },
    { name: 'Diclofenac', activeIngredient: 'Diclofenac Sodium', description: 'NSAID for pain and inflammation' },
    { name: 'Metoclopramide', activeIngredient: 'Metoclopramide Hydrochloride', description: 'Anti-nausea medication and gastric motility enhancer' },
    { name: 'Ondansetron', activeIngredient: 'Ondansetron Hydrochloride', description: 'Anti-nausea medication for chemotherapy and post-op' },
    { name: 'Ranitidine', activeIngredient: 'Ranitidine Hydrochloride', description: 'H2-receptor antagonist for acid reduction' },
    { name: 'Doxycycline', activeIngredient: 'Doxycycline Hyclate', description: 'Tetracycline antibiotic for infections and acne' },
  ];

  const meds = [];
  for (const medData of medicinesData) {
    const med = await prisma.medication.upsert({
      where: { name: medData.name },
      update: {},
      create: medData
    });
    meds.push(med);
    console.log(`✅ Created/Updated: ${med.name}`);
  }

  // 2. Create Drug Interactions
  const interactions = [
    {
      med1: 0, // Aspirin
      med2: 17, // Warfarin
      severity: 'HIGH',
      description: 'Concurrent use increases the risk of severe bleeding. Both inhibit blood coagulation.'
    },
    {
      med1: 1, // Ibuprofen
      med2: 4, // Lisinopril
      severity: 'MODERATE',
      description: 'NSAIDs may reduce the antihypertensive effect of ACE inhibitors and increase risk of renal impairment.'
    },
    {
      med1: 3, // Metformin
      med2: 20, // Insulin Glargine
      severity: 'HIGH',
      description: 'Combined use significantly increases hypoglycemia risk. Close monitoring and dose adjustment needed.'
    },
    {
      med1: 12, // Sertraline
      med2: 14, // Alprazolam
      severity: 'MODERATE',
      description: 'Both cause CNS depression, increasing risk of drowsiness, dizziness, and impaired coordination.'
    },
    {
      med1: 8, // Azithromycin
      med2: 6, // Omeprazole
      severity: 'LOW',
      description: 'May reduce antibiotic absorption, but generally safe with monitoring.'
    },
    {
      med1: 2, // Paracetamol
      med2: 6, // Omeprazole
      severity: 'LOW',
      description: 'No significant interaction. Can be used together safely.'
    },
    {
      med1: 21, // Levothyroxine
      med2: 6, // Omeprazole
      severity: 'MODERATE',
      description: 'PPI may reduce thyroid hormone absorption. Administer at different times for optimal effect.'
    },
  ];

  for (const inter of interactions) {
    const existing = await prisma.drugInteraction.findFirst({
      where: {
        OR: [
          { medication1Id: meds[inter.med1].id, medication2Id: meds[inter.med2].id },
          { medication1Id: meds[inter.med2].id, medication2Id: meds[inter.med1].id },
        ]
      }
    });

    if (!existing) {
      await prisma.drugInteraction.create({
        data: {
          medication1Id: meds[inter.med1].id,
          medication2Id: meds[inter.med2].id,
          severity: inter.severity,
          description: inter.description
        }
      });
      console.log(`✅ Created interaction: ${meds[inter.med1].name} + ${meds[inter.med2].name}`);
    }
  }

  // 3. Create Pharmacy Inventory for all medications
  for (const med of meds) {
    await prisma.inventory.upsert({
      where: { medicationId: med.id },
      update: {},
      create: { medicationId: med.id, stockLevel: Math.floor(Math.random() * 400) + 50 }
    });
  }
  console.log(`✅ Created inventory for ${meds.length} medications`);

  // 4. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@meditrack.com' },
    update: {},
    create: {
      email: 'admin@meditrack.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin'
    }
  });

  // 5. Create Doctor
  const drHouseUser = await prisma.user.upsert({
    where: { email: 'house@meditrack.com' },
    update: {},
    create: {
      email: 'house@meditrack.com',
      password: hashedPassword,
      role: 'DOCTOR',
      firstName: 'Gregory',
      lastName: 'House',
      doctor: {
        create: {
          specialization: 'Diagnostic Medicine',
          clinicAddress: 'Princeton-Plainsboro Teaching Hospital'
        }
      }
    }
  });

  // 6. Create Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: hashedPassword,
      role: 'PATIENT',
      firstName: 'John',
      lastName: 'Doe',
      patient: {
        create: {
          dateOfBirth: new Date('1980-01-01'),
          bloodType: 'O+',
          medicalHistory: 'Hypertension, Mild Asthma'
        }
      }
    }
  });

  // 7. Create Appointment
  const patientRecord = await prisma.patient.findUnique({ where: { userId: patientUser.id }});
  const doctorRecord = await prisma.doctor.findUnique({ where: { userId: drHouseUser.id }});

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'SCHEDULED',
      notes: 'Routine checkup for blood pressure'
    }
  });

  // 8. Create Prescription & Meds attached to it
  const prescription = await prisma.prescription.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      diagnosis: 'Hypertension Management',
      medications: {
        create: [
          {
            medicationId: meds[4].id, // Lisinopril
            dosage: '10mg',
            frequency: '1x daily',
            durationDays: 30
          }
        ]
      }
    }
  });

  // 9. Create Pharmacist
  await prisma.user.upsert({
    where: { email: 'pharmacy@meditrack.com' },
    update: {},
    create: {
      email: 'pharmacy@meditrack.com',
      password: hashedPassword,
      role: 'PHARMACIST',
      firstName: 'Sara',
      lastName: 'PharmD'
    }
  });

  console.log('DB Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
