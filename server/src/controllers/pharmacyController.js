const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/pharmacy/inventory — full medication list with stock
exports.getInventory = async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      include: { inventory: true },
      orderBy: { name: 'asc' },
    });
    res.json(medications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
};

// PUT /api/pharmacy/inventory/:medicationId/restock — add stock units
exports.restockMedication = async (req, res) => {
  const medicationId = parseInt(req.params.medicationId);
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Restock amount must be positive' });
  }

  try {
    const inventory = await prisma.inventory.findUnique({ where: { medicationId } });
    if (!inventory) {
      const created = await prisma.inventory.create({
        data: { medicationId, stockLevel: amount, lastRestock: new Date() },
      });
      return res.json({ message: 'Inventory created', inventory: created });
    }

    const updated = await prisma.inventory.update({
      where: { medicationId },
      data: { stockLevel: inventory.stockLevel + amount, lastRestock: new Date() },
    });
    res.json({ message: 'Restocked successfully', inventory: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error restocking medication' });
  }
};

// GET /api/pharmacy/prescriptions — all prescriptions with patient + doctor info
exports.getPrescriptions = async (req, res) => {
  const { q = '', status } = req.query;

  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        patient: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        medications: {
          include: {
            medication: { include: { inventory: true } },
            adherenceLogs: { orderBy: { dateTaken: 'desc' }, take: 5 },
          },
        },
      },
      orderBy: { dateIssued: 'desc' },
    });

    // Filter by search
    const filtered = prescriptions.filter(px => {
      if (!q) return true;
      const name = `${px.patient.user.firstName} ${px.patient.user.lastName}`.toLowerCase();
      return name.includes(q.toLowerCase()) || px.diagnosis.toLowerCase().includes(q.toLowerCase());
    });

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
};

// GET /api/pharmacy/stats — summary numbers for dashboard
exports.getStats = async (req, res) => {
  try {
    const [totalMeds, inventory, prescriptions, patients] = await Promise.all([
      prisma.medication.count(),
      prisma.inventory.findMany(),
      prisma.prescription.count(),
      prisma.patient.count(),
    ]);

    const totalStock = inventory.reduce((s, i) => s + i.stockLevel, 0);
    const lowStockItems = inventory.filter(i => i.stockLevel < 50).length;
    const outOfStock = inventory.filter(i => i.stockLevel === 0).length;

    res.json({ totalMeds, totalStock, lowStockItems, outOfStock, totalPrescriptions: prescriptions, totalPatients: patients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pharmacy stats' });
  }
};

// GET /api/pharmacy/patients — patient list with prescription summary (pharmacy view)
exports.getPatients = async (req, res) => {
  const { q = '' } = req.query;
  try {
    const patients = await prisma.patient.findMany({
      where: q ? {
        user: {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
          ],
        },
      } : undefined,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        prescriptions: {
          include: {
            medications: { include: { medication: { include: { inventory: true } }, adherenceLogs: true } },
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          orderBy: { dateIssued: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

// GET /api/pharmacy/medications — all medications
exports.getMedications = async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      include: { inventory: true },
      orderBy: { name: 'asc' },
    });
    res.json(medications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching medications' });
  }
};

// POST /api/pharmacy/medications — create a new medication
exports.createMedication = async (req, res) => {
  const { name, activeIngredient, description } = req.body;

  if (!name || !activeIngredient) {
    return res.status(400).json({ message: 'Name and active ingredient are required' });
  }

  try {
    const existing = await prisma.medication.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'A medication with this name already exists' });
    }

    const medication = await prisma.medication.create({
      data: { name, activeIngredient, description: description || null },
      include: { inventory: true },
    });
    res.status(201).json({ message: 'Medication created successfully', medication });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating medication' });
  }
};

// PUT /api/pharmacy/medications/:medicationId — update a medication
exports.updateMedication = async (req, res) => {
  const medicationId = parseInt(req.params.medicationId);
  const { name, activeIngredient, description } = req.body;

  if (!name || !activeIngredient) {
    return res.status(400).json({ message: 'Name and active ingredient are required' });
  }

  try {
    const existing = await prisma.medication.findUnique({ where: { id: medicationId } });
    if (!existing) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (name !== existing.name) {
      const duplicate = await prisma.medication.findUnique({ where: { name } });
      if (duplicate) {
        return res.status(400).json({ message: 'A medication with this name already exists' });
      }
    }

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: { name, activeIngredient, description: description || null },
      include: { inventory: true },
    });
    res.json({ message: 'Medication updated successfully', medication });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating medication' });
  }
};

// DELETE /api/pharmacy/medications/:medicationId — delete a medication
exports.deleteMedication = async (req, res) => {
  const medicationId = parseInt(req.params.medicationId);

  try {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: { prescriptions: true },
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (medication.prescriptions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete medication that is used in prescriptions. Remove from prescriptions first.'
      });
    }

    await prisma.medication.delete({ where: { id: medicationId } });
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting medication' });
  }
};

// GET /api/pharmacy/interactions — get all drug interactions
exports.getInteractions = async (req, res) => {
  try {
    const interactions = await prisma.drugInteraction.findMany({
      orderBy: [{ severity: 'desc' }, { id: 'asc' }],
    });
    res.json(interactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching interactions' });
  }
};

// POST /api/pharmacy/interactions — create a new drug interaction
exports.createInteraction = async (req, res) => {
  const { medication1Id, medication2Id, severity, description } = req.body;

  if (!medication1Id || !medication2Id || !severity || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const med1 = parseInt(medication1Id);
  const med2 = parseInt(medication2Id);

  if (med1 === med2) {
    return res.status(400).json({ message: 'Medications must be different' });
  }

  try {
    // Check if interaction already exists (in either direction)
    const existing = await prisma.drugInteraction.findFirst({
      where: {
        OR: [
          { medication1Id: med1, medication2Id: med2 },
          { medication1Id: med2, medication2Id: med1 },
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'This interaction already exists' });
    }

    const interaction = await prisma.drugInteraction.create({
      data: { medication1Id: med1, medication2Id: med2, severity, description }
    });
    res.status(201).json({ message: 'Interaction created successfully', interaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating interaction' });
  }
};

// PUT /api/pharmacy/interactions/:interactionId — update a drug interaction
exports.updateInteraction = async (req, res) => {
  const interactionId = parseInt(req.params.interactionId);
  const { medication1Id, medication2Id, severity, description } = req.body;

  if (!medication1Id || !medication2Id || !severity || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const med1 = parseInt(medication1Id);
  const med2 = parseInt(medication2Id);

  if (med1 === med2) {
    return res.status(400).json({ message: 'Medications must be different' });
  }

  try {
    const existing = await prisma.drugInteraction.findUnique({ where: { id: interactionId } });
    if (!existing) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    const interaction = await prisma.drugInteraction.update({
      where: { id: interactionId },
      data: { medication1Id: med1, medication2Id: med2, severity, description }
    });
    res.json({ message: 'Interaction updated successfully', interaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating interaction' });
  }
};

// DELETE /api/pharmacy/interactions/:interactionId — delete a drug interaction
exports.deleteInteraction = async (req, res) => {
  const interactionId = parseInt(req.params.interactionId);

  try {
    const interaction = await prisma.drugInteraction.findUnique({ where: { id: interactionId } });
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    await prisma.drugInteraction.delete({ where: { id: interactionId } });
    res.json({ message: 'Interaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting interaction' });
  }
};
