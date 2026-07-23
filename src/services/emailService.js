const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = 'noreply@wissenhaus.org';
const ADMIN_EMAIL = 'info@wissenhaus.org';

// Email templates
const emailTemplates = {
  mentorApplication: (data) => ({
    subject: 'Thank you for your mentoring application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0F2D1D; color: white; padding: 20px; text-align: center;">
          <h1>Wissen-Haus</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <h2>Thank You for Applying to Mentor!</h2>
          <p>Hi ${data.firstName},</p>
          <p>We've received your mentoring application and we're excited to review it. Thank you for your interest in guiding the next generation of Nigerian youth.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details:</h3>
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>City:</strong> ${data.city}</p>
            <p><strong>Experience:</strong> ${data.experience.substring(0, 150)}...</p>
          </div>

          <p>Our team will review your application within 3-5 business days and get in touch with next steps.</p>

          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            If you have any questions, reply to this email or contact us at ${ADMIN_EMAIL}
          </p>
        </div>
      </div>
    `
  }),

  trainerApplication: (data) => ({
    subject: 'Thank you for your trainer application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0F2D1D; color: white; padding: 20px; text-align: center;">
          <h1>Wissen-Haus</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <h2>Thank You for Applying to Train!</h2>
          <p>Hi ${data.firstName},</p>
          <p>We've received your trainer application and we appreciate your commitment to bridging the skills gap. Your expertise could transform lives.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details:</h3>
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>City:</strong> ${data.city}</p>
            <p><strong>Expertise:</strong> ${Array.isArray(data.expertise) ? data.expertise.join(', ') : 'N/A'}</p>
            <p><strong>Experience:</strong> ${data.experience.substring(0, 150)}...</p>
          </div>

          <p>Our team will review your application within 3-5 business days. If selected, we'll discuss curriculum design and onboarding details.</p>

          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            Questions? Contact us at ${ADMIN_EMAIL}
          </p>
        </div>
      </div>
    `
  }),

  operationsApplication: (data) => ({
    subject: 'Thank you for your operations application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0F2D1D; color: white; padding: 20px; text-align: center;">
          <h1>Wissen-Haus</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <h2>Thank You for Joining Our Team!</h2>
          <p>Hi ${data.firstName},</p>
          <p>We've received your operations application. We're looking for passionate individuals like you to help scale our impact across Nigeria.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details:</h3>
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>City:</strong> ${data.city}</p>
            <p><strong>Areas of Interest:</strong> ${Array.isArray(data.areas) ? data.areas.join(', ') : 'N/A'}</p>
            <p><strong>Experience:</strong> ${data.experience.substring(0, 150)}...</p>
          </div>

          <p>We'll review your application and be in touch within 3-5 business days with next steps.</p>

          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            Have questions? Reach out to ${ADMIN_EMAIL}
          </p>
        </div>
      </div>
    `
  }),

  adminNotification: (type, data) => ({
    subject: `New ${type} Application: ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New ${type.charAt(0).toUpperCase() + type.slice(1)} Application</h2>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <h3>Message/Experience:</h3>
        <p>${data.experience}</p>

        ${data.expertise ? `<p><strong>Expertise:</strong> ${Array.isArray(data.expertise) ? data.expertise.join(', ') : data.expertise}</p>` : ''}
        ${data.areas ? `<p><strong>Areas of Interest:</strong> ${Array.isArray(data.areas) ? data.areas.join(', ') : data.areas}</p>` : ''}
      </div>
    `
  })
};

// Send email to applicant
async function sendApplicationConfirmation(type, applicantData) {
  try {
    const templateMap = {
      mentor: emailTemplates.mentorApplication,
      trainer: emailTemplates.trainerApplication,
      operations: emailTemplates.operationsApplication
    };

    const template = templateMap[type];
    if (!template) {
      throw new Error(`Unknown application type: ${type}`);
    }

    const emailContent = template(applicantData);

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: applicantData.email,
      ...emailContent
    });

    console.log(`Confirmation email sent to ${applicantData.email}:`, response);
    return response;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

// Send notification to admin
async function sendAdminNotification(type, applicantData) {
  try {
    const emailContent = emailTemplates.adminNotification(type, applicantData);

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      ...emailContent
    });

    console.log(`Admin notification sent:`, response);
    return response;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
}

// Send email with custom template
async function sendEmail(to, subject, html) {
  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });

    console.log('Email sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendApplicationConfirmation,
  sendAdminNotification,
  sendEmail,
  EMAIL_FROM,
  ADMIN_EMAIL
};
