export async function sendEmail(to: string, subject: string, message: string) {
  await fetch("https://formsubmit.co/ajax/info@ctistech.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      message,
      email: to,
    }),
  });
}
