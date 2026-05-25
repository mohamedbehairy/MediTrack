const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.checkInteractions = async (patientId, newMedicationIds) => {
  // 1. Get patient's current active medications
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      prescriptions: {
         include: {
           medications: {
             include: { medication: true }
           }
         }
      }
    }
  });

  if (!patient) throw new Error('Patient not found');

  const currentMedications = [];
  patient.prescriptions.forEach(p => {
    p.medications.forEach(pm => {
      // Simplification: Assume all historical meds are "current" for the demo
      // In production, we'd check if the prescription is still active based on durationDays
      currentMedications.push(pm.medication);
    });
  });

  const conflicts = [];
  
  // 2. Fetch all new medications
  const newMeds = await prisma.medication.findMany({
    where: { id: { in: newMedicationIds } }
  });

  // 3. Combine current meds and new meds for full spectrum check, and deduplicate
  const allMedsToCheck = [...currentMedications];
  
  for (const newMed of newMeds) {
    for (const curMed of allMedsToCheck) {
      if (newMed.id === curMed.id) continue; // Skip identical references

      // Prevent duplicate active ingredient
      if (newMed.activeIngredient === curMed.activeIngredient) {
        conflicts.push({
          newMed: newMed.name,
          currentMed: curMed.name,
          interactionType: "duplicate_ingredient",
          severity: "high",
          explanation: `Both medications contain the active ingredient ${newMed.activeIngredient}.`,
          monitoring: "Avoid prescribing duplicate active ingredients to prevent accidental overdose."
        });
        continue;
      }

      // Check DrugInteractions table
      const interaction = await prisma.drugInteraction.findFirst({
        where: {
          OR: [
            { medication1Id: newMed.id, medication2Id: curMed.id },
            { medication1Id: curMed.id, medication2Id: newMed.id }
          ]
        }
      });

      if (interaction) {
        conflicts.push({
          newMed: newMed.name,
          currentMed: curMed.name,
          interactionType: "synergistic", // Mocking out based on previous requirement
          severity: interaction.severity.toLowerCase(),
          explanation: interaction.description,
          monitoring: "Close clinical monitoring required. Adjust dosages if concurrent use is strictly necessary."
        });
      }
    }
    // Add newMed to check pool so subsequent newMeds check against it
    allMedsToCheck.push(newMed);
  }

  return {
    interactionDetected: conflicts.length > 0,
    conflicts
  };
};
