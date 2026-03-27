-- RESET ALL TABLES
TRUNCATE TABLE
  "supportticket",
  "invoice",
  "machineactivation",
  "licensehistory",
  "license",
  "session",
  "teammember",
  "team",
  "user"
RESTART IDENTITY CASCADE;

-- INSERT USER (CLIENT)
INSERT INTO "user" (id, name, email, passwordHash, role)
VALUES (
  'test-user-1',
  'John Test',
  'client@example.com',
  '$2a$10$Qe7p8iYpQ7rj9uYpQ7rj9uYpQ7rj9uYpQ7rj9uYpQ7rj9u',
  'CLIENT'
);

-- INSERT USER (ADMIN)
INSERT INTO "user" (id, name, email, passwordHash, role)
VALUES (
  'admin-user-1',
  'Admin User',
  'admin@example.com',
  '$2a$10$Qe7p8iYpQ7rj9uYpQ7rj9uYpQ7rj9uYpQ7rj9uYpQ7rj9u',
  'ADMIN'
);

-- SESSION
INSERT INTO "session" (id, userId, expiresAt, token)
VALUES (
  'session-1',
  'test-user-1',
  NOW() + INTERVAL '7 days',
  'test-session-token-123'
);

-- LICENSES
INSERT INTO "license" (
  id, userId, productName, licenseKey, purchasedAt, activatedAt, expiresAt,
  status, createdAt, updatedAt
)
VALUES
(
  'lic-1',
  'test-user-1',
  'CentralCore Pro',
  'CC-PRO-1234-5678',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '29 days',
  NOW() + INTERVAL '11 months',
  'ACTIVE',
  NOW(),
  NOW()
),
(
  'lic-2',
  'test-user-1',
  'CentralCore Basic',
  'CC-BASIC-9876-5432',
  NOW() - INTERVAL '400 days',
  NOW() - INTERVAL '399 days',
  NOW() - INTERVAL '35 days',
  'EXPIRED',
  NOW(),
  NOW()
);

-- MACHINE ACTIVATIONS
INSERT INTO "machineactivation" (
  id, licenseId, machineId, machineName, osVersion, ipAddress
)
VALUES
(
  'mach-1',
  'lic-1',
  'DESKTOP-ABC123',
  'Office Desktop',
  'Windows 11 Pro',
  '192.168.1.10'
),
(
  'mach-2',
  'lic-1',
  'LAPTOP-XYZ789',
  'Work Laptop',
  'Windows 10 Home',
  '192.168.1.15'
);

-- LICENSE HISTORY
INSERT INTO "licensehistory" (id, licenseId, action, details)
VALUES
('hist-1', 'lic-1', 'ACTIVATED', 'Activated on DESKTOP-ABC123'),
('hist-2', 'lic-1', 'ACTIVATED', 'Activated on LAPTOP-XYZ789'),
('hist-3', 'lic-2', 'EXPIRED', 'License expired automatically');

-- INVOICES
INSERT INTO "invoice" (
  id, userId, licenseId, amount, currency, status, description, paidAt
)
VALUES
(
  'inv-1',
  'test-user-1',
  'lic-1',
  49.99,
  'USD',
  'PAID',
  'Annual License Renewal',
  NOW() - INTERVAL '14 days'
),
(
  'inv-2',
  'test-user-1',
  'lic-2',
  19.99,
  'USD',
  'PENDING',
  'License Renewal (Expired)',
  NULL
);

-- SUPPORT TICKETS
INSERT INTO "supportticket" (
  id, userId, licenseId, subject, message, status
)
VALUES
(
  'ticket-1',
  'test-user-1',
  'lic-1',
  'Activation Issue',
  'My license is not activating on my laptop.',
  'OPEN'
),
(
  'ticket-2',
  'test-user-1',
  'lic-2',
  'Billing Question',
  'I was charged twice for my subscription.',
  'CLOSED'
);

-- TEAM
INSERT INTO "team" (id, ownerId, name)
VALUES ('team-1', 'admin-user-1', 'CentralCore Dev Team');

INSERT INTO "teammember" (id, teamId, userId, role)
VALUES
('tm-1', 'team-1', 'admin-user-1', 'OWNER'),
('tm-2', 'team-1', 'test-user-1', 'MEMBER');
