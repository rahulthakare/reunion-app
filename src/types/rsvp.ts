export interface RSVP {
  id?: string;
  name: string;
  phone: string;
  city: string;
  withFamily: boolean;
  familyCount: number;
  message: string;
  createdAt?: string; // ISO timestamp
}
