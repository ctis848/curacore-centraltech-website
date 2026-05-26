import React from "react";

interface ProformaItem {
  name: string;
  qty: number;
  amount: number;
}

interface ProformaTemplateProps {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
  items: ProformaItem[];
  subtotal: number;
  vat: number;
  total: number;
}

export function ProformaTemplate(props: ProformaTemplateProps) {
  const { companyName, contactName, email, phone, serviceType, description, items, subtotal, vat, total } = props;

  // This is a pure layout component; plug into your PDF generator.
  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, fontSize: 12 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>PROFORMA INVOICE</h1>
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
      </div>
    </div>
  );
}
