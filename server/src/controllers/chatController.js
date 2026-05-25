const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set — AI chat features will be unavailable.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const prisma = new PrismaClient();

const getSystemPrompt = (role, patientContext = '') => {
  const prompts = {
    DOCTOR: `You are a medical knowledge assistant for healthcare professionals. Provide clinical decision support, evidence-based information about diseases, drug interactions, treatment options, and medical procedures. Be precise and include relevant clinical considerations. Your responses should help doctors make informed decisions about patient care.`,

    PHARMACIST: `You are a pharmaceutical expert assistant for pharmacists. Provide information about drug interactions, contraindications, dispensing guidelines, medication mechanisms, side effects, and pharmacy operations. Help ensure medication safety and proper dispensing practices. Your responses should be practical and compliance-focused.`,

    PATIENT: `You are a compassionate healthcare information assistant for patients. Provide patient-friendly explanations about medications, health conditions, appointment management, and wellness tips. Be supportive and encouraging about medication adherence. Avoid complex medical jargon and encourage users to follow their doctor's advice. You can help with medication reminders and health education.${patientContext}`,

    ADMIN: `You are a healthcare system administrator assistant. Provide information about hospital operations, user management, system features, and administrative guidelines. Help with questions about MediTrack features and best practices.`
  };

  return prompts[role] || prompts.PATIENT;
};

const getPatientMedicationContext = async (userId) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        prescriptions: {
          include: {
            medications: {
              include: {
                medication: {
                  select: { name: true, description: true }
                }
              }
            }
          }
        }
      }
    });

    if (!patient || patient.prescriptions.length === 0) {
      return '';
    }

    let context = '\n\n=== PATIENT MEDICATION INFORMATION ===\nThe patient has the following active prescriptions:\n\n';

    patient.prescriptions.forEach((prescription, idx) => {
      context += `Prescription ${idx + 1} (Diagnosis: ${prescription.diagnosis}):\n`;
      prescription.medications.forEach(med => {
        const today = new Date();
        const endDate = new Date(prescription.dateIssued);
        endDate.setDate(endDate.getDate() + med.durationDays);

        const isActive = endDate >= today;
        context += `- ${med.medication.name}: ${med.dosage}, ${med.frequency}${isActive ? ' (Active)' : ' (Expired)'}\n`;
      });
      context += '\n';
    });

    context += 'When patients ask about their medications, appointments, or daily medicine schedule, use this information to provide personalized responses. Help them understand their medication schedule and encourage adherence.';

    return context;
  } catch (error) {
    console.error('Error fetching patient medication context:', error);
    return '';
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Fetch patient medication context if user is a patient
    let patientContext = '';
    if (userRole === 'PATIENT') {
      patientContext = await getPatientMedicationContext(userId);
    }

    if (!genAI) {
      return res.status(503).json({ message: 'AI chat is not configured. Set GEMINI_API_KEY in server/.env' });
    }

    const systemPrompt = getSystemPrompt(userRole, patientContext);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;
    const result = await model.generateContent(fullPrompt);

    const reply = result.response.text();

    res.json({
      message: reply,
      role: userRole
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ message: 'AI service configuration error' });
    }

    res.status(500).json({ message: 'Error processing your message. Please try again.' });
  }
};
