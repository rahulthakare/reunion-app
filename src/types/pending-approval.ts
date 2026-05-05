export interface PendingApproval {
  uid: string;            // Firebase Auth UID (also doc ID)
  email: string;
  firstName?: string;
  lastName?: string;
  provider: string;       // "password" or "google.com"
  requestedAt: string;    // ISO timestamp
  notes?: string;
}
