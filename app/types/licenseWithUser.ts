export interface LicenseWithUser {
  id: string;
  renewal_due_date: string | null;
  service_name: string;
  user: {
    email: string | null;
  } | null;
}
