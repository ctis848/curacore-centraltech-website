export interface CompanyInfo {
  name: string;
  email: string;
}

export interface LicenseRecord {
  id: string;
  user_id: string;
  auto_renew: boolean;
  renewal_due_date: string;
  service_fee_paid: boolean;
  active: boolean;
  annual_price: number;
  portal_password: string | null;
  company: CompanyInfo | null;
}
