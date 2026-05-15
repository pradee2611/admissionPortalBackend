const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const Course = require('../models/courseModel');

const syncCoursesFromSheet = async () => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || require('../../google-credentials.json').client_email,
      key: (process.env.GOOGLE_PRIVATE_KEY || require('../../google-credentials.json').private_key).replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    console.log(`Sync: Found ${rows.length} rows in Google Sheet`);

    if (rows.length === 0) {
      throw new Error('No data rows found in the sheet.');
    }

    const sheetCourseKeys = []; // Track which courses exist in the sheet
    let upsertCount = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const getValue = (keys) => {
        for (const key of keys) {
          const val = row.get(key);
          if (val !== undefined && val !== null && val !== '') return val;
        }
        return null;
      };

      const category = getValue(['Category', 'category']) || 'General';
      const courseName = getValue(['Course Name', 'CourseName', 'course_name', 'Title']) || 'Untitled Course';
      const programName = getValue(['Program Name', 'ProgramName', 'program', 'Instructor']) || 'N/A';
      const fee = parseFloat(getValue(['Fee', 'fee', 'Price', 'price'])) || 1;
      const totalSeats = getValue(['Total Seats', 'TotalSeats', 'seats']) || '0';
      const seatsAvailable = getValue(['Seats Available', 'SeatsAvailable']) || '0';
      const status = getValue(['Status', 'status']) || 'Active';
      const emoji = getValue(['Emoji', 'emoji']) || '📚';

      const title = `${courseName}`;
      const slug = courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + index;

      // Unique key for matching: originalName + category
      const matchKey = { originalName: courseName.trim(), category: category };
      sheetCourseKeys.push(matchKey);

      await Course.findOneAndUpdate(
        matchKey,
        {
          $set: {
            title,
            emoji,
            programName,
            slug,
            description: `Enroll in ${courseName} at ${category}. Join our premium ${programName} program today.`,
            thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
            instructor: programName,
            price: fee,
            discountPrice: fee,
            duration: "Full-Time",
            language: "English",
            totalSeats: parseInt(totalSeats) || 0,
            availableSeats: parseInt(seatsAvailable) || 0,
            isActive: true,
          },
          $setOnInsert: {
            rating: 4.8,
            numReviews: 0,
            studentsCount: 0,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      upsertCount++;
    }

    // Soft-delete courses that are no longer in the sheet
    // Build an $or query for all courses that ARE in the sheet
    if (sheetCourseKeys.length > 0) {
      const softDeleted = await Course.updateMany(
        {
          $nor: sheetCourseKeys.map(k => ({
            originalName: k.originalName,
            category: k.category,
          })),
          isActive: true,
        },
        { $set: { isActive: false } }
      );
      if (softDeleted.modifiedCount > 0) {
        console.log(`Soft-deleted ${softDeleted.modifiedCount} courses no longer in sheet`);
      }
    }

    console.log(`Sync complete: ${upsertCount} courses upserted`);
    return { success: true, count: upsertCount };
  } catch (error) {
    console.error('Google Sheets Sync Error:', error.message);
    throw error;
  }
};

const decrementSeatsInSheet = async (courseOriginalName) => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || require('../../google-credentials.json').client_email,
      key: (process.env.GOOGLE_PRIVATE_KEY || require('../../google-credentials.json').private_key).replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const row = rows.find(r => {
      const name = r.get('Course Name') || r.get('CourseName') || r.get('Title');
      return name === courseOriginalName;
    });

    if (row) {
      const currentAvailable = parseInt(row.get('Seats Available') || row.get('SeatsAvailable') || '0');
      if (currentAvailable > 0) {
        row.set('Seats Available', (currentAvailable - 1).toString());
        await row.save();
        console.log(`Updated sheet: Decremented seats for ${courseOriginalName}`);
      }
    }
  } catch (error) {
    console.error('Error updating seats in sheet:', error.message);
  }
};

const savePurchasedUserToSheet = async (user, course, order, paymentId) => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || require('../../google-credentials.json').client_email,
      key: (process.env.GOOGLE_PRIVATE_KEY || require('../../google-credentials.json').private_key).replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const category = course.category || 'General';
    let sheet = doc.sheetsByTitle[category];

    const headers = [
      'Name', 'Email', 'Phone', 'Gender', 'DOB', 'Qualification', 
      'Address', 'City', 'State', 'Pincode', 
      'Course Name', 'Amount Paid', 'Order ID', 'Transaction ID', 
      '10th Marksheet', '12th Marksheet', 'TC', 'Lateral Cert', 
      'Community Cert', 'Aadhar Card', 'Profile Image', 'Date'
    ];

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: category, 
        headerValues: headers
      });
      console.log(`Created new sheet for category: ${category}`);
    }

    await sheet.addRow({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || 'N/A',
      Gender: user.gender || 'N/A',
      DOB: user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A',
      Qualification: user.currentQualification || 'N/A',
      Address: user.address || 'N/A',
      City: user.city || 'N/A',
      State: user.state || 'N/A',
      Pincode: user.pincode || 'N/A',
      'Course Name': course.originalName || course.title,
      'Amount Paid': `₹${order.totalAmount}`,
      'Order ID': order._id.toString(),
      'Transaction ID': paymentId || 'N/A',
      '10th Marksheet': user.markSheet10 || 'N/A',
      '12th Marksheet': user.markSheet12 || 'N/A',
      'TC': user.tc || 'N/A',
      'Lateral Cert': user.lateralCert || 'N/A',
      'Community Cert': user.communityCert || 'N/A',
      'Aadhar Card': user.aadharCard || 'N/A',
      'Profile Image': user.profileImage || 'N/A',
      Date: new Date().toLocaleString(),
    });

    console.log(`Saved user ${user.email} to ${category} sheet with full details`);
  } catch (error) {
    console.error('Error saving user to category sheet:', error.message);
  }
};

module.exports = { syncCoursesFromSheet, decrementSeatsInSheet, savePurchasedUserToSheet };
