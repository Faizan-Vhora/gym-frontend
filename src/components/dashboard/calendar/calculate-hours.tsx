import { AvailableSlots, Slot } from './types';

const calculateTotalHours = (availableSlots: AvailableSlots): number => {
  let totalMinutes = 0;

  // Iterate through each date slot
  availableSlots.data.forEach((dateSlot) => {
    const { slots } = dateSlot;

    // Iterate through each slot for the current date
    slots.forEach((slot: Slot) => {
      const { startTime, endTime } = slot;

      // Parse time strings into Date objects
      const start = new Date(`1970-01-01T${startTime}Z`);
      const end = new Date(`1970-01-01T${endTime}Z`);

      // Calculate the difference in minutes
      const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      totalMinutes += durationInMinutes;
    });
  });

  // Convert total minutes to hours
  const totalHours = totalMinutes / 60;
  return totalHours;
};

export default calculateTotalHours;
