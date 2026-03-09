// PATH: lib/email/layout.ts

export function emailLayout(content: string) {
  return `
  <div style="
    max-width: 600px;
    margin: auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background: #ffffff;
    color: #222;
  ">

    <!-- CTIS HEADER -->
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #0A4D68; margin: 0; font-size: 24px;">
        CTIS Technologies
      </h1>
      <p style="color: #555; font-size: 14px; margin-top: 4px;">
        Customer Support & Solutions
      </p>
    </div>

    <!-- MAIN CONTENT -->
    <div>
      ${content}
    </div>

    <!-- FOOTER -->
    <footer style="margin-top: 40px; font-size: 12px; color: #777; text-align: center;">
      © ${new Date().getFullYear()} CTIS Technologies  
      <br/>
      <span style="color: #0A4D68;">www.ctis.com</span>
    </footer>

    <!-- DARK MODE SUPPORT -->
    <style>
      @media (prefers-color-scheme: dark) {
        div, p, h1, h2, h3, footer {
          background: #0d1117 !important;
          color: #e6edf3 !important;
        }
        .card {
          background: #161b22 !important;
          border-color: #30363d !important;
        }
      }
    </style>
  </div>
  `;
}
