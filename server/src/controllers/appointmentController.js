const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new appointment
exports.createAppointment = async (req, res) => {
  const { patientId: userPatientId, doctorId, date, notes } = req.body;

  try {
    // Resolve actual Patient.id using the passed userPatientId (which is user.id from frontend)
    const patientRecord = await prisma.patient.findUnique({
      where: { userId: userPatientId }
    });
    if (!patientRecord) {
      return res.status(404).json({ message: 'Patient profile not found for this user' });
    }

    // Also resolve Doctor.id if doctorId is a userId
    let actualDoctorId = doctorId;
    const doctorRecord = await prisma.doctor.findUnique({ where: { userId: doctorId } });
    if (doctorRecord) actualDoctorId = doctorRecord.id;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientRecord.id,
        doctorId: actualDoctorId,
        date: new Date(date),
        status: 'SCHEDULED',
        notes
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { include: { user: { select: { firstName: true, lastName: true, email: true } } } }
      }
    });

    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error scheduling appointment' });
  }
};

// Get all appointments for a specific doctor (dedicated, lightweight endpoint)
exports.getDoctorAppointments = async (req, res) => {
  const doctorUserId = parseInt(req.params.doctorId);
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prescriptions: { select: { id: true } }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Update Appointment Status (e.g. COMPLETED, CANCELLED)
exports.updateAppointmentStatus = async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const { status } = req.body;

  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } }
      }
    });

    res.json({ message: `Appointment marked as ${status}`, appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
};

// Update appointment notes
exports.updateAppointmentNotes = async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const { notes } = req.body;
  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes }
    });
    res.json({ message: 'Notes updated', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating notes' });
  }
};
