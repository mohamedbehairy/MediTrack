const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the AI medical assistant
 *     description: Role-aware AI assistant for medical queries. Different system prompts for doctors, pharmacists, and patients.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message or question
 *     responses:
 *       200:
 *         description: AI response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The AI assistant's response
 *                 role:
 *                   type: string
 *                   description: The user's role (DOCTOR, PHARMACIST, PATIENT, ADMIN)
 *       400:
 *         description: Invalid request (empty message)
 *       500:
 *         description: Server error or AI service unavailable
 */
router.post('/', verifyToken, chatController.sendMessage);

module.exports = router;
