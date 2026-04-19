import { baseEmailTemplate } from "./baseTemplate";

export function licenseRequestReceivedTemplate(requestKey: string) {
  return baseEmailTemplate({
    title: "License Request Received",
    message: `
      <p>Hello,</p>
      <p>Your license request has been received successfully.</p>
      <p><strong>Request Key:</strong> ${requestKey}</p>
      <p>Our team will review it shortly.</p>
      <p>Regards,<br/>CentralCore Team</p>
    `,
  });
}
