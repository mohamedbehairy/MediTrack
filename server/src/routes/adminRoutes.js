const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const adminOnly = authorizeRoles('ADMIN');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all platform users
 *     description: Returns every user across all roles. Filter by role with `?role=DOCTOR|PATIENT|PHARMACIST|ADMIN`.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [DOCTOR, PATIENT, PHARMACIST, ADMIN]
 *         description: Filter by role
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: User list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   email:     { type: string }
 *                   firstName: { type: string }
 *                   lastName:  { type: string }
 *                   role:      { type: string }
 *                   createdAt: { type: string, format: date-time }
 */
router.get('/users', verifyToken, adminOnly, adminController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user and all related records
 *     description: Permanently removes a user and cascades to their Patient/Doctor/Appointment/Prescription data.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', verifyToken, adminOnly, adminController.deleteUser);

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     summary: Get full platform overview stats
 *     description: Returns aggregate counts plus recent activity for every module.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Overview data
 */
router.get('/overview', verifyToken, adminOnly, adminController.getOverview);

/**
 * @swagger
 * /api/admin/appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Returns all appointments with patient and doctor details
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Appointments list
 */
router.get('/appointments', verifyToken, adminOnly, adminController.getAllAppointments);

/**
 * @swagger
 * /api/admin/patients:
 *   get:
 *     summary: Get all patients
 *     description: Returns all patients with their information
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Patients list
 */
router.get('/patients', verifyToken, adminOnly, adminController.getAllPatients);

/**
 * @swagger
 * /api/admin/users/{id}/lock:
 *   patch:
 *     summary: Lock a user account
 *     description: Prevents a user from logging in by locking their account
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User locked successfully
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/lock', verifyToken, adminOnly, adminController.lockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unlock:
 *   patch:
 *     summary: Unlock a user account
 *     description: Restores access to a locked user account
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User unlocked successfully
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/unlock', verifyToken, adminOnly, adminController.unlockUser);

module.exports = router;
