export interface Event {
  id: string;
  trainer: number;
  customer: number;
  selectDate: Date;
  startDate: Date;
  endDate: Date;
  trainerRatePerHour:number;
  bookingType: string | undefined;

}

export interface Sessions {
  sessionDate: string
  sessionStartTime: string | undefined
  sessionEndTime: string |undefined
  sessionDurationInHours?: number,
  trainerRatePerHour: number
  sessionCharge:number
  discount: number
  netTotalAmount: number
  notes?: string
}

export type EventPriority = 'low' | 'medium' | 'high';

export type ViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';


export type BookingType = 'one_time' | 'weekly'


export interface Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface WeekSlot {
  date: string; // date in the format "YYYY-MM-DD"
  slots: Slot[];
}

export interface DateSlot {
  isOption?:boolean;
  weekday: number;
  weekSlots: WeekSlot[];
}




export interface DaySchedule {
  weekday: number;     // Weekday number (0-6, where 0 = Sunday, 6 = Saturday)
  weekSlots: WeekSlot[]; // List of week slots for that day
}

export interface ScheduleResponse {
  success: boolean;    // Indicates if the operation was successful
  message: string;     // Response message
  data: DaySchedule[]; // List of schedules by weekday
  errors: object;      // Errors if any (can be further typed if needed)
}


export interface SessionItem {
  id: number;
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  trainerRatePerHour: number;
  bookingType? : string | undefined;

  trainer: {
      id: number;
      fullName: string;
  };
  customer: {
      id: number;
      fullName: string;
  };
}



export interface Customer {
  id: number;
  memberId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  zipCode: string;
  gender: string;
  dialCode: string | null;
  status: number;
  userType: number;
  otp: string | null;
  isMobileVerified: boolean;
  isProfileCompleted: boolean;
  dateOfBirth: string;
  deviceId: string | null;
  deviceType: string | null;
  experience: number | null;
  aboutMe: string | null;
  fees: string | null;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
  qrCodeImageUrl: string | null;
}

export interface Trainer {
  id: number;
  memberId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  zipCode: string | null;
  gender: string;
  dialCode: string | null;
  status: number;
  userType: number;
  otp: string | null;
  isMobileVerified: boolean;
  isProfileCompleted: boolean;
  dateOfBirth: string;
  deviceId: string;
  deviceType: string;
  experience: number;
  aboutMe: string;
  fees: string;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
  qrCodeImageUrl: string | null;
}

export interface Booking {
  id: number;
  bookingType: string;
  startDate: string;
  endDate: string;
  trainerRatePerHour: number;
  bookingHours: number;
  bookingAmount: number;
  paymentType: string;
  weekdays: string;
  Isrecurrence: boolean;
  recurrenceWeeks: number;
  promocode: string | null;
  totalAmount: number;
  discount: number;
  netTotalAmount: number;
  paymentStatus: string;
  paymentReferenceNo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: number;
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  trainerRatePerHour: number;
  sessionCharge: number;
  discount: number;
  netTotalAmount: number;
  paymentStatus: string;
  paymentReferenceNo: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  trainer: Trainer;
  booking: Booking;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Session[];
  errors: Record<string, unknown>;
}


export interface BookingPreviewDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  bookingDetails: BookingDetailsI | null;
}

export interface SlotI {
  date?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  isDateLabel?: boolean;
  discount?: boolean;
}


export type SelectedSlotsI = Record<string, SlotI[]>;

export enum DiscountType {
  Percentage = 'percentage',
  Fix = 'fixed',
}

export enum UsageLimit {
  Once = 'once',
  Twice = 'twice',
  NoLimit = 'no_limit',
}

export enum DiscountStatus {
  Active = 'active',
  Inactive = 'inactive',
  Expired = 'expired',
}

export interface DiscountEntryI {
  id: number;
  codeName: string;
  expiryDate: string; // Updated from Date to string for API data handling
  discountType: DiscountType;
  usageLimit: UsageLimit;
  discountValue: number;
  description: string;
  status: DiscountStatus;
  isNewUser: boolean;
  discountImageUrl?: string;
  discountImage?: string;
}


export interface BookingDetailsI {
  bookingType?: string;
  selectedTrainer?: Trainer | null;
  selectedCustomer?: Customer | null;
  bookingDate?: string;
  bookingStartDate?: string;
  bookingEndDate?: string;
  selectedDays?: number[];
  selectedSlots?: SelectedSlotsI;
  paymentType?: string;
  bookingAmount?: number;
  selectedPromocode: DiscountEntryI | null;
  bookingHours?: number;
  trainerRatePerHour?: number;
  discountAmount?: number;
  netTotalAmount?: number;
}
