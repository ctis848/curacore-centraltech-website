export function activationMessage(fullName: string, plan: string) {
  const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  return `
🎉 *CentralCore EMR License Activated!*

Hello ${fullName},

Your *${plan.toUpperCase()}* license has been successfully activated.

💳 *Plan:* ${plan}
📅 *Activated:* ${new Date().toDateString()}
⏳ *Expires:* ${expiry.toDateString()}
🔄 *Annual Service Fee:* Required yearly to keep your license active

Thank you for choosing CentralCore EMR.
Central Tech Information Systems Ltd.
  `;
}
