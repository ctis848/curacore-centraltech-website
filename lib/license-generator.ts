import { execFile } from "child_process";
import path from "path";

export function generateLicenseWithExe(requestKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const exePath = path.join(process.cwd(), "license-generator", "generator.exe");

    execFile(exePath, [requestKey], (error, stdout) => {
      if (error) {
        console.error("License generator error:", error);
        return reject(new Error("License generator failed"));
      }

      const licenseKey = stdout.toString().trim();
      if (!licenseKey) {
        return reject(new Error("Empty license key returned"));
      }

      resolve(licenseKey);
    });
  });
}
