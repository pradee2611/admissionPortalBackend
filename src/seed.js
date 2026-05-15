const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/courseModel');

dotenv.config();

const courseData = [
  // SNS Academy (CBSE)
  { category: "SNS Academy (CBSE)", instructor: "International School", title: "Kindergarten: Pre-KG, LKG, UKG" },
  { category: "SNS Academy (CBSE)", instructor: "International School", title: "Primary Classes: Grade I - V" },
  { category: "SNS Academy (CBSE)", instructor: "International School", title: "Middle Classes: Grade VI - VIII" },
  { category: "SNS Academy (CBSE)", instructor: "International School", title: "Secondary: Grade IX - X" },
  { category: "SNS Academy (CBSE)", instructor: "International School", title: "Higher Secondary: Grade XI - XII" },

  // AI & Data Science
  { category: "AI & Data Science", instructor: "B.E./B.Tech", title: "Artificial Intelligence & Data Science" },
  { category: "AI & Data Science", instructor: "B.E./B.Tech", title: "Artificial Intelligence & Machine Learning" },
  { category: "AI & Data Science", instructor: "B.E./B.Tech", title: "Data Science" },

  // Computer Science
  { category: "Computer Science", instructor: "B.E./B.Tech", title: "Computer Science and Engineering" },
  { category: "Computer Science", instructor: "B.E./B.Tech", title: "Computer Science and Design" },
  { category: "Computer Science", instructor: "B.E./B.Tech", title: "Computer Science and Technology" },
  { category: "Computer Science", instructor: "B.E./B.Tech", title: "CSE (IOT & Cyber Security Including Block Chain)" },
  { category: "Computer Science", instructor: "B.E./B.Tech", title: "Information Technology" },

  // Core Engineering
  { category: "Core Engineering", instructor: "B.E./B.Tech", title: "Mechanical & Mechatronics (Additive Manufacturing)" },
  { category: "Core Engineering", instructor: "B.E./B.Tech", title: "Mechanical Engineering" },
  { category: "Core Engineering", instructor: "B.E./B.Tech", title: "Civil Engineering" },
  { category: "Core Engineering", instructor: "B.E./B.Tech", title: "Electrical & Electronics Engineering" },
  { category: "Core Engineering", instructor: "B.E./B.Tech", title: "Electronics & Communication Engineering" },

  // Specialized Engineering
  { category: "Specialized Engineering", instructor: "B.E./B.Tech", title: "Aerospace Engineering" },
  { category: "Specialized Engineering", instructor: "B.E./B.Tech", title: "Mechatronics Engineering" },
  { category: "Specialized Engineering", instructor: "B.E./B.Tech", title: "Bio-Medical Engineering" },
  { category: "Specialized Engineering", instructor: "B.E./B.Tech", title: "Food Technology" },

  // PG Programs
  { category: "PG Programs", instructor: "MBA/MCA", title: "MBA" },
  { category: "PG Programs", instructor: "MBA/MCA", title: "MCA" },
  { category: "PG Programs", instructor: "MBA/MCA", title: "MBA in Business Analytics" },
  { category: "PG Programs", instructor: "Ph.D", title: "Ph.D - CIVIL, CSE, ECE, EEE, Mechanical" },

  // B.Sc. Computer Science
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "BCA" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Full Stack Web Development" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "AI and Data Science" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Data Analytics" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Data Science & Visualization" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "DevOps & Cloud" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Cyber Security" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Computer Science (AI, ML & DS)" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Agentic AI" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Generative AI" },
  { category: "B.Sc. Computer Science", instructor: "UG Programs", title: "Information Technology" },

  // Commerce Programs
  { category: "Commerce Programs", instructor: "UG Programs", title: "B.Com" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "B.Com Professional Accounting" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "B.Com (CA)" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "B.Com (IT)" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "B.Com Digital Marketing and Data Mining" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "BBA" },
  { category: "Commerce Programs", instructor: "UG Programs", title: "BBA (Computer Applications)" },

  // Specialized B.Sc.
  { category: "Specialized B.Sc.", instructor: "UG Programs", title: "B.Sc. Costume Design & Fashion" },
  { category: "Specialized B.Sc.", instructor: "UG Programs", title: "B.Sc. Psychology" },

  // PG Programs - Masters & Research
  { category: "PG Programs", instructor: "Masters & Research", title: "M.Sc. Computer Science" },
  { category: "PG Programs", instructor: "Masters & Research", title: "M.Sc. Mathematics" },
  { category: "PG Programs", instructor: "Masters & Research", title: "M.Com" },
  { category: "PG Programs", instructor: "Masters & Research", title: "M.Com (CA)" },
  { category: "PG Programs", instructor: "Masters & Research", title: "M.A. English" },
  { category: "PG Programs", instructor: "Masters & Research", title: "Ph.D - CS, Commerce, IT, Management" },
  { category: "PG Programs", instructor: "Masters & Research", title: "Ph.D - Tamil, English, Library Science" },

  // Pharmacy
  { category: "Pharmacy", instructor: "Code: 794", title: "Bachelor of Pharmacy (B.Pharm)" },
  { category: "Pharmacy", instructor: "Code: 794", title: "Diploma in Pharmacy" },
  { category: "Pharmacy", instructor: "Code: 794", title: "M.Pharmacy (Pharmaceutics)" },
  { category: "Pharmacy", instructor: "Code: 794", title: "Doctor of Pharmacy (Pharm.D)" },

  // Nursing
  { category: "Nursing", instructor: "Code: 879", title: "B.Sc. Nursing" },

  // Physiotherapy
  { category: "Physiotherapy", instructor: "Code: 864", title: "Bachelor of Physiotherapy (BPT)" },

  // Allied Health Sciences
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Operation Theatre & Anesthesia Tech" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Cardio Pulmonary Perfusion Care" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Cardiac Technology" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Physician Assistant" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Radiography & Imaging Tech" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Respiratory therapy" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Dialysis Technology" },
  { category: "Allied Health Sciences", instructor: "B.Sc. Programs", title: "Optometry" },

  // B.Ed Programs
  { category: "B.Ed Programs", instructor: "College of Education", title: "Tamil" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "English" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Mathematics" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "History" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Economics" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Commerce" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Biological Sciences" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Computer Science" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Social Science" },
  { category: "B.Ed Programs", instructor: "College of Education", title: "Physical Science" }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing courses
    await Course.deleteMany();
    
    // Prepare courses
    const sampleCourses = courseData.map((course, index) => {
      const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + index;
      
      return {
        title: course.title,
        slug: slug,
        description: `Enroll in ${course.title} at ${course.category}. Join our premium ${course.instructor} program today.`,
        thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
        instructor: course.instructor,
        category: course.category,
        price: 1, // 1 RS as requested
        discountPrice: 1, // 1 RS as requested
        rating: 4.8,
        numReviews: Math.floor(Math.random() * 50) + 10,
        studentsCount: Math.floor(Math.random() * 500) + 50,
        duration: "Full-Time",
        language: "English"
      };
    });

    await Course.insertMany(sampleCourses);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
