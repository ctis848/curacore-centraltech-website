create table public."Account" (
  id text not null,
  "userId" text not null,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text null,
  access_token text null,
  expires_at integer null,
  token_type text null,
  scope text null,
  id_token text null,
  session_state text null,
  constraint Account_pkey primary key (id),
  constraint Account_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists "Account_provider_providerAccountId_key" on public."Account" using btree (provider, "providerAccountId") TABLESPACE pg_default;

create table public."AnnualPaymentHistory" (
  id uuid not null default gen_random_uuid (),
  userid uuid not null,
  amount integer not null,
  reference text not null,
  status text not null,
  paidat timestamp with time zone not null,
  licensecount integer not null,
  created_at timestamp with time zone null default now(),
  constraint AnnualPaymentHistory_pkey primary key (id)
) TABLESPACE pg_default;

create table public."ApiLog" (
  id text not null,
  endpoint text not null,
  "statusCode" integer not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint ApiLog_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists "ApiLog_createdAt_idx" on public."ApiLog" using btree ("createdAt") TABLESPACE pg_default;

create index IF not exists "ApiLog_endpoint_idx" on public."ApiLog" using btree (endpoint) TABLESPACE pg_default;

create table public."AuditLog" (
  id text not null,
  "adminId" text not null,
  action text not null,
  "targetId" text null,
  details text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  metadata jsonb null,
  constraint AuditLog_pkey primary key (id),
  constraint AuditLog_adminId_fkey foreign KEY ("adminId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create table public."ContactMessage" (
  id text not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint ContactMessage_pkey primary key (id)
) TABLESPACE pg_default;

create table public."EmailTemplate" (
  id text not null,
  name text not null,
  subject text not null,
  body text not null,
  "updatedAt" timestamp without time zone not null,
  constraint EmailTemplate_pkey primary key (id)
) TABLESPACE pg_default;

create unique INDEX IF not exists "EmailTemplate_name_key" on public."EmailTemplate" using btree (name) TABLESPACE pg_default;

create table public."EmailVerificationToken" (
  token text not null,
  "userId" text not null,
  "expiresAt" timestamp without time zone not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint EmailVerificationToken_pkey primary key (token),
  constraint EmailVerificationToken_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create table public."ExportHistory" (
  id text not null,
  "userId" text null,
  "fileName" text null,
  dataset text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint ExportHistory_pkey primary key (id),
  constraint ExportHistory_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create table public."Invoice" (
  id text not null,
  "userId" text not null,
  "licenseId" text null,
  amount double precision not null,
  currency text not null default 'USD'::text,
  status public.InvoiceStatus not null default 'PENDING'::"InvoiceStatus",
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "paidAt" timestamp without time zone null,
  description text null,
  constraint Invoice_pkey primary key (id),
  constraint Invoice_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete set null,
  constraint Invoice_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "Invoice_userId_idx" on public."Invoice" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "Invoice_licenseId_idx" on public."Invoice" using btree ("licenseId") TABLESPACE pg_default;

create index IF not exists "Invoice_userId_idx1" on public."Invoice" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "Invoice_licenseId_idx1" on public."Invoice" using btree ("licenseId") TABLESPACE pg_default;

create index IF not exists idx_invoice_user on public."Invoice" using btree ("userId") TABLESPACE pg_default;

create index IF not exists idx_invoice_license on public."Invoice" using btree ("licenseId") TABLESPACE pg_default;

create table public."License" (
  id text not null,
  "userId" text not null,
  "licenseRequestId" text null,
  "productName" text null,
  "licenseKey" text null,
  "purchasedAt" timestamp without time zone null,
  "activatedAt" timestamp without time zone null,
  "activationCount" integer not null default 0,
  "maxActivations" integer null,
  "expiresAt" timestamp without time zone null,
  "annualFeePercent" integer not null default 20,
  "annualFeePaidUntil" timestamp without time zone null,
  status public.LicenseStatus not null default 'PENDING'::"LicenseStatus",
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone not null,
  "userEmail" text null,
  renewalstatus text null default 'NOT_DUE'::text,
  renewalduedate timestamp with time zone null,
  annualfeepercent integer null default 20,
  annualfeepaiduntil timestamp with time zone null,
  base_annual_fee numeric null,
  additional_annual_fee numeric null,
  final_annual_fee numeric null,
  constraint License_pkey primary key (id),
  constraint License_licenseRequestId_fkey foreign KEY ("licenseRequestId") references "LicenseRequest" (id) on update CASCADE on delete RESTRICT,
  constraint license_licenserequest_fkey foreign KEY ("licenseRequestId") references "LicenseRequest" (id) on delete set null,
  constraint license_userid_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create unique INDEX IF not exists "License_licenseRequestId_key" on public."License" using btree ("licenseRequestId") TABLESPACE pg_default;

create unique INDEX IF not exists "License_licenseKey_key" on public."License" using btree ("licenseKey") TABLESPACE pg_default;

create index IF not exists "License_status_idx" on public."License" using btree (status) TABLESPACE pg_default;

create index IF not exists "License_userId_idx" on public."License" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "License_userId_idx1" on public."License" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "License_status_idx1" on public."License" using btree (status) TABLESPACE pg_default;

create index IF not exists "License_expiresAt_idx" on public."License" using btree ("expiresAt") TABLESPACE pg_default;

create index IF not exists idx_license_user on public."License" using btree ("userId") TABLESPACE pg_default;

create index IF not exists idx_license_status on public."License" using btree (status) TABLESPACE pg_default;

create index IF not exists idx_license_expires on public."License" using btree ("expiresAt") TABLESPACE pg_default;

create trigger trg_prevent_wrong_userid BEFORE INSERT
or
update on "License" for EACH row
execute FUNCTION prevent_wrong_userid ();

create trigger trg_sync_license_from_request BEFORE INSERT
or
update on "License" for EACH row
execute FUNCTION sync_license_from_request ();

create trigger trg_sync_license_userid BEFORE INSERT
or
update on "License" for EACH row
execute FUNCTION sync_license_userid ();

create table public."LicenseHistory" (
  id text not null,
  "licenseId" text not null,
  action text not null,
  details text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint LicenseHistory_pkey primary key (id),
  constraint LicenseHistory_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "LicenseHistory_licenseId_idx" on public."LicenseHistory" using btree ("licenseId") TABLESPACE pg_default;

create table public."LicenseHistory" (
  id text not null,
  "licenseId" text not null,
  action text not null,
  details text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint LicenseHistory_pkey primary key (id),
  constraint LicenseHistory_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "LicenseHistory_licenseId_idx" on public."LicenseHistory" using btree ("licenseId") TABLESPACE pg_default;

create table public."LicenseTransferRequest" (
  id text not null,
  "userId" text not null,
  "oldLicenseKey" text not null,
  "newRequestKey" text not null,
  reason text null,
  status text not null default 'PENDING'::text,
  "createdAt" timestamp without time zone not null default now(),
  "processedAt" timestamp without time zone null,
  "processedBy" text null,
  "userEmail" text null,
  constraint LicenseTransferRequest_pkey primary key (id),
  constraint LicenseTransferRequest_userId_fkey foreign KEY ("userId") references "User" (id)
) TABLESPACE pg_default;

create table public."LicenseValidationLog" (
  id text not null,
  "licenseId" text null,
  "deviceId" text null,
  "ipAddress" text null,
  "appVersion" text null,
  os text null,
  result text not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint LicenseValidationLog_pkey primary key (id),
  constraint LicenseValidationLog_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create index IF not exists "LicenseValidationLog_licenseId_idx" on public."LicenseValidationLog" using btree ("licenseId") TABLESPACE pg_default;

create table public."LicenseValidationLog" (
  id text not null,
  "licenseId" text null,
  "deviceId" text null,
  "ipAddress" text null,
  "appVersion" text null,
  os text null,
  result text not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint LicenseValidationLog_pkey primary key (id),
  constraint LicenseValidationLog_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create index IF not exists "LicenseValidationLog_licenseId_idx" on public."LicenseValidationLog" using btree ("licenseId") TABLESPACE pg_default;

create table public."Notification" (
  id text not null,
  "userId" text null,
  type text not null,
  message text not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  read boolean not null default false,
  readat timestamp without time zone null,
  constraint Notification_pkey primary key (id),
  constraint Notification_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create table public."PasswordResetToken" (
  token text not null,
  "userId" text not null,
  "expiresAt" timestamp without time zone not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint PasswordResetToken_pkey primary key (token),
  constraint PasswordResetToken_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create table public."Payment" (
  id uuid not null default extensions.uuid_generate_v4 (),
  userid text null,
  amount numeric not null,
  currency text null default 'NGN'::text,
  status text not null,
  reference text not null,
  gateway text not null,
  created_at timestamp with time zone null default now(),
  constraint Payment_pkey primary key (id),
  constraint Payment_userid_fkey foreign KEY (userid) references "User" (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_payment_user on public."Payment" using btree (userid) TABLESPACE pg_default;

create index IF not exists idx_payment_status on public."Payment" using btree (status) TABLESPACE pg_default;

create index IF not exists idx_payment_created on public."Payment" using btree (created_at) TABLESPACE pg_default;

create table public."Profile" (
  id uuid not null default gen_random_uuid (),
  userid uuid not null,
  fullname text null default ''::text,
  phone text null default ''::text,
  company text null default ''::text,
  created_at timestamp with time zone null default now(),
  company_id uuid null,
  constraint Profile_pkey primary key (id),
  constraint Profile_company_id_fkey foreign KEY (company_id) references companies (id)
) TABLESPACE pg_default;

create trigger trg_enforce_company_id BEFORE INSERT
or
update on "Profile" for EACH row
execute FUNCTION enforce_company_id ();

create table public."Profile" (
  id uuid not null default gen_random_uuid (),
  userid uuid not null,
  fullname text null default ''::text,
  phone text null default ''::text,
  company text null default ''::text,
  created_at timestamp with time zone null default now(),
  company_id uuid null,
  constraint Profile_pkey primary key (id),
  constraint Profile_company_id_fkey foreign KEY (company_id) references companies (id)
) TABLESPACE pg_default;

create trigger trg_enforce_company_id BEFORE INSERT
or
update on "Profile" for EACH row
execute FUNCTION enforce_company_id ();

create table public."RenewalHistory" (
  id uuid not null default gen_random_uuid (),
  amount numeric null,
  paidat timestamp with time zone null,
  createdat timestamp with time zone null default now(),
  tenantid uuid null,
  constraint RenewalHistory_pkey primary key (id)
) TABLESPACE pg_default;

create table public."RenewalHistory" (
  id uuid not null default gen_random_uuid (),
  amount numeric null,
  paidat timestamp with time zone null,
  createdat timestamp with time zone null default now(),
  tenantid uuid null,
  constraint RenewalHistory_pkey primary key (id)
) TABLESPACE pg_default;

create table public."Session" (
  id text not null,
  token text not null,
  "userId" text not null,
  "expiresAt" timestamp without time zone not null,
  constraint Session_pkey primary key (id),
  constraint Session_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create unique INDEX IF not exists "Session_token_key" on public."Session" using btree (token) TABLESPACE pg_default;

create table public."SupportTicket" (
  id text not null,
  "userId" text not null,
  "licenseId" text null,
  subject text not null,
  message text not null,
  status public.TicketStatus not null default 'OPEN'::"TicketStatus",
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone not null,
  priority text null default 'LOW'::text,
  category text null default 'GENERAL'::text,
  constraint SupportTicket_pkey primary key (id),
  constraint SupportTicket_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete set null,
  constraint SupportTicket_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "SupportTicket_userId_idx" on public."SupportTicket" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "SupportTicket_licenseId_idx" on public."SupportTicket" using btree ("licenseId") TABLESPACE pg_default;

create index IF not exists idx_ticket_status on public."SupportTicket" using btree (status) TABLESPACE pg_default;

create table public."SupportTicket" (
  id text not null,
  "userId" text not null,
  "licenseId" text null,
  subject text not null,
  message text not null,
  status public.TicketStatus not null default 'OPEN'::"TicketStatus",
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone not null,
  priority text null default 'LOW'::text,
  category text null default 'GENERAL'::text,
  constraint SupportTicket_pkey primary key (id),
  constraint SupportTicket_licenseId_fkey foreign KEY ("licenseId") references "License" (id) on update CASCADE on delete set null,
  constraint SupportTicket_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "SupportTicket_userId_idx" on public."SupportTicket" using btree ("userId") TABLESPACE pg_default;

create index IF not exists "SupportTicket_licenseId_idx" on public."SupportTicket" using btree ("licenseId") TABLESPACE pg_default;

create index IF not exists idx_ticket_status on public."SupportTicket" using btree (status) TABLESPACE pg_default;

create table public."TeamMember" (
  id text not null,
  "teamId" text not null,
  "userId" text not null,
  role public.TeamRole not null default 'MEMBER'::"TeamRole",
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint TeamMember_pkey primary key (id),
  constraint TeamMember_teamId_fkey foreign KEY ("teamId") references "Team" (id) on update CASCADE on delete RESTRICT,
  constraint TeamMember_userId_fkey foreign KEY ("userId") references "User" (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists "TeamMember_teamId_idx" on public."TeamMember" using btree ("teamId") TABLESPACE pg_default;

create index IF not exists "TeamMember_userId_idx" on public."TeamMember" using btree ("userId") TABLESPACE pg_default;

create unique INDEX IF not exists "TeamMember_teamId_userId_key" on public."TeamMember" using btree ("teamId", "userId") TABLESPACE pg_default;

create table public."Tenant" (
  id text not null,
  name text not null,
  email text null,
  phone text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint Tenant_pkey primary key (id)
) TABLESPACE pg_default;

create table public."Tenant" (
  id text not null,
  name text not null,
  email text null,
  phone text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint Tenant_pkey primary key (id)
) TABLESPACE pg_default;

create table public."TicketReply" (
  id text not null,
  "ticketId" text not null,
  "userId" text null,
  "isFromAdmin" boolean not null default false,
  message text not null,
  "createdAt" timestamp without time zone not null default now(),
  constraint TicketReply_pkey primary key (id),
  constraint TicketReply_ticketId_fkey foreign KEY ("ticketId") references "SupportTicket" (id) on delete CASCADE,
  constraint TicketReply_userId_fkey foreign KEY ("userId") references "User" (id)
) TABLESPACE pg_default;

create table public."User" (
  id text not null,
  name text null,
  email text not null,
  "emailVerified" timestamp without time zone null,
  role public.Role not null default 'CLIENT'::"Role",
  "tenantId" text null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint User_pkey primary key (id),
  constraint User_tenantId_fkey foreign KEY ("tenantId") references "Tenant" (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create unique INDEX IF not exists "User_email_key" on public."User" using btree (email) TABLESPACE pg_default;

create table public."VerificationToken" (
  identifier text not null,
  token text not null,
  expires timestamp without time zone not null
) TABLESPACE pg_default;

create unique INDEX IF not exists "VerificationToken_token_key" on public."VerificationToken" using btree (token) TABLESPACE pg_default;

create unique INDEX IF not exists "VerificationToken_identifier_token_key" on public."VerificationToken" using btree (identifier, token) TABLESPACE pg_default;

create table public.clientbilling (
  userid uuid not null,
  annual_fee numeric not null,
  next_renewal_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint clientbilling_pkey primary key (userid)
) TABLESPACE pg_default;

create table public.clientbillingdefaults (
  name text not null,
  annual_fee numeric not null,
  next_renewal_date date not null,
  constraint clientbillingdefaults_pkey primary key (name)
) TABLESPACE pg_default;

create table public.companies (
  id uuid not null default gen_random_uuid (),
  company_name text not null,
  annual_fee numeric not null,
  renewal_date date not null,
  base_license_count integer not null,
  plan text not null default 'ENTERPRISE'::text,
  created_at timestamp with time zone null default now(),
  user_id uuid null,
  constraint companies_pkey primary key (id),
  constraint companies_company_name_key unique (company_name),
  constraint companies_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create table public.contact_messages (
  id bigint generated always as identity not null,
  name text not null,
  email text not null,
  message text not null,
  ip_address text null,
  created_at timestamp with time zone null default now(),
  constraint contact_messages_pkey primary key (id)
) TABLESPACE pg_default;

create table public.coupons (
  id uuid not null default gen_random_uuid (),
  code text not null,
  type text not null,
  value numeric not null,
  expires date not null,
  max_uses integer not null,
  used integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint coupons_pkey primary key (id),
  constraint coupons_code_key unique (code),
  constraint coupons_type_check check (
    (
      type = any (array['percentage'::text, 'fixed'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists coupons_code_idx on public.coupons using btree (code) TABLESPACE pg_default;

create index IF not exists coupons_active_idx on public.coupons using btree (active) TABLESPACE pg_default;

create index IF not exists coupons_expires_idx on public.coupons using btree (expires) TABLESPACE pg_default;

create table public.invoices (
  id uuid not null default gen_random_uuid (),
  user_email text not null,
  invoice_number text not null,
  amount numeric not null,
  payment_reference text null,
  payment_date timestamp with time zone not null default now(),
  description text null,
  type text not null,
  created_at timestamp with time zone null default now(),
  constraint invoices_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_invoices_user_email on public.invoices using btree (user_email) TABLESPACE pg_default;

