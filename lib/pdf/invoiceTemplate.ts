export function getInvoiceHtml(params: {
  invoiceNumber: string;
  companyName: string;
  companyEmail: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  planName: string;
}) {
  const {
    invoiceNumber,
    companyName,
    companyEmail,
    amount,
    dueDate,
    createdDate,
    planName,
  } = params;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111827; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .brand { color: #0f766e; font-size: 22px; font-weight: bold; }
    .section { margin-bottom: 20px; }
    .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px; font-size: 14px; }
    th { background-color: #f3f4f6; text-align: left; }
    .total-row td { font-weight: bold; }
    .footer { margin-top: 32px; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">CentralCore EMR – CentralTech</div>
    <div>
      <div class="label">Invoice</div>
      <div class="value">#${invoiceNumber}</div>
    </div>
  </div>

  <div class="section">
    <div class="label">Billed To</div>
    <div class="value">${companyName}</div>
    <div class="value">${companyEmail}</div>
  </div>

  <div class="section">
    <div class="label">Details</div>
    <div class="value">Created: ${createdDate}</div>
    <div class="value">Due Date: ${dueDate}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Plan</th>
        <th>Amount (NGN)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>CentralCore EMR Annual Subscription</td>
        <td>${planName}</td>
        <td>${amount.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td>${amount.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Thank you for your continued trust in CentralCore EMR and CentralTech.<br/>
    www.ctistech.com
  </div>
</body>
</html>`;
}
