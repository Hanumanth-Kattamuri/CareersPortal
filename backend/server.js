const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const app = express();

// Email Configuration - ADD THIS SECTION

// Middleware - YOUR EXISTING CODE CONTINUES HERE
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// MongoDB Connection
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/careersportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected to careersportal');
  
  // Test if Application model works
  const count = await Application.countDocuments();
  console.log(`📊 Total applications in DB: ${count}`);
  
  // Initialize Google Sheets
  await setupGoogleSheets();
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'GMail',
  auth: {
    user: 'naghanu07@gmail.com',
    pass: 'hzidwvqrwkcantfs'
  }
});

// Google Sheets Configuration
// IMPORTANT: Replace these values with your actual Google Sheets credentials
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1wgNsZ5mtOCaj6vnvD84ECMnx-Hw3cFzmlUxwiQTUQzo', // Replace with your spreadsheet ID from URL
  serviceAccountEmail: 'careers-portal-bot@careersportal-475209.iam.gserviceaccount.com', // From JSON file
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC461C+7BI62ADF\n2N7Y4kQYzq+x7WT4ExWxjmyflFYQgsDjU282yGcP8HIfwOz+lTryOZgMs68Sd25Y\n24eBJsNtOaMef4UWLufJ0oaI9rnpgdk7/BH/yChra3vicITQEabM334wosPFv/F9\nnEsjDPpo0fbnzEHgkaBnVU2zG6aCvml1ZLiy1Wi77eYo/YVEVTq28Juwx4yh2SAq\nNLi95YqgHRVRxHRWG5WcZTfIeUdRsyWXy87FdYY+TwLZkcMwsmthKKbX/WoWg7oW\nB8v0tqxXiYY/5ftjOFR5m/z3VWmKzH2uP5t8nIA5WVnrANQuabOAkseqNvrcViZy\n0boYsRKRAgMBAAECggEABUl6JcRa3b5NM+N0ClJJRuAqNgR6IlKObtxoCHOXx9B3\n47CIkS+11y1TPf6TRfLr3EvQhhByUGjzJ1uyZfK/AobRxr+NOIeUlwnLpi/X98nd\ndWSxcZVLBPRL3Rj4rDSIuhxaqC5T9ZvzVZVK9VTCKUntIBtt96+CNrd09DmCZK65\nag5H54xSRfzqN446ktSvHk2ojEm9v/KfjMW8mahk3XuvwyR6UmbwFsYrkH0QYuDa\nJ0GXtGVMxvIbMfhCsTeUn0EJxAwpJ4DWchcK8NGz2U7rCzV5a9rQ++tuTFbgxi4n\nQhJ0kP5M+QNuSbcZeejpyanPkNeGRvq6latkVMa+vwKBgQDpIRNVvlvSO4LFGnc4\n4dhCS55f+4gU3wyjvCNoUBmnk3yrUA+5bx5d/9JQTPjwjBhQRudeFcAqTAUxIrx2\niyhhiTF17THiNIAY5zRXHKzbG+X94+VupcBYwklmOJtF7vSSsUPNLnV9Ur4RHmSt\nKP5B0tV1TqlNuhulHoe2QQcBswKBgQDLD3g3Oh82mG3oDW4OtHHygVIbmYmj0svm\nHiGYI3u6GOy8Ff5cd27EGFZXz4CjbzserUxJy79YcVF96ILJ6jpb52VSATTr81t4\nvkOD34PMg3BVNDcKQs/1cK+2nTr353Xq23MsQSCpuZRjpzDKYC4Qa3kR5EA1VTTU\nxRMkehlQqwKBgDuECSabqV9beAAPyJ4J8ibCnVUNpukFJHnsfvGTeWkxmuM1Vj5V\n4t/Gfo+nhuoKKe7cmxaG4P8rVyv7HTf6QL3dw3XCrzh7hLRW2iLfHDX3wlh1xM3h\nnOBMAWcKToGlBmUowhFwqefrpsBCDRuz2m09gOcoxMomGAaoa6cYpMxHAoGASbOs\ns4biC2PaCG7PcoDmFtn/XkslHRQGs9hd4yWF4+7mBgKJlzA2QPCAblC/ZRKbR7Ao\nz2QnaEeBB40b44OjePYM3W3YsodavQF56eR3pwRSAmr4Sz4i0vf6nvKEk7QsJXlP\nXVGqNFBKXr0xRVMRhR4tDGRnNbRef5ekMgorJA8CgYAWl18G+UmgCPVeuw/NRuxh\n4JJKoIW3wtPdRtm0z7YKPMLlbrAQGB2F1Jmpu+ZOFb7CiNdXc/uyuR0361HwhSFS\nlOhh6jlssHP+995LLafommoo3ZapauIGN4edIIeJtZr8FPPgQ8CrZkk8QMCVQkdT\nbfAjhHsBBryQYRNt8KBlrw==\n-----END PRIVATE KEY-----\n' // From JSON file - include the full key with \n characters
};

async function initGoogleSheet() {
  try {
    // Check if config is properly set
    if (!GOOGLE_SHEETS_CONFIG.spreadsheetId || 
        GOOGLE_SHEETS_CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
      console.log('⚠️ Google Sheets not configured');
      return null;
    }

    const serviceAccountAuth = new JWT({
      email: GOOGLE_SHEETS_CONFIG.serviceAccountEmail,
      key: GOOGLE_SHEETS_CONFIG.privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByIndex[0];

    const headers = [
      'Application ID',
      'Candidate Name',
      'Email',
      'Phone',
      'Position',
      'Resume Link',
      'Status',
      'Panel Number',
      'Interviewer Name',
      'Interviewer Email',
      'Interviewer Phone',
      'Round',
      'Feedback',
      'Recruiter Action',
      'Notes',
      'Date Applied'
    ];

    // If no sheet exists, create it
    if (!sheet) {
      console.log('🧾 Creating new sheet...');
      sheet = await doc.addSheet({ title: 'Applications' });
    }

    // Load cells to check if headers exist
    await sheet.loadCells('A1:P1');
    
    const firstCell = sheet.getCell(0, 0);
    const needsHeaders = !firstCell.value || firstCell.value === '';

    if (needsHeaders) {
      console.log('🧾 Writing headers...');
      
      // Write headers directly to cells
      for (let i = 0; i < headers.length; i++) {
        const cell = sheet.getCell(0, i);
        cell.value = headers[i];
      }
      
      await sheet.saveUpdatedCells();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Load header row for library to work
    await sheet.loadHeaderRow();
    
    console.log('✅ Google Sheets ready with', sheet.headerValues.length, 'columns');
    return sheet;
  } catch (error) {
    console.error('❌ Google Sheets initialization error:', error.message);
    return null;
  }
}

let googleSheet = null;

// Initialize Google Sheets on startup
async function setupGoogleSheets() {
  try {
    googleSheet = await initGoogleSheet();
    if (googleSheet) {
      console.log('✅ Google Sheets initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to setup Google Sheets:', error.message);
  }
}
// ==================== SCHEMAS ====================

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String, required: true },
  skillset: { type: String, required: true },
  ctc: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  jobType: { type: String, required: true, default: "Full-time" },
  department: { type: String, default: "" },
  description: { type: String, required: true },
  responsibilities: { type: String, default: "" },
  qualifications: { type: String, default: "" },
  benefits: { type: String, default: "" },
  deadline: { type: Date, default: null }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

const recruiterActionSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  roundStatus: { type: String, default: 'Round 1' },
  feedback: { type: String, default: '' },
  scheduledDate: { type: String, default: '' },
  scheduledTime: { type: String, default: '' },
  interviewerName: { type: String, default: '' },
  interviewerEmail: { type: String, default: '' },
  interviewerPhone: { type: String, default: '' },
  panelNumber: { type: String, default: '' },
  scheduledBy: { type: String, default: '' },
  interviewPlace: { type: String, default: '' },
  isRejected: { type: Boolean, default: false },
  rejectionRound: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const RecruiterAction = mongoose.model('RecruiterAction', recruiterActionSchema);
const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  skillset: { type: String, required: true },
  resumeUrl: String,
  resumePDF: {
    data: String,
    contentType: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  jobId: { type: String, required: true },
  jobTitle: String,
  location: String,
  pincode: String,
  address: String,
  project: String,
  academic: {
    tenth: { score: String, school: String },
    diploma: { score: String, college: String, stream: String },
    graduation: { score: String, college: String, stream: String },
    postGraduation: { score: String, college: String, stream: String }
  },
  status: { type: String, default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
});




const Application = mongoose.model('Application', applicationSchema);

// ==================== EMAIL TEMPLATES ====================

const emailTemplates = {
  confirmationEmail: (name, jobTitle, email, phone, skillset) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
        .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; color: #0a0a0a; font-size: 28px; }
        .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; }
        .info-box { background: #2a2a2a; padding: 20px; border-left: 4px solid #FF6B35; margin: 20px 0; border-radius: 8px; }
        .info-box p { margin: 8px 0; font-size: 14px; }
        .label { color: #FF6B35; font-weight: 600; }
        .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
        h3 { color: #FF6B35; margin-top: 20px; }
        ul { color: #e0e0e0; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Application Received!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for applying for the <strong>${jobTitle}</strong> position at Gamyam! We're thrilled to see your interest in joining our team.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0;">Application Summary</h3>
            <p><span class="label">Position:</span> ${jobTitle}</p>
            <p><span class="label">Your Email:</span> ${email}</p>
            <p><span class="label">Phone:</span> ${phone}</p>
            <p><span class="label">Skills:</span> ${skillset}</p>
            <p><span class="label">Submitted On:</span> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your application has been <strong>successfully submitted</strong> and is now with our recruitment team for careful review.</p>
          
          <h3>What Happens Next?</h3>
          <ul>
            <li>Our HR team will review your profile against the job requirements</li>
            <li>If your qualifications match our criteria, we will reach out to schedule an interview</li>
            <li>You can expect to hear from us within <strong>5-7 business days</strong></li>
            <li>Please keep your phone accessible during this period</li>
          </ul>
          
          <p style="margin-top: 30px;">We appreciate your interest and enthusiasm for Gamyam. Best of luck!</p>
          
          <p>
            Warm regards,<br>
            <strong style="color: #FF6B35;">Gamyam Recruitment Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply directly.</p>
          <p>For questions, contact us at hr@gamyam.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  acceptanceEmail: (name, jobTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
        .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; }
        .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; }
        .highlight { background: rgba(76, 175, 80, 0.2); padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 8px; }
        .next-steps { background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .next-steps li { margin: 10px 0; }
        .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
        h3 { color: #FF6B35; }
        ul { color: #e0e0e0; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Congratulations!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <div class="highlight">
            <h2 style="margin-top: 0; color: #4CAF50;">You've Been Shortlisted!</h2>
            <p style="font-size: 16px; margin: 10px 0;">We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position has been <strong>shortlisted</strong>!</p>
          </div>
          
          <p>Your profile stood out to us, and we would like to move forward with the next stage of our recruitment process.</p>
          
          <h3>Next Steps</h3>
          <div class="next-steps">
            <ol style="color: #e0e0e0; line-height: 1.8;">
              <li><strong>Interview Scheduling:</strong> Our HR team will contact you shortly to schedule your interview</li>
              <li><strong>Preparation:</strong> Be prepared to discuss your experience, projects, and technical skills</li>
              <li><strong>Questions:</strong> Feel free to ask us any questions about the role or company</li>
            </ol>
          </div>
          
          <p style="margin-top: 30px;">We're looking forward to speaking with you!</p>
          
          <p>
            Best regards,<br>
            <strong style="color: #FF6B35;">Gamyam Recruitment Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>If you have any questions before your interview, feel free to reach out to us.</p>
          <p>Contact: hr@gamyam.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  rejectionEmail: (name, jobTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
        .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; color: #0a0a0a; font-size: 28px; }
        .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; }
        .message-box { background: #2a2a2a; padding: 20px; border-left: 4px solid #FF6B35; margin: 20px 0; border-radius: 8px; }
        .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
        h3 { color: #FF6B35; }
        ul { color: #e0e0e0; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at Gamyam and for taking the time to apply.</p>
          
          <div class="message-box">
            <p style="margin: 0;">After careful consideration of all applications, we regret to inform you that we have decided not to move forward with your application at this time.</p>
          </div>
          
          <p>This decision does not reflect on your abilities or qualifications. We received many exceptional applications, and the selection process was highly competitive.</p>
          
          <p>We wish you the very best in your career journey.</p>
          
          <p>
            Warm regards,<br>
            <strong style="color: #FF6B35;">Gamyam Recruitment Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>Keep an eye on our careers page for future opportunities.</p>
          <p>Email: hr@gamyam.com</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// ==================== RESUME PARSING FUNCTIONS ====================

function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  return emails ? emails[0] : '';
}

function extractPhone(text) {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    const validPhones = phones.filter(p => {
      const digits = p.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    });
    return validPhones[0] || '';
  }
  return '';
}

function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const skipWords = ['resume', 'curriculum vitae', 'cv', 'profile', 'personal details', 'contact'];
  
  for (let line of lines) {
    const lowerLine = line.toLowerCase();
    if (skipWords.some(word => lowerLine.includes(word))) continue;
    if (line.includes('@') || /\d{10}/.test(line)) continue;
    
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const hasLetters = words.every(w => /^[A-Za-z]+$/.test(w));
      if (hasLetters) return line;
    }
  }
  return '';
}

function extractSkills(text) {
  const commonSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
    'mongodb', 'mysql', 'postgresql', 'oracle', 'sql', 'nosql', 'redis',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
    'machine learning', 'deep learning', 'ai', 'data science', 'tensorflow', 'pytorch',
    'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
    'typescript', 'nextjs', 'redux', 'webpack', 'babel', 'jest', 'testing'
  ];
  
  const textLower = text.toLowerCase();
  const foundSkills = [];
  
  for (let skill of commonSkills) {
    if (textLower.includes(skill)) {
      const formatted = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!foundSkills.includes(formatted)) {
        foundSkills.push(formatted);
      }
    }
  }
  return foundSkills.join(', ');
}

function extractEducation(text) {
  const education = {
    tenth: { score: '', school: '' },
    diploma: { score: '', college: '', stream: '' },
    graduation: { score: '', college: '', stream: '' },
    postGraduation: { score: '', college: '', stream: '' }
  };
  
  const lines = text.split('\n');
  const scorePattern = /(\d+(?:\.\d+)?)\s*(%|CGPA|GPA|percentage)/gi;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (/10th|tenth|SSC|SSLC|secondary/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.tenth.score = scoreMatch[0];
    }
    
    if (/12th|twelfth|intermediate|diploma|higher secondary|HSC/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.diploma.score = scoreMatch[0];
    }
    
    if (/bachelor|b\.tech|b\.e\.|bca|b\.sc|graduation|undergraduate/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.graduation.score = scoreMatch[0];
    }
    
    if (/master|m\.tech|m\.e\.|mca|m\.sc|post.*graduation|MBA/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.postGraduation.score = scoreMatch[0];
    }
  }
  
  return education;
}

function extractProjects(text) {
  const projectSection = [];
  const lines = text.split('\n');
  let inProjectSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (/^(projects?|work experience|experience)$/i.test(line)) {
      inProjectSection = true;
      continue;
    }
    
    if (inProjectSection && /^(education|skills?|certifications?|achievements?)$/i.test(line)) {
      break;
    }
    
    if (inProjectSection && line.length > 10) {
      projectSection.push(line);
    }
  }
  
  return projectSection.join('\n').substring(0, 500) || 'Projects will be discussed during interview';
}

function extractLocation(text) {
  const indianStates = [
    'Andhra Pradesh', 'Karnataka', 'Kerala', 'Maharashtra', 'Tamil Nadu',
    'Telangana', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana'
  ];
  
  const majorCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Visakhapatnam', 'Bhopal', 'Patna'
  ];
  
  let state = '';
  let city = '';
  
  for (let s of indianStates) {
    if (text.includes(s)) {
      state = s;
      break;
    }
  }
  
  for (let c of majorCities) {
    if (text.includes(c)) {
      city = c;
      break;
    }
  }
  
  return { state, city };
}

async function parseResume(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    const extractedData = {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      skillset: extractSkills(text),
      academic: extractEducation(text),
      project: extractProjects(text),
      location: extractLocation(text)
    };
    
    return extractedData;
  } catch (error) {
    console.error('❌ Error parsing PDF:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

// ==================== GOOGLE SHEETS SYNC ====================

async function syncToGoogleSheets(applicationId, data) {
  if (!googleSheet) {
    // Try to initialize if not already done
    if (!googleSheet) {
      return; // Skip if still not available
    }
  }

  try {
    // Reload headers to ensure they're fresh
    await googleSheet.loadHeaderRow();
    
    // Get all rows
    const rows = await googleSheet.getRows();
    
    // Find existing row
    let existingRow = rows.find(row => row.get('Application ID') === applicationId);
    
    if (existingRow) {
      // Update existing row
      if (data.name) existingRow.set('Candidate Name', data.name);
      if (data.email) existingRow.set('Email', data.email);
      if (data.phone) existingRow.set('Phone', data.phone);
      if (data.position) existingRow.set('Position', data.position);
      if (data.skills) existingRow.set('Resume Link', data.skills);
      if (data.status) existingRow.set('Status', data.status);
      if (data.round) existingRow.set('Round', data.round);
      if (data.feedback) existingRow.set('Feedback', data.feedback);
      if (data.scheduledDate) existingRow.set('Panel Number', data.scheduledDate);
      if (data.scheduledTime) existingRow.set('Interviewer Name', data.scheduledTime);
      if (data.interviewer) existingRow.set('Interviewer Email', data.interviewer);
      if (data.scheduledBy) existingRow.set('Recruiter Action', data.scheduledBy);
      if (data.place) existingRow.set('Notes', data.place);
      
      await existingRow.save();
      console.log('✅ Updated Google Sheets row for:', applicationId);
    } else {
      // Add new row
      await googleSheet.addRow({
        'Application ID': applicationId,
        'Candidate Name': data.name || '',
        'Email': data.email || '',
        'Phone': data.phone || '',
        'Position': data.position || '',
        'Resume Link': data.skills || '',
        'Status': data.status || 'pending',
        'Panel Number': data.scheduledDate || '',
        'Interviewer Name': data.scheduledTime || '',
        'Interviewer Email': data.interviewer || '',
        'Interviewer Phone': '',
        'Round': data.round || '',
        'Feedback': data.feedback || '',
        'Recruiter Action': data.scheduledBy || '',
        'Notes': data.place || '',
        'Date Applied': new Date().toLocaleDateString()
      });
      console.log('✅ Added new row to Google Sheets for:', applicationId);
    }
  } catch (error) {
    console.error('❌ Google Sheets sync error:', error.message);
  }
}

// ==================== ROUTES ====================

// Upload and parse resume
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📤 PDF Upload received:', req.file.originalname);
    
    const extractedData = await parseResume(req.file.buffer);
    const base64PDF = req.file.buffer.toString('base64');

    res.json({
      message: 'Resume uploaded and parsed successfully',
      extractedData: extractedData,
      resumeData: {
        data: base64PDF,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    console.error('❌ Error processing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      details: error.message 
    });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create job
app.post('/api/jobs', async (req, res) => {
  try {
    console.log('\n========== CREATE JOB ==========');
    const job = new Job(req.body);
    const savedJob = await job.save();
    console.log('✅ Job created:', savedJob._id);
    res.status(201).json(savedJob);
  } catch (err) {
    console.error('❌ Error creating job:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    console.log('✅ Job updated');
    res.json(job);
  } catch (err) {
    console.error('❌ Error updating job:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit application
app.post('/api/applications', async (req, res) => {
  console.log('\n📋 NEW APPLICATION RECEIVED');
  console.log('Applicant:', req.body.name);
  
  try {
    const application = new Application(req.body);
    await application.save();
    console.log('✅ Application saved to database');

    // Sync to Google Sheets
    await syncToGoogleSheets(application._id.toString(), {
      name: application.name,
      email: application.email,
      phone: application.phone,
      position: application.jobTitle,
      skills: application.skillset,
      status: application.status
    });

    // Send confirmation email
    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: application.email,
      subject: `Thank You for Applying - ${application.jobTitle}`,
      html: emailTemplates.confirmationEmail(
        application.name,
        application.jobTitle,
        application.email,
        application.phone,
        application.skillset
      )
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ ERROR sending confirmation email:', error.message);
      } else {
        console.log('✅ CONFIRMATION EMAIL SENT!');
      }
    });

    res.status(201).json({ 
      message: 'Application submitted successfully! A confirmation email has been sent.', 
      application 
    });
    
  } catch (err) {
    console.error('❌ Error submitting application:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all applications
// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    console.log('📋 Fetching all applications...');
    const applications = await Application.find().sort({ appliedAt: -1 });
    console.log(`✅ Found ${applications.length} applications`);
    res.json(applications);
  } catch (err) {
    console.error('❌ Error fetching applications:', err);
    res.status(500).json({ error: err.message, details: 'Failed to fetch applications from database' });
  }
});

// Download resume
app.get('/api/applications/:id/resume', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application || !application.resumePDF || !application.resumePDF.data) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const buffer = Buffer.from(application.resumePDF.data, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${application.resumePDF.filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject application
app.post('/api/applications/:id/reject', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Sync to Google Sheets
    await syncToGoogleSheets(application._id.toString(), {
      name: application.name,
      email: application.email,
      phone: application.phone,
      position: application.jobTitle,
      skills: application.skillset,
      status: 'rejected'
    });

    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: application.email,
      subject: `Application Status Update - ${application.jobTitle}`,
      html: emailTemplates.rejectionEmail(application.name, application.jobTitle)
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Application rejected and email sent', application });
  } catch (err) {
    console.error('Error rejecting application:', err);
    res.status(500).json({ error: err.message });
  }
});

// Accept application
app.post('/api/applications/:id/accept', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Sync to Google Sheets
    await syncToGoogleSheets(application._id.toString(), {
      name: application.name,
      email: application.email,
      phone: application.phone,
      position: application.jobTitle,
      skills: application.skillset,
      status: 'accepted'
    });

    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: application.email,
      subject: `Congratulations! You've been shortlisted - ${application.jobTitle}`,
      html: emailTemplates.acceptanceEmail(application.name, application.jobTitle)
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Application accepted and email sent', application });
  } catch (err) {
    console.error('Error accepting application:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save recruiter actions (NEW ENDPOINT)
app.post('/api/recruiter-actions/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { 
      roundStatus, 
      feedback, 
      scheduledDate, 
      scheduledTime, 
      interviewerName, 
      interviewerEmail,
      interviewerPhone,
      panelNumber,
      scheduledBy, 
      interviewPlace,
      isRejected,
      rejectionRound
    } = req.body;

    console.log('💾 Saving recruiter actions for:', applicationId);

    let recruiterAction = await RecruiterAction.findOne({ applicationId });
    
    if (recruiterAction) {
      // Handle feedback appending based on round
      let updatedFeedback = recruiterAction.feedback || '';
      
      if (feedback && feedback.trim()) {
        // Check if this round's feedback already exists
        const roundPrefix = `${roundStatus}:`;
        const feedbackLines = updatedFeedback.split('\n').filter(line => line.trim());
        
        // Remove existing feedback for this round if present
        const filteredFeedback = feedbackLines.filter(line => !line.startsWith(roundPrefix));
        
        // Add new feedback for this round
        filteredFeedback.push(`${roundPrefix} ${feedback.trim()}`);
        updatedFeedback = filteredFeedback.join('\n');
      }
      
      recruiterAction.roundStatus = roundStatus;
      recruiterAction.feedback = updatedFeedback;
      recruiterAction.scheduledDate = scheduledDate;
      recruiterAction.scheduledTime = scheduledTime;
      recruiterAction.interviewerName = interviewerName;
      recruiterAction.interviewerEmail = interviewerEmail;
      recruiterAction.interviewerPhone = interviewerPhone;
      recruiterAction.panelNumber = panelNumber;
      recruiterAction.scheduledBy = scheduledBy;
      recruiterAction.interviewPlace = interviewPlace;
      recruiterAction.isRejected = isRejected || false;
      recruiterAction.rejectionRound = rejectionRound || '';
      recruiterAction.updatedAt = new Date();
      await recruiterAction.save();
      console.log('✅ Updated existing recruiter action');
    } else {
      const formattedFeedback = feedback ? `${roundStatus}: ${feedback.trim()}` : '';
      
      recruiterAction = new RecruiterAction({
        applicationId,
        roundStatus,
        feedback: formattedFeedback,
        scheduledDate,
        scheduledTime,
        interviewerName,
        interviewerEmail,
        interviewerPhone,
        panelNumber,
        scheduledBy,
        interviewPlace,
        isRejected: isRejected || false,
        rejectionRound: rejectionRound || ''
      });
      await recruiterAction.save();
      console.log('✅ Created new recruiter action');
    }

    const application = await Application.findById(applicationId);
    
    if (application) {
      await syncToGoogleSheets(applicationId, {
        name: application.name,
        email: application.email,
        phone: application.phone,
        position: application.jobTitle,
        skills: application.skillset,
        status: application.status,
        round: roundStatus,
        feedback: recruiterAction.feedback,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        interviewer: interviewerName,
        scheduledBy: scheduledBy,
        place: interviewPlace
      });
    }

    res.json({ 
      message: 'Recruiter actions saved successfully', 
      recruiterAction 
    });
  } catch (err) {
    console.error('❌ Error saving recruiter actions:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get recruiter actions for an application (NEW ENDPOINT)
app.get('/api/recruiter-actions/:applicationId', async (req, res) => {
  try {
    const recruiterAction = await RecruiterAction.findOne({ 
      applicationId: req.params.applicationId 
    });
    
    if (!recruiterAction) {
      return res.json({
        roundStatus: 'Round 1',
        feedback: '',
        scheduledDate: '',
        scheduledTime: '',
        interviewerName: '',
        interviewerEmail: '',
        interviewerPhone: '',
        panelNumber: '',
        scheduledBy: '',
        interviewPlace: '',
        isRejected: false,
        rejectionRound: ''
      });
    }
    
    res.json(recruiterAction);
  } catch (err) {
    console.error('Error fetching recruiter actions:', err);
    res.status(500).json({ error: err.message });
  }
});


// Send custom email (NEW ENDPOINT)
// Send custom email (NEW ENDPOINT)
app.post('/api/send-custom-email', async (req, res) => {
  try {
    const { to, subject, body, applicantName } = req.body;

    console.log('📧 Sending custom email to:', to);

    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #0a0a0a; font-size: 24px; }
            .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; line-height: 1.6; white-space: pre-wrap; }
            .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${subject}</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${applicantName}</strong>,</p>
              <p>${body}</p>
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong style="color: #FF6B35;">Gamyam Recruitment Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>For questions, contact us at hr@gamyam.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Custom email sent successfully');
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Error sending custom email:', err);
    res.status(500).json({ error: err.message });
  }
});
// Send interview invitation (to both applicant and interviewer)
app.post('/api/send-interview-invitation', async (req, res) => {
  try {
    const { 
      applicantEmail, 
      applicantName, 
      interviewerEmail, 
      interviewerName,
      jobTitle,
      scheduledDate,
      scheduledTime,
      interviewPlace,
      roundStatus,
      panelNumber,
      interviewerPhone
    } = req.body;

    console.log('📧 Sending interview invitations...');

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Email to Applicant
    const applicantSubject = `Interview Invitation - ${jobTitle} Position`;
    const applicantBody = `We are pleased to invite you for an interview for the ${jobTitle} position.

Interview Details:
📅 Date: ${formattedDate}
⏰ Time: ${scheduledTime}
📍 Venue: ${interviewPlace}
👤 Interviewer: ${interviewerName}
📱 Interviewer Contact: ${interviewerPhone || 'Will be shared'}
✉️ Interviewer Email: ${interviewerEmail}
🔢 Panel Number: ${panelNumber}
🔄 Round: ${roundStatus}

Please confirm your availability by replying to this email.

We look forward to meeting you!`;

    await transporter.sendMail({
      from: 'naghanu07@gmail.com',
      to: applicantEmail,
      subject: applicantSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #0a0a0a; font-size: 24px; }
            .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; line-height: 1.6; }
            .detail-box { background: #2a2a2a; padding: 15px; border-left: 4px solid #FF6B35; margin: 15px 0; border-radius: 8px; }
            .detail-item { margin: 8px 0; font-size: 14px; }
            .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Interview Invitation</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${applicantName}</strong>,</p>
              <p>We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position.</p>
              <div class="detail-box">
                <div class="detail-item">📅 <strong>Date:</strong> ${formattedDate}</div>
                <div class="detail-item">⏰ <strong>Time:</strong> ${scheduledTime}</div>
                <div class="detail-item">📍 <strong>Venue:</strong> ${interviewPlace}</div>
                <div class="detail-item">👤 <strong>Interviewer:</strong> ${interviewerName}</div>
                <div class="detail-item">📱 <strong>Contact:</strong> ${interviewerPhone || 'Will be shared'}</div>
                <div class="detail-item">✉️ <strong>Email:</strong> ${interviewerEmail}</div>
                <div class="detail-item">🔢 <strong>Panel:</strong> ${panelNumber}</div>
                <div class="detail-item">🔄 <strong>Round:</strong> ${roundStatus}</div>
              </div>
              <p>Please confirm your availability by replying to this email.</p>
              <p>We look forward to meeting you!</p>
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong style="color: #FF6B35;">Gamyam Recruitment Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>For questions, contact us at hr@gamyam.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Email to Interviewer
    if (interviewerEmail) {
      const interviewerSubject = `Interview Schedule - ${jobTitle} Position`;
      const interviewerBody = `You have been assigned to conduct an interview.

Candidate Details:
👤 Name: ${applicantName}
📧 Email: ${applicantEmail}
💼 Position: ${jobTitle}
🔄 Round: ${roundStatus}

Interview Details:
📅 Date: ${formattedDate}
⏰ Time: ${scheduledTime}
📍 Venue: ${interviewPlace}
🔢 Panel Number: ${panelNumber}

Please prepare accordingly and ensure you're available at the scheduled time.`;

      await transporter.sendMail({
        from: 'naghanu07@gmail.com',
        to: interviewerEmail,
        subject: interviewerSubject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
              .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 30px; text-align: center; }
              .header h1 { margin: 0; color: white; font-size: 24px; }
              .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; line-height: 1.6; }
              .detail-box { background: #2a2a2a; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; border-radius: 8px; }
              .detail-item { margin: 8px 0; font-size: 14px; }
              .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Interview Assignment</h1>
              </div>
              <div class="content">
                <p>Dear <strong>${interviewerName}</strong>,</p>
                <p>You have been assigned to conduct an interview.</p>
                <h3 style="color: #4CAF50;">Candidate Details:</h3>
                <div class="detail-box">
                  <div class="detail-item">👤 <strong>Name:</strong> ${applicantName}</div>
                  <div class="detail-item">📧 <strong>Email:</strong> ${applicantEmail}</div>
                  <div class="detail-item">💼 <strong>Position:</strong> ${jobTitle}</div>
                  <div class="detail-item">🔄 <strong>Round:</strong> ${roundStatus}</div>
                </div>
                <h3 style="color: #4CAF50;">Interview Details:</h3>
                <div class="detail-box">
                  <div class="detail-item">📅 <strong>Date:</strong> ${formattedDate}</div>
                  <div class="detail-item">⏰ <strong>Time:</strong> ${scheduledTime}</div>
                  <div class="detail-item">📍 <strong>Venue:</strong> ${interviewPlace}</div>
                  <div class="detail-item">🔢 <strong>Panel:</strong> ${panelNumber}</div>
                </div>
                <p>Please prepare accordingly and ensure you're available at the scheduled time.</p>
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong style="color: #4CAF50;">Gamyam HR Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>For questions, contact hr@gamyam.com</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
    }

    console.log('✅ Interview invitations sent successfully');
    res.json({ message: 'Interview invitations sent to both applicant and interviewer' });
  } catch (err) {
    console.error('❌ Error sending invitations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Promote to next round
app.post('/api/applications/:id/promote-round', async (req, res) => {
  try {
    const { nextRound, message } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const recruiterAction = await RecruiterAction.findOne({ 
      applicationId: req.params.id 
    });

    if (recruiterAction) {
      recruiterAction.roundStatus = nextRound;
      // Clear schedule for next round
      recruiterAction.scheduledDate = '';
      recruiterAction.scheduledTime = '';
      recruiterAction.interviewPlace = '';
      recruiterAction.interviewerName = '';
      recruiterAction.interviewerEmail = '';
      recruiterAction.interviewerPhone = '';
      recruiterAction.panelNumber = '';
      await recruiterAction.save();
    }

    // Send email to applicant
    const subject = `Congratulations! You've been selected for ${nextRound}`;
    const body = message || `We are pleased to inform you that you have successfully cleared the previous round and have been selected for ${nextRound}.

Our HR team will contact you shortly with the interview schedule.

Best regards,
Gamyam Recruitment Team`;

    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: application.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: white; font-size: 24px; }
            .content { padding: 30px; background: #1a1a1a; color: #e0e0e0; line-height: 1.6; white-space: pre-wrap; }
            .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Congratulations!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${application.name}</strong>,</p>
              <p>${body}</p>
            </div>
            <div class="footer">
              <p>For questions, contact us at hr@gamyam.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Candidate promoted to next round successfully' });
  } catch (err) {
    console.error('Error promoting candidate:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update application status (on-hold, reconsidered, etc.)
app.post('/api/applications/:id/update-status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await syncToGoogleSheets(application._id.toString(), {
      name: application.name,
      email: application.email,
      phone: application.phone,
      position: application.jobTitle,
      skills: application.skillset,
      status: status
    });

    res.json({ message: 'Application status updated', application });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 UNIFIED SERVER running on http://localhost:${PORT}`);
  console.log(`📊 Database: careersportal`);
  console.log(`📧 Email: ENABLED`);
  console.log(`📄 PDF Upload: ENABLED`);
  console.log(`📊 Google Sheets: ${GOOGLE_SHEETS_CONFIG.spreadsheetId !== 'YOUR_SPREADSHEET_ID_HERE' ? 'ENABLED' : 'DISABLED (Configure credentials)'}\n`);
});