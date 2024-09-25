export interface Event {
  id: string;
  trainer: string;
  customer: string;
  start: Date;
  end: Date;
  allDay: boolean;
  priority?: EventPriority;
}

export type EventPriority = 'low' | 'medium' | 'high';

export type ViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
