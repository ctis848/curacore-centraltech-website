import { baseEmailTemplate } from "./baseTemplate";

export function licenseKeyDeliveredTemplate(licenseKey: string, productName: string) {
  return baseEmailTemplate({
    title: "Your License Key",
    message: `
      <p>Hello,</p>
      <p>Your license key for <strong>${productName}</strong> is ready:</p>
      <p style="font-size:18px; font-weight:bold; color:#0d6efd;">${licenseKey}</p>
      <p>Regards,<br/>CentralCore Team</p>
    `,
  });
}
