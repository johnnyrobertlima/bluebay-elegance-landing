
/**
 * Calculates date difference in days between two date strings
 */
export const calculateDateDiffInDays = (startDate: string, endDate: string): number => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  return Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
};
