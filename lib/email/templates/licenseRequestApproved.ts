import { baseEmailTemplate } from "./baseTemplate";

export function licenseRequestApprovedTemplate(productName: string) {
  return baseEmailTemplate({
    title: "License Request Approved",
    message: `
      <p>Hello,</p>
      <p>Your license request for <strong>${productName}</strong> has been approved.</p>
      <p>You can now access your license in your client portal.</p>
      <p>Regards,<br/>CentralCore Team</p>
    `,
  });
}
