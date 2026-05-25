const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/doctors/stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     description: Returns aggregate counts of doctors, patients, appointments and prescriptions. Used by the Admin/Hospital dashboard.
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlatformStats'
 */
router.get('/stats', verifyToken, authorizeRoles('ADMIN', 'DOCTOR'), doctorController.getPlatformStats);

/**
 * @swagger
 * /api/doctors/patients/search:
 *   get:
 *     summary: Search patients by name
 *     description: Lightweight search used by the doctor's global patient history lookup. Pass `?query=<name>`.
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: First or last name fragment to search
 *     responses:
 *       200:
 *         description: Matching patient list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PatientProfile'
 */
router.get('/patients/search', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), doctorController.searchPatients);

/**
 * @swagger
 * /api/doctors/upload-credentials:
 *   post:
 *     summary: Upload professional portrait and/or medical license
 *     description: Accepts `multipart/form-data` with fields `profileImage` (image) and/or `licenseImage` (image or PDF). Files are stored under `/uploads/`.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: JPEG/PNG portrait photo
 *               licenseImage:
 *                 type: string
 *                 format: binary
 *                 description: Medical license image or PDF
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     profileImage: { type: string }
 *                     licenseImage: { type: string }
 *       400:
 *         description: No files provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/upload-credentials',
  verifyToken,
  authorizeRoles('DOCTOR'),
  upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'licenseImage', maxCount: 1 }]),
  doctorController.uploadCredentials,
);

/**
 * @swagger
 * /api/doctors/profile:
 *   put:
 *     summary: Update the authenticated doctor's profile
 *     description: Updates name, specialization, clinic address and optionally resets the password.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDoctorProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 doctor:
 *                   $ref: '#/components/schemas/DoctorDashboard'
 *       404:
 *         description: Doctor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', verifyToken, authorizeRoles('DOCTOR'), doctorController.updateProfile);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Returns every registered doctor with their user details, specialization and clinic address. Used by the patient booking flow.
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DoctorDashboard'
 */
router.get('/', verifyToken, doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}/dashboard:
 *   get:
 *     summary: Get a doctor's full dashboard data
 *     description: Returns the doctor's profile, all appointments (with patient details), all prescriptions, and automatically computed LOW_ADHERENCE alerts for patients below 50%.
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The doctor's **user** ID
 *     responses:
 *       200:
 *         description: Doctor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorDashboard'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/dashboard', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), doctorController.getDashboard);

module.exports = router;
