import React from "react";

interface InvoiceItem {
  name: string;
  qty: number;
  amount: number;
}

interface InvoiceTemplateProps {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  paid: boolean;
}

export function InvoiceTemplate(props: InvoiceTemplateProps) {
  const { companyName, contactName, email, phone, serviceType, description, items, subtotal, vat, total, paid } = props;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, fontSize: 12 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        {paid ? "PAYMENT RECEIPT" : "FINAL INVOICE"}
      </h1>
      <p><strong>Status:</strong> {paid ? "PAID" : "UNPAID"}</p>
      <p><strong>Company:</strong> {companyName}</p>
      <p><strong>Contact:</strong> {contactName}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p><strong>Service Type:</strong> {serviceType}</p>
      <p><strong>Description:</strong> {description}</p>

      <hr style={{ margin: "16px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
            <th align="right">Amount</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td align="right">{i.qty}</td>
              <td align="right">₦{i.amount.toLocaleString()}</td>
              <td align="right">₦{(i.qty * i.amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <p><strong>Subtotal:</strong> ₦{subtotal.toLocaleString()}</p>
        <p><strong>VAT (7.5%):</strong> ₦{vat.toLocaleString()}</p>
        <p><strong>Total:</strong> ₦{total.toLocaleString()}</p>
        {paid && (
          <p style={{ marginTop: 8, fontWeight: "bold" }}>
            Payment received in full. Thank you.
          </p>
        )}
      </div>
    </div>
  );
}
