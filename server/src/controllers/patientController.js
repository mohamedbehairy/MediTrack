const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adherenceEngine = require('../services/adherenceEngine');
const bcrypt = require('bcryptjs');

// Get all patients (for Doctor's patients directory)
exports.getAllPatients = async (req, res) => {
  try {
    const query = req.query.q || '';
    const patients = await prisma.patient.findMany({
      where: query ? {
        user: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ]
        }
      } : undefined,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } },
        prescriptions: {
          include: {
            medications: { include: { medication: true, adherenceLogs: true } },
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } }
          }
        },
        appointments: {
          orderBy: { date: 'desc' },
          take: 1,
          include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } }
        }
      },
      orderBy: { id: 'asc' }
    });

    const enriched = patients.map(p => {
      let totalExpected = 0, totalActual = 0;
      p.prescriptions.forEach(px => {
        px.medications.forEach(pm => {
          const m = adherenceEngine.calculateAdherence({ prescription: px, frequency: pm.frequency, adherenceLogs: pm.adherenceLogs || [] });
          totalExpected += m.expected;
          totalActual += m.actual;
        });
      });
      const overallAdherence = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : null;
      return { ...p, overallAdherence };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

// Get Patient Profile by ID
exports.getPatientProfile = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        appointments: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } }
          },
          orderBy: { date: 'asc' }
        },
        prescriptions: { include: { medications: { include: { medication: true, adherenceLogs: true } }, doctor: { include: { user: true } } } },
        adherenceLogs: true
      }
    });

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.prescriptions = patient.prescriptions.map(px => {
      px.medications = px.medications.map(pm => {
        const metrics = adherenceEngine.calculateAdherence({
          prescription: px,
          frequency: pm.frequency,
          adherenceLogs: pm.adherenceLogs || []
        });
        return { ...pm, adherenceMetrics: metrics };
      });
      return px;
    });

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving patient profile' });
  }
};

// Update Adherence Log
exports.markDoseTaken = async (req, res) => {
  const { prescriptionMedicationId } = req.body;
  
  try {
    const pMed = await prisma.prescriptionMedication.findUnique({
      where: { id: prescriptionMedicationId },
      include: { prescription: true }
    });
    
    if (!pMed) return res.status(404).json({ message: 'Medication not found in prescription' });

    const log = await prisma.adherenceLog.create({
      data: {
        patientId: pMed.prescription.patientId,
        prescriptionMedicationId,
        status: 'TAKEN'
      }
    });

    const inventory = await prisma.inventory.findUnique({ where: { medicationId: pMed.medicationId }});
    if (inventory && inventory.stockLevel > 0) {
       await prisma.inventory.update({
         where: { medicationId: pMed.medicationId },
         data: { stockLevel: inventory.stockLevel - 1 }
       });
    }

    res.json({ message: 'Dose logged successfully, inventory updated', log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error marking dose' });
  }
};

// Update Patient Profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, bloodType, dateOfBirth, medicalHistory, password } = req.body;

  try {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    let userUpdateData = { firstName, lastName };
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      userUpdateData.password = await bcrypt.hash(password, salt);
    }

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    const updatedPatient = await prisma.patient.update({
      where: { userId },
      data: { 
        bloodType, 
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        medicalHistory 
      }
    });

    res.json({ message: 'Profile updated successfully', patient: updatedPatient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
