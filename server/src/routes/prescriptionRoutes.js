const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Issue a new prescription
 *     description: |
 *       Creates a prescription with one or more medications. Before saving, the **Safety Engine** checks for
 *       drug interactions between the new medications and the patient's entire active prescription history.
 *       - If a HIGH-severity interaction is detected the request returns **409 Conflict** with full interaction details.
 *       - Pass `skipWarning: true` to override and force-create the prescription.
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePrescriptionRequest'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:      { type: string }
 *                 prescription: { $ref: '#/components/schemas/Prescription' }
 *       409:
 *         description: Drug interaction detected — prescription blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InteractionConflict'
 *       404:
 *         description: Doctor or patient profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), prescriptionController.createPrescription);

/**
 * @swagger
 * /api/prescriptions/medications:
 *   get:
 *     summary: Get the full medication catalog
 *     description: Returns every medication in the system along with its current inventory stock level. Used to populate the prescription form dropdown.
 *     tags: [Prescriptions]
 *     responses:
 *       200:
 *         description: Medication catalog with inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 */
router.get('/medications', verifyToken, prescriptionController.getAllMedications);

module.exports = router;
