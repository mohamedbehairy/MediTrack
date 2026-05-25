const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Schedule a new appointment
 *     description: Creates a SCHEDULED appointment between a patient and a doctor. Both IDs are resolved from user IDs automatically.
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 appointment: { $ref: '#/components/schemas/Appointment' }
 *       404:
 *         description: Patient profile not found for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verifyToken, appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get all appointments for a specific doctor
 *     description: Returns all appointments (any status) for the given doctor user ID, ordered by date ascending.
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The doctor's **user** ID
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/doctor/:doctorId', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), appointmentController.getDoctorAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     summary: Update an appointment's status
 *     description: Transitions the appointment to COMPLETED or CANCELLED.
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 appointment: { $ref: '#/components/schemas/Appointment' }
 */
router.put('/:id/status', verifyToken, appointmentController.updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/{id}/notes:
 *   put:
 *     summary: Update appointment notes
 *     description: Saves or replaces the free-text notes for an appointment (inline edit from the doctor's schedule view).
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotesRequest'
 *     responses:
 *       200:
 *         description: Notes updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 appointment: { $ref: '#/components/schemas/Appointment' }
 */
router.put('/:id/notes', verifyToken, authorizeRoles('DOCTOR', 'ADMIN'), appointmentController.updateAppointmentNotes);

module.exports = router;
