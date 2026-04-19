export interface LicenseWithUser {
  id: string;
  userId: string;
  licenseKey: string;
  expiryDate: string | null;
  status: string;
  renewal_due_date?: string | null;

  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}
