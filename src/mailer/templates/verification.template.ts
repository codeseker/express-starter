/**
 * Builds the HTML body for a verification OTP email.
 */
export function buildVerificationEmail(
  firstName: string,
  otp: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:.5px;">
                Email Verification
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;">
                Hi <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the one-time code below to verify your email address.
                This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
                          padding:20px;text-align:center;margin-bottom:28px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1a1a2e;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0;color:#9ca3af;font-size:13px;">
                If you did not create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#d1d5db;font-size:12px;text-align:center;">
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
