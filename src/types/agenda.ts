export interface AgendaItem {
  id: string;
  time: string;       // e.g. "09:00 AM"
  title: string;      // e.g. "Welcome & Registration"
  description: string; // optional details
  order: number;      // for sorting
}

export interface Agenda {
  items: AgendaItem[];
  updatedAt?: string;
}
