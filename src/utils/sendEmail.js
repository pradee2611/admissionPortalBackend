const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SES_SMTP_HOST,
    port: process.env.SES_SMTP_PORT,
    auth: {
      user: process.env.SES_SMTP_USERNAME,
      pass: process.env.SES_SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.ADMIN_EMAIL}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Accepted:', info.accepted);
  console.log('Response:', info.response);
};

module.exports = sendEmail;
