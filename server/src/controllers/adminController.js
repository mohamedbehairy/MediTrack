const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  const { role, q = '' } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q ? {
          OR: [
            { firstName: { contains: q } },
            { lastName:  { contains: q } },
            { email:     { contains: q } },
          ],
        } : {}),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, createdAt: true, isLocked: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// GET /api/admin/appointments - Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// GET /api/admin/patients - Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        prescriptions: { select: { id: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

// PATCH /api/admin/users/:id/lock - Lock a user account
exports.lockUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isLocked: true },
      select: { id: true, email: true, firstName: true, lastName: true, isLocked: true },
    });

    res.json({ message: 'User account locked successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error locking user' });
  }
};

// PATCH /api/admin/users/:id/unlock - Unlock a user account
exports.unlockUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isLocked: false },
      select: { id: true, email: true, firstName: true, lastName: true, isLocked: true },
    });

    res.json({ message: 'User account unlocked successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error unlocking user' });
  }
};

// DELETE /api/admin/users/:id  — cascades all related data
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cascade manually in dependency order
    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (patient) {
        await prisma.adherenceLog.deleteMany({ where: { patientId: patient.id } });
        // Delete prescription medications first
        const prescriptions = await prisma.prescription.findMany({ where: { patientId: patient.id } });
        for (const px of prescriptions) {
          await prisma.prescriptionMedication.deleteMany({ where: { prescriptionId: px.id } });
        }
        await prisma.prescription.deleteMany({ where: { patientId: patient.id } });
        await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
        await prisma.patient.delete({ where: { userId } });
      }
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (doctor) {
        const prescriptions = await prisma.prescription.findMany({ where: { doctorId: doctor.id } });
        for (const px of prescriptions) {
          await prisma.prescriptionMedication.deleteMany({ where: { prescriptionId: px.id } });
        }
        await prisma.prescription.deleteMany({ where: { doctorId: doctor.id } });
        await prisma.appointment.deleteMany({ where: { doctorId: doctor.id } });
        await prisma.doctor.delete({ where: { userId } });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: `User "${user.email}" deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// GET /api/admin/overview
exports.getOverview = async (req, res) => {
  try {
    const [
      usersByRole,
      totalAppointments,
      scheduledAppointments,
      totalPrescriptions,
      totalAdherenceLogs,
      inventory,
      recentUsers,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.prescription.count(),
      prisma.adherenceLog.count(),
      prisma.inventory.findMany({ include: { medication: { select: { name: true } } }, orderBy: { stockLevel: 'asc' }, take: 5 }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, firstName: true, lastName: true, role: true, email: true, createdAt: true } }),
    ]);

    const counts = { DOCTOR: 0, PATIENT: 0, PHARMACIST: 0, ADMIN: 0 };
    usersByRole.forEach(r => { counts[r.role] = r._count.id; });

    const lowStockItems = inventory.filter(i => i.stockLevel < 50).length;

    res.json({
      counts,
      totalAppointments,
      scheduledAppointments,
      totalPrescriptions,
      totalAdherenceLogs,
      lowStockItems,
      recentUsers,
      criticalInventory: inventory.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching overview' });
  }
};
