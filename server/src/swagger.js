const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediTrack API',
      version: '1.0.0',
      description:
        'Healthcare management platform — connects patients, doctors, pharmacies and hospitals. ' +
        'Authenticate via **POST /api/auth/login**, copy the returned token, then click **Authorize** and enter `Bearer <token>`.',
      contact: { name: 'MediTrack Team' },
    },
    servers: [{ url: 'http://localhost:5002', description: 'Local development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        /* ── Auth ───────────────────────────────────────────────────────── */
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'house@meditrack.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email:     { type: 'string', example: 'newdoc@clinic.com' },
            password:  { type: 'string', example: 'secret123' },
            firstName: { type: 'string', example: 'Jane' },
            lastName:  { type: 'string', example: 'Doe' },
            role:      { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token:   { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:        { type: 'integer' },
                email:     { type: 'string' },
                role:      { type: 'string' },
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
              },
            },
          },
        },

        /* ── Patient ─────────────────────────────────────────────────────── */
        PatientProfile: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            userId:         { type: 'integer' },
            bloodType:      { type: 'string', nullable: true },
            medicalHistory: { type: 'string', nullable: true },
            user: {
              type: 'object',
              properties: {
                email:     { type: 'string' },
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
              },
            },
            prescriptions:  { type: 'array', items: { $ref: '#/components/schemas/Prescription' } },
            appointments:   { type: 'array', items: { $ref: '#/components/schemas/Appointment' } },
            adherenceLogs:  { type: 'array', items: { $ref: '#/components/schemas/AdherenceLog' } },
          },
        },
        MarkDoseRequest: {
          type: 'object',
          required: ['prescriptionMedicationId'],
          properties: {
            prescriptionMedicationId: { type: 'integer', example: 1 },
          },
        },
        UpdatePatientProfileRequest: {
          type: 'object',
          properties: {
            firstName:      { type: 'string' },
            lastName:       { type: 'string' },
            bloodType:      { type: 'string', enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
            dateOfBirth:    { type: 'string', format: 'date' },
            medicalHistory: { type: 'string' },
            password:       { type: 'string', description: 'Leave blank to keep current password' },
          },
        },

        /* ── Doctor ──────────────────────────────────────────────────────── */
        DoctorDashboard: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            specialization: { type: 'string' },
            clinicAddress:  { type: 'string', nullable: true },
            profileImage:   { type: 'string', nullable: true },
            licenseImage:   { type: 'string', nullable: true },
            user:           { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' } } },
            appointments:   { type: 'array', items: { $ref: '#/components/schemas/Appointment' } },
            alerts:         { type: 'array', items: { $ref: '#/components/schemas/Alert' } },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            type:                { type: 'string', enum: ['LOW_ADHERENCE'] },
            patientName:         { type: 'string' },
            patientId:           { type: 'integer' },
            medicationName:      { type: 'string' },
            adherencePercentage: { type: 'integer' },
            message:             { type: 'string' },
          },
        },
        PlatformStats: {
          type: 'object',
          properties: {
            doctorCount:      { type: 'integer' },
            patientCount:     { type: 'integer' },
            appointmentCount: { type: 'integer' },
            prescriptionCount:{ type: 'integer' },
            activeUsers:      { type: 'integer' },
          },
        },
        UpdateDoctorProfileRequest: {
          type: 'object',
          properties: {
            firstName:      { type: 'string' },
            lastName:       { type: 'string' },
            specialization: { type: 'string' },
            clinicAddress:  { type: 'string' },
            password:       { type: 'string', description: 'Leave blank to keep current password' },
          },
        },

        /* ── Appointment ─────────────────────────────────────────────────── */
        Appointment: {
          type: 'object',
          properties: {
            id:        { type: 'integer' },
            patientId: { type: 'integer' },
            doctorId:  { type: 'integer' },
            date:      { type: 'string', format: 'date-time' },
            status:    { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
            notes:     { type: 'string', nullable: true },
          },
        },
        CreateAppointmentRequest: {
          type: 'object',
          required: ['patientId', 'doctorId', 'date'],
          properties: {
            patientId: { type: 'integer', description: 'User ID of the patient', example: 3 },
            doctorId:  { type: 'integer', description: 'User ID of the doctor', example: 2 },
            date:      { type: 'string', format: 'date-time', example: '2025-06-15T10:00:00' },
            notes:     { type: 'string', example: 'Routine follow-up' },
          },
        },
        UpdateStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
          },
        },
        UpdateNotesRequest: {
          type: 'object',
          required: ['notes'],
          properties: {
            notes: { type: 'string', example: 'Patient presented with chest pain.' },
          },
        },

        /* ── Prescription ────────────────────────────────────────────────── */
        Prescription: {
          type: 'object',
          properties: {
            id:          { type: 'integer' },
            patientId:   { type: 'integer' },
            doctorId:    { type: 'integer' },
            diagnosis:   { type: 'string' },
            dateIssued:  { type: 'string', format: 'date-time' },
            medications: { type: 'array', items: { $ref: '#/components/schemas/PrescriptionMedication' } },
          },
        },
        PrescriptionMedication: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            medicationId:   { type: 'integer' },
            dosage:         { type: 'string' },
            frequency:      { type: 'string' },
            durationDays:   { type: 'integer' },
            medication:     { $ref: '#/components/schemas/Medication' },
          },
        },
        CreatePrescriptionRequest: {
          type: 'object',
          required: ['patientId', 'doctorId', 'diagnosis', 'medications'],
          properties: {
            patientId:   { type: 'integer', description: 'User ID of the patient', example: 3 },
            doctorId:    { type: 'integer', description: 'User ID of the doctor', example: 2 },
            diagnosis:   { type: 'string', example: 'Hypertension Management' },
            skipWarning: { type: 'boolean', default: false, description: 'Skip drug interaction check' },
            medications: {
              type: 'array',
              items: {
                type: 'object',
                required: ['medicationId', 'dosage', 'frequency', 'durationDays'],
                properties: {
                  medicationId: { type: 'integer', example: 1 },
                  dosage:       { type: 'string', example: '10mg' },
                  frequency:    { type: 'string', example: '1x daily' },
                  durationDays: { type: 'integer', example: 30 },
                },
              },
            },
          },
        },
        InteractionConflict: {
          type: 'object',
          properties: {
            interactionDetected: { type: 'boolean', example: true },
            interactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity:    { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        Medication: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            name:             { type: 'string' },
            activeIngredient: { type: 'string' },
            description:      { type: 'string', nullable: true },
            inventory:        { $ref: '#/components/schemas/Inventory' },
          },
        },

        /* ── Pharmacy ────────────────────────────────────────────────────── */
        Inventory: {
          type: 'object',
          properties: {
            id:           { type: 'integer' },
            medicationId: { type: 'integer' },
            stockLevel:   { type: 'integer' },
            lastRestock:  { type: 'string', format: 'date-time' },
          },
        },
        RestockRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'integer', minimum: 1, example: 100 },
          },
        },
        PharmacyStats: {
          type: 'object',
          properties: {
            totalMeds:          { type: 'integer' },
            totalStock:         { type: 'integer' },
            lowStockItems:      { type: 'integer' },
            outOfStock:         { type: 'integer' },
            totalPrescriptions: { type: 'integer' },
            totalPatients:      { type: 'integer' },
          },
        },

        /* ── Shared ──────────────────────────────────────────────────────── */
        AdherenceLog: {
          type: 'object',
          properties: {
            id:                       { type: 'integer' },
            patientId:                { type: 'integer' },
            prescriptionMedicationId: { type: 'integer' },
            dateTaken:                { type: 'string', format: 'date-time' },
            status:                   { type: 'string', enum: ['TAKEN', 'MISSED'] },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',          description: 'Authentication — login and registration' },
      { name: 'Patients',      description: 'Patient profiles, prescriptions, adherence logs' },
      { name: 'Doctors',       description: 'Doctor dashboards, profiles, credentials, patient search' },
      { name: 'Appointments',  description: 'Scheduling, status updates and notes' },
      { name: 'Prescriptions', description: 'Issue prescriptions with safety engine checks, medication catalog' },
      { name: 'Pharmacy',      description: 'Inventory management, prescription pipeline, patient dispensing view' },
    ],
  },
  apis: [path.join(__dirname, './routes/*.js')],
};

module.exports = swaggerJsdoc(options);
