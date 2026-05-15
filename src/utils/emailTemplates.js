const getOtpEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          background-color: #4f46e5;
          padding: 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 25px;
          color: #555555;
        }
        .otp-container {
          background-color: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 20px;
          margin: 0 auto 30px;
          display: inline-block;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 6px;
          color: #4f46e5;
          margin: 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #888888;
          border-top: 1px solid #eeeeee;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to seatify!</h1>
        </div>
        <div class="content">
          <p>Hello there,</p>
          <p>Thank you for choosing to register with us. To complete your sign-up process, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-container">
            <h2 class="otp-code">${otp}</h2>
          </div>
          
          <p>This code is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
          <p>If you did not request this registration, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Need help? Contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} seatify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getOtpEmailTemplate
};
