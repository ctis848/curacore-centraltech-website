export interface LicenseWithUser {
  id: string;
  renewal_due_date: string | null;
  service_fee_paid: boolean;
  user_id: string;
  user: {
    email: string;
  };
}
