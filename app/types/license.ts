export interface License {
  id: string;
  user_id: string;
  plan: string;
  is_active: boolean;
  auto_revoked: boolean;
  service_fee_paid: boolean;
  renewal_due_date: string | null;
  last_payment_date: string | null;
  last_renewed_at: string | null;
  expires_at: string | null;
  machine_limit: number;
  created_at: string;
  updated_at: string;

  // NEW FIELD
  auto_renew: boolean; 
}
