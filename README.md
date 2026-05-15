# Admission Portal - Backend API

A robust Node.js/Express backend for handling student enrollments, payment verification, and seat management.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login.
- **Course Management**: Sync courses from Google Sheets and manage available seats.
- **Payment Verification**: Razorpay signature verification and order tracking.
- **Email Service**: Automated receipt delivery via AWS SES.
- **Document Storage**: Secure file uploads to AWS S3.
- **Sheet Integration**: Real-time logging of admission data to Google Sheets.

## 🛠️ Technology Stack

- Node.js & Express
- MongoDB & Mongoose
- AWS SDK (S3 & SES)
- Razorpay SDK
- Google Spreadsheet API

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB Atlas URI
- AWS Access Keys (SES & S3)
- Razorpay API Keys

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Fill in your credentials.

## 🔑 Environment Configuration Guide

Follow these steps to obtain the necessary keys for your `.env` file:

### 1. MongoDB Atlas
- Create a cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas).
- Go to **Database Access** and create a user with read/write permissions.
- Go to **Network Access** and whitelist `0.0.0.0/0` (for development).
- Click **Connect** > **Drivers** to get your `MONGODB_URI`.

### 2. Razorpay
- Sign up at [razorpay.com](https://razorpay.com).
- Go to **Account & Settings** > **API Keys**.
- Generate your **Key ID** and **Key Secret**. Use Test Mode for initial setup.

### 3. AWS (S3 & SES)
- **IAM User**: Create an IAM user in the AWS Console with `AmazonS3FullAccess` and `AmazonSESFullAccess`.
- **Security Credentials**: Generate an **Access Key** and **Secret Key** for this user.
- **S3**: Create an S3 bucket and make it public (or configure appropriate CORS/Policy).
- **SES**: Verify your sender email address in the **SES Dashboard** > **Identities**.
- **SMTP**: In SES, go to **SMTP Settings** > **Create SMTP Credentials** to get your SMTP username and password.

### 4. Google Sheets
- Create a project in [Google Cloud Console](https://console.cloud.google.com/).
- Enable **Google Sheets API** and **Google Drive API**.
- Create a **Service Account** and download the JSON key file.
- Rename the key file to `google-credentials.json` and place it in the `backend/` root.
- **Sharing**: Open your Google Sheet and click **Share**. Add the service account email (found in the JSON) as an **Editor**.
- **Sheet ID**: Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`.

3. **Run the server**:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📄 API Endpoints

- `POST /api/v1/auth/register` - Student registration
- `POST /api/v1/payments/order` - Create Razorpay order
- `POST /api/v1/payments/verify` - Verify payment and log to Sheets
- `POST /api/v1/courses/sync` - Sync courses from Google Sheets

## 📊 Google Sheet Structure

The course synchronization feature expects a Google Sheet with the following column structure. Ensure your sheet has a header row matching these names exactly.

### Columns:
| Category | Course Name | Program Name | Fee | Total Seats | Seats Available | Status | Emoji |
|----------|-------------|--------------|-----|-------------|-----------------|--------|-------|
| Engineering & tech | Artificial Intelligence & Data Science | B.E/B.Tech | 2000 | 60 | 60 | Active | 🤖 |
| Arts & Science | BCA | UG Programs | 1500 | 60 | 60 | Active | 💻 |
| Paramedical | B.Sc. Nursing | Nursing | 3000 | 60 | 60 | Active | 🏥 |

### Notes:
- **Category**: Used to group courses on the frontend and create separate sheets for enrollment logs.
- **Course Name**: The primary name of the course/department.
- **Program Name**: Sub-type (e.g., B.E, B.Sc, Ph.D).
- **Fee**: The enrollment fee (numeric).
- **Total Seats / Seats Available**: Managed automatically during enrollments and swaps.
- **Status**: Only rows marked as `Active` will be synced.
- **Emoji**: Used for visual branding on the course cards.
