const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients with prescriptions and adherence data
 *     description: Returns the full patient list enriched with an overall adherence percentage. Supports optional name/email search via `?q=`.
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term (name or email)
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PatientProfile'
 *                   - type: object
 *                     properties:
 *                       overallAdherence:
 *                         type: integer
 *                         nullable: true
 *                         description: Aggregate adherence percentage (null if no data)
 */
router.get('/', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), patientController.getAllPatients);

/**
 * @swagger
 * /api/patients/mark-dose:
 *   post:
 *     summary: Mark a medication dose as taken
 *     description: Logs a TAKEN adherence entry and automatically decrements pharmacy inventory by 1 unit.
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkDoseRequest'
 *     responses:
 *       200:
 *         description: Dose logged and inventory updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 log:     { $ref: '#/components/schemas/AdherenceLog' }
 *       404:
 *         description: Medication not found in prescription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/mark-dose', verifyToken, authorizeRoles('PATIENT', 'ADMIN'), patientController.markDoseTaken);

/**
 * @swagger
 * /api/patients/profile:
 *   put:
 *     summary: Update the authenticated patient's profile
 *     description: Updates name, blood type, date of birth, medical history and optionally resets the password.
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 patient: { $ref: '#/components/schemas/PatientProfile' }
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', verifyToken, authorizeRoles('PATIENT', 'ADMIN'), patientController.updateProfile);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get a complete patient profile by user ID
 *     description: Returns the full patient record including prescriptions with per-medication adherence metrics, appointments and adherence logs.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The patient's **user** ID (not the Patient table primary key)
 *     responses:
 *       200:
 *         description: Full patient profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientProfile'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', verifyToken, patientController.getPatientProfile);

module.exports = router;
