export interface Event {
  id: string;
  trainer: number;
  customer: number;
  selectDate: Date;
  startDate: Date;
  endDate: Date;
  bookingType: BookingType;
  trainerRatePerHour:number;

}

export interface Sessions {
  sessionDate: string
  sessionStartTime: string
  sessionEndTime: string
  trainerRatePerHour: number
  sessionCharge:number
  discount: number
  netTotalAmount: number
  notes: string
}

export type EventPriority = 'low' | 'medium' | 'high';

export type ViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';


export type BookingType = 'one_time' | 'weekly'


interface Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface WeekSlot {
  date: string; // date in the format "YYYY-MM-DD"
  slots: Slot[];
}

interface DateSlot {
  weekday: number;
  weekSlots: WeekSlot[];
}




interface DaySchedule {
  weekday: number;     // Weekday number (0-6, where 0 = Sunday, 6 = Saturday)
  weekSlots: WeekSlot[]; // List of week slots for that day
}

interface ScheduleResponse {
  success: boolean;    // Indicates if the operation was successful
  message: string;     // Response message
  data: DaySchedule[]; // List of schedules by weekday
  errors: object;      // Errors if any (can be further typed if needed)
}
