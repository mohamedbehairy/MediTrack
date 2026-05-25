const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const safetyEngine = require('../services/safetyEngine');

// Create Prescription
exports.createPrescription = async (req, res) => {
  const { patientId, doctorId: userDoctorId, diagnosis, medications, skipWarning } = req.body;
  // medications = [{ medicationId: 1, dosage: '10mg', frequency: 'daily', durationDays: 30 }]

  try {
    // 1. Resolve actual Doctor.id using the passed userDoctorId
    const doctorRecord = await prisma.doctor.findUnique({
      where: { userId: userDoctorId }
    });
    if (!doctorRecord) return res.status(404).json({ message: 'Doctor profile not found' });

    // 2. Resolve actual Patient.id using the passed patientId (which is userId from UI)
    const patientRecord = await prisma.patient.findUnique({
      where: { userId: patientId }
    });
    if (!patientRecord) return res.status(404).json({ message: 'Patient profile not found' });
    
    const actualPatientId = patientRecord.id;

    const medIds = medications.map(m => m.medicationId);
    
    // Check Safety Engine
    if (!skipWarning) {
      const interactionCheck = await safetyEngine.checkInteractions(actualPatientId, medIds);
      
      if (interactionCheck.interactionDetected) {
        // Return 409 Conflict with the exact requested JSON format
        return res.status(409).json(interactionCheck);
      }
    }

    // No conflict, or overwritten, create prescription
    const prescription = await prisma.prescription.create({
      data: {
        patientId: actualPatientId,
        doctorId: doctorRecord.id, // Fixed: use real Doctor.id
        diagnosis,
        medications: {
          create: medications.map(m => ({
            medicationId: m.medicationId,
            dosage: m.dosage,
            frequency: m.frequency,
            durationDays: m.durationDays
          }))
        }
      },
      include: {
        medications: { include: { medication: true } }
      }
    });

    res.status(201).json({ message: 'Prescription created successfully', prescription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating prescription' });
  }
};

// Fetch medications catalog for the UI dropdown
exports.getAllMedications = async (req, res) => {
  try {
    const meds = await prisma.medication.findMany({
      include: { inventory: true }
    });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medication catalog' });
  }
};
