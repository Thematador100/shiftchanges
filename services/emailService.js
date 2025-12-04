import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@shiftchange.com';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Sends a payment confirmation email to the customer
 * @param {string} email - Customer's email address
 * @param {string} planName - Name of the purchased plan
 * @param {string} authToken - Authentication token for the user
 * @returns {Promise<void>}
 */
export async function sendPaymentConfirmationEmail(email, planName, authToken) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email send.');
    return;
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Welcome to ShiftChange - Payment Confirmed! 🎉',
    text: `
Thank you for your purchase!

Your payment has been successfully processed and your account has been activated.

Package: ${planName}

You can now access all premium features at: ${process.env.APP_URL || 'https://shiftchange.com'}

Your authentication token: ${authToken}

(Keep this token safe - you'll need it to log in on other devices)

If you have any questions, please contact us at support@shiftchange.com

Best regards,
The ShiftChange Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .package-box { background: #f0fdfa; border: 2px solid #5eead4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .token-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 14px; word-break: break-all; }
    .button { display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to ShiftChange!</h1>
    </div>
    <div class="content">
      <h2 style="color: #0d9488;">Payment Confirmed</h2>
      <p>Thank you for your purchase! Your payment has been successfully processed and your account is now active.</p>
      
      <div class="package-box">
        <p style="margin: 0; color: #0d9488; font-weight: bold; font-size: 12px; text-transform: uppercase;">Package Unlocked</p>
        <h3 style="margin: 10px 0 0 0; color: #115e59; font-size: 24px;">${planName}</h3>
      </div>
      
      <p>You now have full access to all premium features including:</p>
      <ul style="color: #475569;">
        <li>AI-powered resume generation</li>
        <li>ATS optimization</li>
        <li>Job matching and tailoring</li>
        <li>Cover letter generation</li>
        <li>And much more!</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://shiftchange.com'}" class="button">Start Building Your Resume</a>
      </div>
      
      <h3 style="color: #0d9488; margin-top: 30px;">Your Authentication Token</h3>
      <p style="font-size: 14px; color: #64748b;">Keep this token safe - you'll need it to log in on other devices:</p>
      <div class="token-box">${authToken}</div>
      
      <div class="footer">
        <p>Need help? Contact us at <a href="mailto:support@shiftchange.com" style="color: #0d9488;">support@shiftchange.com</a></p>
        <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} ShiftChange. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    // Don't throw - we don't want to fail the payment process if email fails
  }
}

/**
 * Sends a login link/token to a returning customer
 * @param {string} email - Customer's email address
 * @param {string} authToken - Authentication token for the user
 * @returns {Promise<void>}
 */
export async function sendLoginEmail(email, authToken) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email send.');
    return;
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Your ShiftChange Login Token',
    text: `
Your ShiftChange login token:

${authToken}

Use this token to log in at: ${process.env.APP_URL || 'https://shiftchange.com'}

If you didn't request this, please ignore this email.

Best regards,
The ShiftChange Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .token-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 14px; word-break: break-all; text-align: center; }
    .button { display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Welcome Back!</h1>
    </div>
    <div class="content">
      <h2 style="color: #0d9488;">Your Login Token</h2>
      <p>Here's your authentication token to access ShiftChange:</p>
      
      <div class="token-box">${authToken}</div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://shiftchange.com'}" class="button">Log In Now</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">If you didn't request this login token, please ignore this email.</p>
      
      <div class="footer">
        <p>Need help? Contact us at <a href="mailto:support@shiftchange.com" style="color: #0d9488;">support@shiftchange.com</a></p>
        <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} ShiftChange. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Login email sent to ${email}`);
  } catch (error) {
    console.error('Error sending login email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    throw error; // Throw for login emails since user needs it
  }
}

export default {
  sendPaymentConfirmationEmail,
  sendLoginEmail,
};
