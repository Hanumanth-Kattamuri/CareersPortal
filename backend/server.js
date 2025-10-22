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
  
  // Initialize HR Admin (NEW LINE)
  await initializeHRAdmin();
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

    // Inside initGoogleSheet function
// REPLACE the headers array with:
const headers = [
  'Application ID',
  'View Details',  // NEW COLUMN - clickable link
  'Candidate Name',
  'Email',
  'Phone',
  'Position',
  'Resume Link',
  'Status',
  'Current Round',
  
  // Round 1
  'R1 Panel', 'R1 Interviewer', 'R1 Email', 'R1 Phone', 'R1 Date', 'R1 Place', 'R1 Scheduled By', 'R1 Feedback',
  
  // Round 2
  'R2 Panel', 'R2 Interviewer', 'R2 Email', 'R2 Phone', 'R2 Date', 'R2 Place', 'R2 Scheduled By', 'R2 Feedback',
  
  // Round 3
  'R3 Panel', 'R3 Interviewer', 'R3 Email', 'R3 Phone', 'R3 Date', 'R3 Place', 'R3 Scheduled By', 'R3 Feedback',
  
  // Final Round
  'FR Panel', 'FR Interviewer', 'FR Email', 'FR Phone', 'FR Date', 'FR Place', 'FR Scheduled By', 'FR Feedback'
];

    // If no sheet exists, create it
    if (!sheet) {
      console.log('🧾 Creating new sheet...');
      sheet = await doc.addSheet({ title: 'Applications' });
    }

    // Load cells to check if headers exist
    await sheet.loadCells('A1:A01');
    
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
  currentRound: { type: String, default: 'Round 1' },
  
  // Round 1 details
  round1: {
    feedback: { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    interviewerName: { type: String, default: '' },
    interviewerEmail: { type: String, default: '' },
    interviewerPhone: { type: String, default: '' },
    panelNumber: { type: String, default: '' },
    scheduledBy: { type: String, default: '' },
    interviewPlace: { type: String, default: '' },
    recruiterCompleted: { type: Boolean, default: false }, // ADD THIS
  },
  
  // Round 2 details
  round2: {
    feedback: { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    interviewerName: { type: String, default: '' },
    interviewerEmail: { type: String, default: '' },
    interviewerPhone: { type: String, default: '' },
    panelNumber: { type: String, default: '' },
    scheduledBy: { type: String, default: '' },
    interviewPlace: { type: String, default: '' },
    recruiterCompleted: { type: Boolean, default: false }, // ADD THIS
  },
  
  // Round 3 details
  round3: {
    feedback: { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    interviewerName: { type: String, default: '' },
    interviewerEmail: { type: String, default: '' },
    interviewerPhone: { type: String, default: '' },
    panelNumber: { type: String, default: '' },
    scheduledBy: { type: String, default: '' },
    interviewPlace: { type: String, default: '' },
    recruiterCompleted: { type: Boolean, default: false }, // ADD THIS
  },
  
  // Final Round details
  finalRound: {
    feedback: { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    interviewerName: { type: String, default: '' },
    interviewerEmail: { type: String, default: '' },
    interviewerPhone: { type: String, default: '' },
    panelNumber: { type: String, default: '' },
    scheduledBy: { type: String, default: '' },
    interviewPlace: { type: String, default: '' },
    recruiterCompleted: { type: Boolean, default: false }, // ADD THIS
  },
  
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
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date } // ADD THIS LINE
});




const Application = mongoose.model('Application', applicationSchema);


// ==================== USER SCHEMAS ====================

// HR Admin Schema (hardcoded credentials)
const hrAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'hr' },
  name: { type: String, required: true }
});

const HRAdmin = mongoose.model('HRAdmin', hrAdminSchema);

// Recruiter Schema (for interviewers who create accounts)
const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: 'recruiter' },
  createdAt: { type: Date, default: Date.now }
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);

// Initialize HR Admin on server startup (if not exists)
async function initializeHRAdmin() {
  try {
    const existingHR = await HRAdmin.findOne({ email: 'hr@gamyam.com' });
    if (!existingHR) {
      const hrAdmin = new HRAdmin({
        email: 'hr@gamyam.com',
        password: 'hr123456', // In production, use bcrypt to hash this
        name: 'HR Admin',
        role: 'hr'
      });
      await hrAdmin.save();
      console.log('✅ HR Admin initialized');
    }
  } catch (err) {
    console.error('❌ Error initializing HR Admin:', err);
  }
}

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

// ==================== SCREENING QUESTIONS SCHEMA ====================
const screeningAnswerSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  jobTitle: { type: String, required: true },
  answers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  submittedAt: { type: Date, default: Date.now }
});

const ScreeningAnswer = mongoose.model('ScreeningAnswer', screeningAnswerSchema);
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

// Debounce helper to prevent duplicate syncs
const syncDebounce = new Map();

async function debouncedSync(applicationId, data, delay = 1000) {
  // Clear existing timeout for this application
  if (syncDebounce.has(applicationId)) {
    clearTimeout(syncDebounce.get(applicationId));
  }
  
  // Set new timeout
  const timeoutId = setTimeout(async () => {
    await syncToGoogleSheets(applicationId, data);
    syncDebounce.delete(applicationId);
  }, delay);
  
  syncDebounce.set(applicationId, timeoutId);
}

// ==================== GOOGLE SHEETS SYNC ====================

// SIMPLIFIED SYNC - Displays current round details in SAME columns
// FIXED SYNC - Matches your actual column names
// DIRECT CELL UPDATE - Bypasses row.set() issues
async function syncToGoogleSheets(applicationId, data) {
  if (!googleSheet) {
    console.log('⚠️ Google Sheets not available');
    return;
  }

  console.log('📊 ===== SYNCING TO GOOGLE SHEETS =====');
  console.log('📊 Application ID:', applicationId);
  console.log('📊 Current Round:', data.currentRound);

  try {
    await googleSheet.loadHeaderRow();
    const rows = await googleSheet.getRows();
    let existingRow = rows.find(row => row.get('Application ID') === applicationId);

    // If no row exists, create one
    if (!existingRow) {
      console.log('📝 Creating new row for:', applicationId);

      const roundMap = {
        'Round 1': 'round1',
        'Round 2': 'round2',
        'Round 3': 'round3',
        'Final Round': 'finalRound'
      };

      const currentRoundField = roundMap[data.currentRound];
      const currentRoundData = data[currentRoundField] || {};

      let interviewDateFormatted = '';
      if (currentRoundData.scheduledDate) {
        const dateObj = new Date(currentRoundData.scheduledDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN');
        const time = currentRoundData.scheduledTime || '';
        interviewDateFormatted = `${formattedDate} ${time}`.trim();
      }

      const newRow = {
        'Application ID': applicationId,
        'Candidate Name': data.name || '',
        'Email': data.email || '',
        'Phone': data.phone || '',
        'Position': data.position || '',
        'Resume Link': data.resumeLink || `=HYPERLINK("http://localhost:5000/api/applications/${applicationId}/resume", "View Resume")`,
        'Status': data.status || 'pending',
        'Panel Number': currentRoundData.panelNumber || '',
        'Interviewer Name': currentRoundData.interviewerName || '',
        'Interviewer Email': currentRoundData.interviewerEmail || '',
        'Interviewer Phone': currentRoundData.interviewerPhone || '',
        'Round': data.currentRound || 'Round 1',
        'Feedback': currentRoundData.feedback || '',
        'Scheduled By': currentRoundData.scheduledBy || '',
        'Place': currentRoundData.interviewPlace || '',
        'Interview Date Scheduled': interviewDateFormatted
      };

      await googleSheet.addRow(newRow);
      console.log('✅ ===== NEW ROW ADDED TO GOOGLE SHEETS =====');
      return;
    }

    // ✅ UPDATE EXISTING ROW USING row.set() METHOD
    const rowIndex = rows.findIndex(r => r.get('Application ID') === applicationId);
    if (rowIndex === -1) {
      console.error(`❌ Row not found for Application ID: ${applicationId}`);
      return;
    }

    console.log('📝 Updating row index:', rowIndex + 2); // +2 for spreadsheet row number

    // Get current round data
    const roundMap = {
      'Round 1': 'round1',
      'Round 2': 'round2',
      'Round 3': 'round3',
      'Final Round': 'finalRound'
    };

    const currentRoundField = roundMap[data.currentRound];
    const currentRoundData = data[currentRoundField];

    if (currentRoundData) {
      console.log('📊 Updating with Round Data:', currentRoundData);

      let interviewDateFormatted = '';
      if (currentRoundData.scheduledDate && currentRoundData.scheduledTime) {
        const dateObj = new Date(currentRoundData.scheduledDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN');
        interviewDateFormatted = `${formattedDate} ${currentRoundData.scheduledTime}`;
      }

      // Use row.set() method - More reliable than cell-by-cell updates
      const rowToUpdate = existingRow;
      
      // Track changes
      const updates = {};
      
      if (data.name && rowToUpdate.get('Candidate Name') !== data.name) {
        updates['Candidate Name'] = data.name;
      }
      if (data.email && rowToUpdate.get('Email') !== data.email) {
        updates['Email'] = data.email;
      }
      if (data.phone && rowToUpdate.get('Phone') !== data.phone) {
        updates['Phone'] = data.phone;
      }
      if (data.position && rowToUpdate.get('Position') !== data.position) {
        updates['Position'] = data.position;
      }
      if (data.resumeLink && rowToUpdate.get('Resume Link') !== data.resumeLink) {
        updates['Resume Link'] = data.resumeLink;
      }
      if (data.status && rowToUpdate.get('Status') !== data.status) {
        updates['Status'] = data.status;
      }
      if (currentRoundData.panelNumber !== undefined && rowToUpdate.get('Panel Number') !== currentRoundData.panelNumber) {
        updates['Panel Number'] = currentRoundData.panelNumber || '';
      }
      if (currentRoundData.interviewerName !== undefined && rowToUpdate.get('Interviewer Name') !== currentRoundData.interviewerName) {
        updates['Interviewer Name'] = currentRoundData.interviewerName || '';
      }
      if (currentRoundData.interviewerEmail !== undefined && rowToUpdate.get('Interviewer Email') !== currentRoundData.interviewerEmail) {
        updates['Interviewer Email'] = currentRoundData.interviewerEmail || '';
      }
      if (currentRoundData.interviewerPhone !== undefined && rowToUpdate.get('Interviewer Phone') !== currentRoundData.interviewerPhone) {
        updates['Interviewer Phone'] = currentRoundData.interviewerPhone || '';
      }
      if (data.currentRound && rowToUpdate.get('Round') !== data.currentRound) {
        updates['Round'] = data.currentRound;
      }
      if (currentRoundData.feedback !== undefined && rowToUpdate.get('Feedback') !== currentRoundData.feedback) {
        updates['Feedback'] = currentRoundData.feedback || '';
      }
      if (currentRoundData.scheduledBy !== undefined && rowToUpdate.get('Scheduled By') !== currentRoundData.scheduledBy) {
        updates['Scheduled By'] = currentRoundData.scheduledBy || '';
      }
      if (currentRoundData.interviewPlace !== undefined && rowToUpdate.get('Place') !== currentRoundData.interviewPlace) {
        updates['Place'] = currentRoundData.interviewPlace || '';
      }
      if (interviewDateFormatted && rowToUpdate.get('Interview Date Scheduled') !== interviewDateFormatted) {
        updates['Interview Date Scheduled'] = interviewDateFormatted;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log(`📝 Updating ${Object.keys(updates).length} fields:`, Object.keys(updates));
        
        // Apply all updates
        for (let [key, value] of Object.entries(updates)) {
          rowToUpdate.set(key, value);
          console.log(`  ✏️ ${key}: "${rowToUpdate.get(key)}" -> "${value}"`);
        }
        
        await rowToUpdate.save();
        console.log('✅ ===== SUCCESSFULLY UPDATED GOOGLE SHEETS =====');
      } else {
        console.log('ℹ️ No changes detected - skipping save');
      }
    } else {
      console.warn(`⚠️ No round data found for ${data.currentRound}`);
    }

  } catch (error) {
    console.error('❌ ===== GOOGLE SHEETS SYNC ERROR =====');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error:', error);
    console.error('❌ Application ID:', applicationId);
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
    // Inside app.post('/api/applications', ...)
// REPLACE the syncToGoogleSheets call with:
await syncToGoogleSheets(application._id.toString(), {
  name: application.name,
  email: application.email,
  phone: application.phone,
  position: application.jobTitle,
  resumeLink: `=HYPERLINK("http://localhost:5000/api/applications/${application._id}/resume", "View Resume")`, // Fixed: was sending skillset
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
// REPLACE the existing app.post('/api/recruiter-actions/:applicationId') endpoint with:
// REPLACE this entire endpoint:
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
      rejectionRound,
      syncToSheets, // Only sync if true (HR saves)
      isRecruiterFeedback, // NEW: Track if feedback is from recruiter
      recruiterCompleted // NEW: Mark as completed by recruiter
    } = req.body;

    console.log('💾 Saving recruiter actions for:', applicationId, 'Round:', roundStatus);
    console.log('📊 Sync to Sheets:', syncToSheets ? 'YES (HR)' : 'NO (Recruiter)');
    console.log('✅ Recruiter Completed:', recruiterCompleted || false);

    // Map round names to schema fields
    const roundMap = {
      'Round 1': 'round1',
      'Round 2': 'round2',
      'Round 3': 'round3',
      'Final Round': 'finalRound'
    };
    
    const roundField = roundMap[roundStatus];
    
    let recruiterAction = await RecruiterAction.findOne({ applicationId });
    
    if (recruiterAction) {
      // Update current round
      recruiterAction.currentRound = roundStatus;
      
      // Update specific round details
      if (roundField) {
        if (feedback && feedback.trim()) {
          recruiterAction[roundField].feedback = feedback.trim();
        }
        if (scheduledDate) recruiterAction[roundField].scheduledDate = scheduledDate;
        if (scheduledTime) recruiterAction[roundField].scheduledTime = scheduledTime;
        if (interviewerName) recruiterAction[roundField].interviewerName = interviewerName;
        if (interviewerEmail) recruiterAction[roundField].interviewerEmail = interviewerEmail;
        if (interviewerPhone) recruiterAction[roundField].interviewerPhone = interviewerPhone;
        if (panelNumber) recruiterAction[roundField].panelNumber = panelNumber;
        if (scheduledBy) recruiterAction[roundField].scheduledBy = scheduledBy;
        if (interviewPlace) recruiterAction[roundField].interviewPlace = interviewPlace;
        
        // NEW: Mark as completed by recruiter
        if (recruiterCompleted !== undefined) {
          recruiterAction[roundField].recruiterCompleted = recruiterCompleted;
        }
      }
      
      recruiterAction.isRejected = isRejected || false;
      recruiterAction.rejectionRound = rejectionRound || '';
      recruiterAction.updatedAt = new Date();
      await recruiterAction.save();
      console.log('✅ Updated recruiter action');
    } else {
      // Create new with initial round data
      const newAction = {
        applicationId,
        currentRound: roundStatus,
        isRejected: isRejected || false,
        rejectionRound: rejectionRound || ''
      };
      
      newAction[roundField] = {
        feedback: feedback?.trim() || '',
        scheduledDate: scheduledDate || '',
        scheduledTime: scheduledTime || '',
        interviewerName: interviewerName || '',
        interviewerEmail: interviewerEmail || '',
        interviewerPhone: interviewerPhone || '',
        panelNumber: panelNumber || '',
        scheduledBy: scheduledBy || '',
        interviewPlace: interviewPlace || '',
        recruiterCompleted: recruiterCompleted || false // NEW
      };
      
      recruiterAction = new RecruiterAction(newAction);
      await recruiterAction.save();
      console.log('✅ Created new recruiter action');
    }

    // CONDITIONAL SYNC: Only sync to Google Sheets if HR is saving
    if (syncToSheets === true) {
      console.log('📊 Syncing to Google Sheets (HR action)...');
      const application = await Application.findById(applicationId);
      if (application) {
        await debouncedSync(applicationId, {
          name: application.name,
          email: application.email,
          phone: application.phone,
          position: application.jobTitle,
          resumeLink: `=HYPERLINK("http://localhost:5000/api/applications/${application._id}/resume", "View Resume")`,
          status: application.status,
          currentRound: recruiterAction.currentRound,
          round1: recruiterAction.round1,
          round2: recruiterAction.round2,
          round3: recruiterAction.round3,
          finalRound: recruiterAction.finalRound
        });
      }
    } else {
      console.log('ℹ️ Skipping Google Sheets sync (Recruiter action - saved to MongoDB only)');
    }

    res.json({ message: 'Recruiter actions saved successfully', recruiterAction });
  } catch (err) {
    console.error('❌ Error saving recruiter actions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get recruiter actions for an application
app.get('/api/recruiter-actions/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const recruiterAction = await RecruiterAction.findOne({ applicationId });
    
    if (!recruiterAction) {
      return res.status(404).json({ message: 'No recruiter actions found' });
    }
    
    res.json(recruiterAction);
  } catch (err) {
    console.error('Error fetching recruiter actions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all rounds data for an application
app.get('/api/recruiter-actions/:applicationId/all-rounds', async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const recruiterAction = await RecruiterAction.findOne({ applicationId });
    
    if (!recruiterAction) {
      return res.json([]);
    }

    // Parse feedback by rounds
    const feedbackLines = recruiterAction.feedback.split('\n').filter(line => line.trim());
    const roundsData = [];

    ['Round 1', 'Round 2', 'Round 3', 'Final Round'].forEach(round => {
      const roundFeedback = feedbackLines.find(line => line.startsWith(`${round}:`));
      if (roundFeedback || recruiterAction.roundStatus === round) {
        roundsData.push({
          round: round,
          feedback: roundFeedback ? roundFeedback.replace(`${round}:`, '').trim() : '',
          scheduledDate: recruiterAction.roundStatus === round ? recruiterAction.scheduledDate : '',
          scheduledTime: recruiterAction.roundStatus === round ? recruiterAction.scheduledTime : '',
          interviewerName: recruiterAction.roundStatus === round ? recruiterAction.interviewerName : '',
          interviewerEmail: recruiterAction.roundStatus === round ? recruiterAction.interviewerEmail : '',
          interviewerPhone: recruiterAction.roundStatus === round ? recruiterAction.interviewerPhone : '',
          panelNumber: recruiterAction.roundStatus === round ? recruiterAction.panelNumber : '',
          scheduledBy: recruiterAction.roundStatus === round ? recruiterAction.scheduledBy : '',
          place: recruiterAction.roundStatus === round ? recruiterAction.interviewPlace : ''
        });
      }
    });

    res.json(roundsData);
  } catch (err) {
    console.error('Error fetching all rounds:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this NEW endpoint after the existing /api/recruiter-actions/:applicationId/all-rounds
app.get('/api/recruiter-actions/:applicationId/round/:roundName', async (req, res) => {
  try {
    const { applicationId, roundName } = req.params;
    const recruiterAction = await RecruiterAction.findOne({ applicationId });
    
    if (!recruiterAction) {
      return res.json({
        round: roundName,
        feedback: '',
        scheduledDate: '',
        scheduledTime: '',
        interviewerName: '',
        interviewerEmail: '',
        interviewerPhone: '',
        panelNumber: '',
        scheduledBy: '',
        place: ''
      });
    }

    // Parse feedback for specific round
    const feedbackLines = recruiterAction.feedback.split('\n').filter(line => line.trim());
    const roundFeedback = feedbackLines.find(line => line.startsWith(`${roundName}:`));
    
    // If this is the current round, return current details
    if (recruiterAction.roundStatus === roundName) {
      return res.json({
        round: roundName,
        feedback: roundFeedback ? roundFeedback.replace(`${roundName}:`, '').trim() : '',
        scheduledDate: recruiterAction.scheduledDate,
        scheduledTime: recruiterAction.scheduledTime,
        interviewerName: recruiterAction.interviewerName,
        interviewerEmail: recruiterAction.interviewerEmail,
        interviewerPhone: recruiterAction.interviewerPhone,
        panelNumber: recruiterAction.panelNumber,
        scheduledBy: recruiterAction.scheduledBy,
        place: recruiterAction.interviewPlace
      });
    }
    
    // For past rounds, return only feedback
    return res.json({
      round: roundName,
      feedback: roundFeedback ? roundFeedback.replace(`${roundName}:`, '').trim() : '',
      scheduledDate: '',
      scheduledTime: '',
      interviewerName: '',
      interviewerEmail: '',
      interviewerPhone: '',
      panelNumber: '',
      scheduledBy: '',
      place: ''
    });
  } catch (err) {
    console.error('Error fetching round data:', err);
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
// Send interview invitation (to applicant and multiple interviewers)
app.post('/api/send-interview-invitation', async (req, res) => {
  try {
    const { 
      applicantEmail, 
      applicantName, 
      interviewers, // NOW AN ARRAY OF OBJECTS
      jobTitle,
      scheduledDate,
      scheduledTime,
      interviewPlace,
      roundStatus,
      panelNumber
    } = req.body;

    console.log(`📧 Sending interview invitations to applicant + ${interviewers.length} interviewer(s)...`);

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Email to Applicant
    const applicantSubject = `Interview Invitation - ${jobTitle} Position`;

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
            .interviewer-list { margin-left: 20px; }
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
                <div class="detail-item">👥 <strong>Interviewer(s):</strong></div>
                <div class="interviewer-list">
                  ${interviewers.map(i => `<div style="margin: 5px 0;">• ${i.name} (${i.email}${i.phone ? ', ' + i.phone : ''})</div>`).join('')}
                </div>
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

    // Email to EACH Interviewer
    for (const interviewer of interviewers) {
      const interviewerSubject = `Interview Schedule - ${jobTitle} Position`;
      
      await transporter.sendMail({
        from: 'naghanu07@gmail.com',
        to: interviewer.email,
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
                <p>Dear <strong>${interviewer.name}</strong>,</p>
                <p>You have been assigned to conduct an interview${interviewers.length > 1 ? ' along with other panel members' : ''}.</p>
                ${interviewers.length > 1 ? `
                <h3 style="color: #4CAF50;">Panel Members:</h3>
                <div class="detail-box">
                  ${interviewers.map(i => `<div style="margin: 5px 0;">• ${i.name} (${i.email})</div>`).join('')}
                </div>
                ` : ''}
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

    console.log(`✅ Interview invitations sent to applicant + ${interviewers.length} interviewer(s)`);
    res.json({ message: `Interview invitations sent to applicant and ${interviewers.length} interviewer(s)` });
  } catch (err) {
    console.error('❌ Error sending invitations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Promote to next round
// Promote to next round - FIXED VERSION
app.post('/api/applications/:id/promote-round', async (req, res) => {
  try {
    const { nextRound, message } = req.body;
    
    // 1. Fetch application first
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // 2. Fetch recruiterAction (or create if doesn't exist)
    let recruiterAction = await RecruiterAction.findOne({ 
      applicationId: req.params.id 
    });

    // 3. Update or create recruiterAction with new round
    if (recruiterAction) {
      recruiterAction.currentRound = nextRound;
      await recruiterAction.save();
    } else {
      // If no recruiterAction exists, create one
      recruiterAction = new RecruiterAction({
        applicationId: req.params.id,
        currentRound: nextRound
      });
      await recruiterAction.save();
    }
    
    // 4. NOW sync to Google Sheets (after recruiterAction is loaded)
    await syncToGoogleSheets(req.params.id, {
      name: application.name,
      email: application.email,
      phone: application.phone,
      position: application.jobTitle,
      resumeLink: `=HYPERLINK("http://localhost:5000/api/applications/${application._id}/resume", "View Resume")`,
      status: application.status,
      currentRound: nextRound,  // Use the nextRound value
      round1: recruiterAction.round1,
      round2: recruiterAction.round2,
      round3: recruiterAction.round3,
      finalRound: recruiterAction.finalRound
    });

    // 5. Send email to applicant
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

    res.json({ 
      message: 'Candidate promoted to next round successfully', 
      nextRound,
      recruiterAction 
    });
    
  } catch (err) {
    console.error('Error promoting candidate:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send selection email to final round candidates
// REPLACE the existing /api/send-selection-email endpoint with this:
app.post('/api/send-selection-email', async (req, res) => {
  try {
    const { to, applicantName, jobTitle, applicationId } = req.body;

    console.log('📧 Sending selection email to:', to);

    const mailOptions = {
      from: 'naghanu07@gmail.com',
      to: to,
      subject: `🎉 Congratulations! You've been selected for ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; color: white; font-size: 32px; }
            .content { padding: 40px 30px; background: #1a1a1a; color: #e0e0e0; line-height: 1.8; }
            .highlight-box { background: rgba(76, 175, 80, 0.2); padding: 25px; border-left: 4px solid #4CAF50; margin: 25px 0; border-radius: 8px; }
            .footer { background: #0a0a0a; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
            .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>
            
            <div class="content">
              <p>Dear <strong>${applicantName}</strong>,</p>
              
              <div class="highlight-box">
                <h2 style="margin-top: 0; color: #4CAF50; font-size: 24px;">You've Been Selected!</h2>
                <p style="font-size: 18px; margin: 15px 0 0 0;">
                  We are thrilled to offer you the position of <strong>${jobTitle}</strong> at Gamyam!
                </p>
              </div>
              
              <p>After careful consideration of all candidates, we are delighted to inform you that you have successfully completed all interview rounds and have been selected to join our team.</p>
              
              <p><strong>What's Next?</strong></p>
              <ul style="line-height: 2;">
                <li>Our HR team will contact you within 24-48 hours with the official offer letter</li>
                <li>We will discuss compensation, joining date, and other formalities</li>
                <li>Please keep your documents ready for verification</li>
              </ul>
              
              <p style="margin-top: 30px;">We are excited to have you on board and look forward to working with you!</p>
              
              <p style="margin-top: 40px;">
                Warm regards,<br>
                <strong style="color: #4CAF50; font-size: 16px;">Gamyam Recruitment Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>For any questions, please contact us at hr@gamyam.com</p>
              <p>© 2025 Gamyam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    // UPDATE APPLICATION STATUS TO 'selected'
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'selected' });
      
      // Sync to Google Sheets
      const application = await Application.findById(applicationId);
      if (application) {
        await syncToGoogleSheets(applicationId, {
          name: application.name,
          email: application.email,
          phone: application.phone,
          position: application.jobTitle,
          resumeLink: `=HYPERLINK("http://localhost:5000/api/applications/${application._id}/resume", "View Resume")`,
          status: 'selected'
        });
      }
    }
    
    console.log('✅ Selection email sent successfully and status updated to selected');
    res.json({ message: 'Selection email sent successfully' });
  } catch (err) {
    console.error('❌ Error sending selection email:', err);
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

// ==================== AUTHENTICATION ROUTES ====================

// HR Login
app.post('/api/auth/hr-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const hrAdmin = await HRAdmin.findOne({ email, password });
    
    if (!hrAdmin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      user: {
        id: hrAdmin._id,
        email: hrAdmin.email,
        name: hrAdmin.name,
        role: 'hr'
      }
    });
  } catch (err) {
    console.error('HR login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Recruiter Registration
app.post('/api/auth/recruiter-register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const recruiter = new Recruiter({
      name,
      email,
      password, // In production, use bcrypt to hash
      phone
    });
    
    await recruiter.save();
    
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: recruiter._id,
        email: recruiter.email,
        name: recruiter.name,
        role: 'recruiter'
      }
    });
  } catch (err) {
    console.error('Recruiter registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Recruiter Login
app.post('/api/auth/recruiter-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const recruiter = await Recruiter.findOne({ email, password });
    
    if (!recruiter) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      user: {
        id: recruiter._id,
        email: recruiter.email,
        name: recruiter.name,
        role: 'recruiter'
      }
    });
  } catch (err) {
    console.error('Recruiter login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get recruiter's assigned applications
// Get recruiter's assigned applications (FIXED - checks for multiple interviewers)
app.get('/api/recruiter/:recruiterId/applications', async (req, res) => {
  try {
    const { recruiterId } = req.params;
    
    console.log('🔍 Fetching applications for recruiter:', recruiterId);
    
    // Get recruiter details
    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    console.log('👤 Recruiter email:', recruiter.email);
    
    // Find all recruiter actions where this recruiter is assigned to CURRENT round
    const allRecruiterActions = await RecruiterAction.find();
    
    console.log(`📊 Total recruiter actions found: ${allRecruiterActions.length}`);
    
    // FIXED FILTER: Check if recruiter's email is in the comma-separated list for CURRENT round
    const filteredActions = allRecruiterActions.filter(ra => {
      const roundMap = {
        'Round 1': 'round1',
        'Round 2': 'round2',
        'Round 3': 'round3',
        'Final Round': 'finalRound'
      };
      
      const currentRoundField = roundMap[ra.currentRound];
      const currentRoundData = ra[currentRoundField];
      
      if (!currentRoundData || !currentRoundData.interviewerEmail) {
        return false;
      }
      
      // Split comma-separated emails and check if recruiter's email is in the list
      const assignedEmails = currentRoundData.interviewerEmail
        .split(',')
        .map(email => email.trim().toLowerCase());
      
      const isAssigned = assignedEmails.includes(recruiter.email.toLowerCase());
      
      if (isAssigned) {
        console.log(`✅ Found assignment: Application ${ra.applicationId}, Round: ${ra.currentRound}`);
      }
      
      return isAssigned;
    });
    
    console.log(`🎯 Filtered actions for this recruiter: ${filteredActions.length}`);
    
    // Get application IDs
    const applicationIds = filteredActions.map(ra => ra.applicationId);
    
    // Fetch full application details
    const applications = await Application.find({
      _id: { $in: applicationIds }
    }).sort({ appliedAt: -1 });
    
    console.log(`✅ Returning ${applications.length} applications to recruiter dashboard`);
    
    res.json(applications);
  } catch (err) {
    console.error('❌ Error fetching recruiter applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});


// Get all registered recruiters (for HR to assign)
app.get('/api/recruiters', async (req, res) => {
  try {
    const recruiters = await Recruiter.find().select('name email phone').sort({ name: 1 });
    res.json(recruiters);
  } catch (err) {
    console.error('Error fetching recruiters:', err);
    res.status(500).json({ error: 'Failed to fetch recruiters' });
  }
});

app.post('/api/applications/:id/mark-reviewed', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'reviewed',
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log('✅ Application marked as reviewed:', application._id);
    res.json({ message: 'Application marked as reviewed', application });
  } catch (err) {
    console.error('Error marking application as reviewed:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCREENING QUESTIONS ROUTES ====================

// Submit screening answers
app.post('/api/screening-answers', async (req, res) => {
  try {
    const { applicationId, applicantName, applicantEmail, jobTitle, answers } = req.body;
    
    console.log('📝 Saving screening answers for application:', applicationId);
    
    const screeningAnswer = new ScreeningAnswer({
      applicationId,
      applicantName,
      applicantEmail,
      jobTitle,
      answers
    });
    
    await screeningAnswer.save();
    console.log('✅ Screening answers saved successfully');
    
    res.status(201).json({ 
      message: 'Screening answers submitted successfully',
      screeningAnswer 
    });
  } catch (err) {
    console.error('❌ Error saving screening answers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get screening answers for a specific application
app.get('/api/screening-answers/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('\n🔍 ===== FETCHING SCREENING ANSWERS =====');
    console.log('📋 Requested Application ID:', applicationId);
    
    const screeningAnswer = await ScreeningAnswer.findOne({ applicationId });
    
    if (!screeningAnswer) {
      console.log('❌ No screening answers found');
      
      // ✅ DEBUG: Show what IDs exist in the database
      const allAnswers = await ScreeningAnswer.find().limit(5);
      console.log('📊 Sample application IDs with answers:');
      allAnswers.forEach(a => console.log(`   - ${a.applicationId}`));
      console.log('=======================================\n');
      
      return res.status(404).json({ message: 'No screening answers found' });
    }
    
    console.log('✅ Found screening answers!');
    console.log('📊 Questions answered:', screeningAnswer.answers.length);
    console.log('=======================================\n');
    
    res.json(screeningAnswer);
  } catch (err) {
    console.error('❌ Error fetching screening answers:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DEBUG ENDPOINT - Check all screening answers
app.get('/api/debug/screening-answers', async (req, res) => {
  try {
    const allScreeningAnswers = await ScreeningAnswer.find().sort({ submittedAt: -1 });
    
    const summary = {
      total: allScreeningAnswers.length,
      applications: allScreeningAnswers.map(sa => ({
        applicationId: sa.applicationId,
        applicantName: sa.applicantName,
        email: sa.applicantEmail,
        questionsAnswered: sa.answers.length,
        submittedAt: sa.submittedAt
      }))
    };
    
    console.log('📊 ALL SCREENING ANSWERS:', JSON.stringify(summary, null, 2));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all screening answers (for HR/Recruiter dashboard)
app.get('/api/screening-answers', async (req, res) => {
  try {
    const answers = await ScreeningAnswer.find().sort({ submittedAt: -1 });
    res.json(answers);
  } catch (err) {
    console.error('Error fetching all screening answers:', err);
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