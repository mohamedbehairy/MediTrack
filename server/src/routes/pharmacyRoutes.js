const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const pharmacyAccess = authorizeRoles('PHARMACIST', 'ADMIN');

/**
 * @swagger
 * /api/pharmacy/stats:
 *   get:
 *     summary: Get pharmacy dashboard statistics
 *     description: Returns aggregate numbers — total medications, total units in stock, low-stock count, out-of-stock count, total prescriptions and patients.
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: Pharmacy statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PharmacyStats'
 */
router.get('/stats', verifyToken, pharmacyAccess, pharmacyController.getStats);

/**
 * @swagger
 * /api/pharmacy/inventory:
 *   get:
 *     summary: Get the full medication inventory
 *     description: Returns all medications ordered alphabetically, each with its current inventory record (stock level and last restock date).
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: Inventory list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 */
router.get('/inventory', verifyToken, pharmacyAccess, pharmacyController.getInventory);

/**
 * @swagger
 * /api/pharmacy/inventory/{medicationId}/restock:
 *   put:
 *     summary: Restock a medication
 *     description: Adds the specified number of units to the medication's stock level and updates the `lastRestock` timestamp. If no inventory record exists yet, one is created.
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID (primary key)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestockRequest'
 *     responses:
 *       200:
 *         description: Restocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:   { type: string }
 *                 inventory: { $ref: '#/components/schemas/Inventory' }
 *       400:
 *         description: Restock amount must be positive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/inventory/:medicationId/restock', verifyToken, pharmacyAccess, pharmacyController.restockMedication);

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   get:
 *     summary: Get all prescriptions (pharmacy view)
 *     description: Returns every prescription with full patient, doctor, medication (including inventory), and adherence log data. Supports search via `?q=` (patient name or diagnosis).
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by patient name or diagnosis
 *     responses:
 *       200:
 *         description: Prescription list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/prescriptions', verifyToken, pharmacyAccess, pharmacyController.getPrescriptions);

/**
 * @swagger
 * /api/pharmacy/patients:
 *   get:
 *     summary: Get patients (pharmacy dispensing view)
 *     description: Returns patients with their prescriptions and medication-level inventory info — used by the pharmacist to check what needs dispensing or flagging. Supports `?q=` search.
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by first name, last name or email
 *     responses:
 *       200:
 *         description: Patient list (pharmacy view)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PatientProfile'
 */
router.get('/patients', verifyToken, pharmacyAccess, pharmacyController.getPatients);

/**
 * @swagger
 * /api/pharmacy/medications:
 *   get:
 *     summary: Get all medications
 *     description: Returns all medications with their inventory information
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: Medications list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *   post:
 *     summary: Create a new medication
 *     description: Creates a new medication in the system
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, activeIngredient]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aspirin"
 *               activeIngredient:
 *                 type: string
 *                 example: "Acetylsalicylic Acid"
 *               description:
 *                 type: string
 *                 example: "Pain reliever and fever reducer"
 *     responses:
 *       201:
 *         description: Medication created successfully
 *       400:
 *         description: Invalid input or medication already exists
 */
router.get('/medications', verifyToken, pharmacyAccess, pharmacyController.getMedications);
router.post('/medications', verifyToken, pharmacyAccess, pharmacyController.createMedication);

/**
 * @swagger
 * /api/pharmacy/medications/{medicationId}:
 *   put:
 *     summary: Update a medication
 *     description: Updates an existing medication
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, activeIngredient]
 *             properties:
 *               name:
 *                 type: string
 *               activeIngredient:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medication updated successfully
 *       404:
 *         description: Medication not found
 *   delete:
 *     summary: Delete a medication
 *     description: Deletes a medication (cannot have active prescriptions)
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medication deleted successfully
 *       400:
 *         description: Cannot delete medication with active prescriptions
 *       404:
 *         description: Medication not found
 */
router.put('/medications/:medicationId', verifyToken, pharmacyAccess, pharmacyController.updateMedication);
router.delete('/medications/:medicationId', verifyToken, pharmacyAccess, pharmacyController.deleteMedication);

/**
 * @swagger
 * /api/pharmacy/interactions:
 *   get:
 *     summary: Get all drug interactions
 *     description: Returns all recorded drug interactions sorted by severity
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: Interactions list
 *   post:
 *     summary: Create a new drug interaction
 *     description: Records a new interaction between two medications
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medication1Id, medication2Id, severity, description]
 *             properties:
 *               medication1Id:
 *                 type: integer
 *               medication2Id:
 *                 type: integer
 *               severity:
 *                 type: string
 *                 enum: [LOW, MODERATE, HIGH]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interaction created successfully
 *       400:
 *         description: Invalid input or duplicate interaction
 */
router.get('/interactions', verifyToken, pharmacyAccess, pharmacyController.getInteractions);
router.post('/interactions', verifyToken, pharmacyAccess, pharmacyController.createInteraction);

/**
 * @swagger
 * /api/pharmacy/interactions/{interactionId}:
 *   put:
 *     summary: Update a drug interaction
 *     description: Updates an existing drug interaction
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: interactionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medication1Id, medication2Id, severity, description]
 *             properties:
 *               medication1Id:
 *                 type: integer
 *               medication2Id:
 *                 type: integer
 *               severity:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interaction updated successfully
 *       404:
 *         description: Interaction not found
 *   delete:
 *     summary: Delete a drug interaction
 *     description: Removes a drug interaction record
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: interactionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Interaction deleted successfully
 *       404:
 *         description: Interaction not found
 */
router.put('/interactions/:interactionId', verifyToken, pharmacyAccess, pharmacyController.updateInteraction);
router.delete('/interactions/:interactionId', verifyToken, pharmacyAccess, pharmacyController.deleteInteraction);

module.exports = router;
