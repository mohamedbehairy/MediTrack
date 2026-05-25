/**
 * Adherence Calculation Engine
 * Parses frequency commands and logs to determine medication compliance rates.
 */

// Simple NLP-like parser for the medical frequency strings
function parseFrequencyToDailyDoses(frequencyStr) {
  const str = frequencyStr.toLowerCase();
  if (str.includes('twice') || str.includes('2')) return 2;
  if (str.includes('three') || str.includes('3')) return 3;
  if (str.includes('four') || str.includes('4')) return 4;
  if (str.includes('weekly')) return 1/7; 
  // defaults to daily
  return 1;
}


exports.calculateAdherence = (prescriptionMedication) => {
  const now = new Date();
  const issuedDate = new Date(prescriptionMedication.prescription.dateIssued);
  
  // Calculate days elapsed (minimum 1 day to avoid dividing by 0 or penalizing instant prescriptions)
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(1, Math.floor((now - issuedDate) / msPerDay));
  
  const dailyDoses = parseFrequencyToDailyDoses(prescriptionMedication.frequency);
  const expectedDoses = Math.floor(daysElapsed * dailyDoses);
  
  const actualDoses = prescriptionMedication.adherenceLogs.length;

  // Let's cap percentage at 100% in case they take extra (we shouldn't offset misses)
  const percentage = expectedDoses === 0 ? 100 : Math.min(100, Math.round((actualDoses / expectedDoses) * 100));
  
  return {
    expected: expectedDoses,
    actual: actualDoses,
    percentage: percentage,
    isCritical: percentage < 50 && expectedDoses > 1 // Only alarm if we expected at least 2 doses and they missed > 50%
  };
};
