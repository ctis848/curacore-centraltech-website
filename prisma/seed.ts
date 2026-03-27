import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const client = await prisma.user.create({
    data: {
      id: "test-user-1",
      name: "John Test",
      email: "client@example.com",
      passwordHash,
      role: "CLIENT",
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: "admin-user-1",
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.session.create({
    data: {
      id: "session-1",
      userId: client.id,
      token: "test-session-token-123",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const lic1 = await prisma.license.create({
    data: {
      id: "lic-1",
      userId: client.id,
      productName: "CentralCore Pro",
      licenseKey: "CC-PRO-1234-5678",
      purchasedAt: new Date(Date.now() - 30 * 86400000),
      activatedAt: new Date(Date.now() - 29 * 86400000),
      expiresAt: new Date(Date.now() + 330 * 86400000),
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  });

  const lic2 = await prisma.license.create({
    data: {
      id: "lic-2",
      userId: client.id,
      productName: "CentralCore Basic",
      licenseKey: "CC-BASIC-9876-5432",
      purchasedAt: new Date(Date.now() - 400 * 86400000),
      activatedAt: new Date(Date.now() - 399 * 86400000),
      expiresAt: new Date(Date.now() - 35 * 86400000),
      status: "EXPIRED",
      updatedAt: new Date(),
    },
  });

  await prisma.machineActivation.createMany({
    data: [
      {
        id: "mach-1",
        licenseId: lic1.id,
        machineId: "DESKTOP-ABC123",
        machineName: "Office Desktop",
        osVersion: "Windows 11 Pro",
        ipAddress: "192.168.1.10",
      },
      {
        id: "mach-2",
        licenseId: lic1.id,
        machineId: "LAPTOP-XYZ789",
        machineName: "Work Laptop",
        osVersion: "Windows 10 Home",
        ipAddress: "192.168.1.15",
      },
    ],
  });

  await prisma.licenseHistory.createMany({
    data: [
      {
        id: "hist-1",
        licenseId: lic1.id,
        action: "ACTIVATED",
        details: "Activated on DESKTOP-ABC123",
      },
      {
        id: "hist-2",
        licenseId: lic1.id,
        action: "ACTIVATED",
        details: "Activated on LAPTOP-XYZ789",
      },
      {
        id: "hist-3",
        licenseId: lic2.id,
        action: "EXPIRED",
        details: "License expired automatically",
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        id: "inv-1",
        userId: client.id,
        licenseId: lic1.id,
        amount: 49.99,
        currency: "USD",
        status: "PAID",
        description: "Annual License Renewal",
        paidAt: new Date(Date.now() - 14 * 86400000),
      },
      {
        id: "inv-2",
        userId: client.id,
        licenseId: lic2.id,
        amount: 19.99,
        currency: "USD",
        status: "PENDING",
        description: "License Renewal (Expired)",
      },
    ],
  });

  await prisma.supportTicket.createMany({
    data: [
      {
        id: "ticket-1",
        userId: client.id,
        licenseId: lic1.id,
        subject: "Activation Issue",
        message: "My license is not activating on my laptop.",
        status: "OPEN",
      },
      {
        id: "ticket-2",
        userId: client.id,
        licenseId: lic2.id,
        subject: "Billing Question",
        message: "I was charged twice for my subscription.",
        status: "CLOSED",
      },
    ],
  });

  const team = await prisma.team.create({
    data: {
      id: "team-1",
      ownerId: admin.id,
      name: "CentralCore Dev Team",
    },
  });

  await prisma.teamMember.createMany({
    data: [
      {
        id: "tm-1",
        teamId: team.id,
        userId: admin.id,
        role: "OWNER",
      },
      {
        id: "tm-2",
        teamId: team.id,
        userId: client.id,
        role: "MEMBER",
      },
    ],
  });

  await prisma.emailTemplate.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        name: "password_reset",
        subject: "Reset Your Password",
        body: "<p>Hello,</p><p>Click the link below to reset your password:</p><p>{{reset_link}}</p>",
      },
      {
        id: crypto.randomUUID(),
        name: "license_generated",
        subject: "Your License is Ready",
        body: "<p>Your license has been generated:</p><p><strong>{{license_key}}</strong></p>",
      },
      {
        id: crypto.randomUUID(),
        name: "invoice_paid",
        subject: "Payment Received",
        body: "<p>We have received your payment.</p>",
      },
      {
        id: crypto.randomUUID(),
        name: "support_reply",
        subject: "Support Ticket Update",
        body: "<p>Your support ticket has been updated.</p>",
      },
    ],
  });

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
