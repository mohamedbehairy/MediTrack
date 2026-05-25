const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adherenceEngine = require('../services/adherenceEngine');

// Get Doctor Dashboard (Appointments, Patient list limit)
exports.getDashboard = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        appointments: {
          include: { patient: { include: { user: true } } },
          orderBy: { date: 'asc' }
        },
        prescriptions: {
          include: {
            patient: { include: { user: true }},
            medications: {
              include: { 
                medication: true, 
                adherenceLogs: true 
              }
            }
          }
        }
      }
    });

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Calculate generic Alerts for < 50% Adherence rule
    const alerts = [];
    doctor.prescriptions.forEach(px => {
      px.medications.forEach(pm => {
        const metrics = adherenceEngine.calculateAdherence({
           prescription: px,
           frequency: pm.frequency,
           adherenceLogs: pm.adherenceLogs || []
        });
        
        if (metrics.isCritical) {
          alerts.push({
            type: 'LOW_ADHERENCE',
            patientName: `${px.patient.user.firstName} ${px.patient.user.lastName}`,
            patientId: px.patient.id,
            medicationName: pm.medication.name,
            adherencePercentage: metrics.percentage,
            message: `Adherence dropped to ${metrics.percentage}% on ${pm.medication.name}. Immediate monitoring recommended.`
          });
        }
      });
    });

    res.json({ ...doctor, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving doctor dashboard' });
  }
};

// Search all patients (unified medical history requirement)
exports.searchPatients = async (req, res) => {
  try {
    const query = req.query.query || '';
    const patients = await prisma.patient.findMany({
      where: {
        user: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } }
          ]
        }
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
    
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving patient catalog' });
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};
// Upload credentials (profile photo, license)
exports.uploadCredentials = async (req, res) => {
  const userId = req.user.id; // from verifyToken

  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    let dataToUpdate = {};
    if (req.files) {
      if (req.files.profileImage) {
        dataToUpdate.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
      }
      if (req.files.licenseImage) {
        dataToUpdate.licenseImage = `/uploads/${req.files.licenseImage[0].filename}`;
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'No files provided for upload' });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { userId },
      data: dataToUpdate
    });

    res.json({ message: 'Files uploaded successfully', doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading credentials' });
  }
};

const bcrypt = require('bcryptjs');

// Get platform-wide stats for Admin dashboard
exports.getPlatformStats = async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount, prescriptionCount] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.prescription.count(),
    ]);

    res.json({
      doctorCount,
      patientCount,
      appointmentCount,
      prescriptionCount,
      activeUsers: doctorCount + patientCount // Simple metric
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching platform statistics' });
  }
};

// Update Doctor Profile info and Password
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, specialization, clinicAddress, password } = req.body;

  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    // Update User table basics
    let userUpdateData = { firstName, lastName };
    
    // Hash new password if passed
    if (password && password.trim() !== '') {
       const salt = await bcrypt.genSalt(10);
       userUpdateData.password = await bcrypt.hash(password, salt);
    }

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    // Update Doctor table specifics
    const updatedDoctor = await prisma.doctor.update({
      where: { userId },
      data: { specialization, clinicAddress }
    });

    res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
