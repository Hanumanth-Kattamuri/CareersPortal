const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const app = express();

// Middleware
app.use(cors());
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
mongoose.connect('mongodb://localhost:27017/careersportal')
.then(() => console.log('✅ MongoDB Connected to careersportal'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'GMail',
  auth: {
    user: 'pavankattamuri2004@gmail.com',
    pass: 'jdgtemcuftchivay'
  }
});

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
          
          <h3>Interview Tips:</h3>
          <ul>
            <li>Research about Gamyam and our work culture</li>
            <li>Prepare examples from your past projects</li>
            <li>Have a stable internet connection if it's an online interview</li>
            <li>Dress professionally</li>
            <li>Arrive 10 minutes early (or log in early for online interviews)</li>
          </ul>
          
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
          
          <p>This decision does not reflect on your abilities or qualifications. We received many exceptional applications, and the selection process was highly competitive. Your profile was reviewed thoroughly, and we appreciate the effort you put into your application.</p>
          
          <h3>Keep Learning & Growing</h3>
          <p>We encourage you to:</p>
          <ul>
            <li>Continue enhancing your skills in your area of expertise</li>
            <li>Work on projects that showcase your capabilities</li>
            <li>Build a strong professional network</li>
            <li>Consider applying for similar roles with us in the future</li>
          </ul>
          
          <p>We hope you'll stay in touch, and we wish you the very best in your career journey. Don't get discouraged—every application is a learning opportunity!</p>
          
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
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        if (/school/i.test(lines[j])) {
          education.tenth.school = lines[j].replace(/school/i, '').trim();
          break;
        }
      }
    }
    
    if (/12th|twelfth|intermediate|diploma|higher secondary|HSC/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.diploma.score = scoreMatch[0];
    }
    
    if (/bachelor|b\.tech|b\.e\.|bca|b\.sc|graduation|undergraduate/i.test(line)) {
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) education.graduation.score = scoreMatch[0];
      
      if (/computer science|CS|IT|information technology|ECE|EEE|mechanical|civil/i.test(line)) {
        const streamMatch = line.match(/(computer science|CS|IT|information technology|ECE|EEE|mechanical|civil)/i);
        if (streamMatch) education.graduation.stream = streamMatch[0];
      }
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
    console.log('🔍 Starting PDF parsing...');
    console.log('📦 Buffer size:', buffer.length, 'bytes');
    
    const data = await pdfParse(buffer);
    const text = data.text;
    
    console.log('📄 Extracted text length:', text.length);
    console.log('📝 First 200 chars:', text.substring(0, 200));
    
    const extractedData = {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      skillset: extractSkills(text),
      academic: extractEducation(text),
      project: extractProjects(text),
      location: extractLocation(text)
    };
    
    console.log('✅ Extracted Data:', JSON.stringify(extractedData, null, 2));
    return extractedData;
  } catch (error) {
    console.error('❌ Error parsing PDF:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`PDF parsing failed: ${error.message}`);
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
    console.log('📦 File size:', req.file.size, 'bytes');
    console.log('📋 MIME type:', req.file.mimetype);
    
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
    console.log(`✅ GET /api/jobs - Returning ${jobs.length} jobs`);
    res.json(jobs);
  } catch (err) {
    console.error('❌ Error fetching jobs:', err);
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
    console.log('📥 Raw body:', JSON.stringify(req.body, null, 2));
    
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
    console.log('\n========== UPDATE JOB ==========');
    console.log('📝 Job ID:', req.params.id);
    
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

    // Send confirmation email using Gamyam template
    const mailOptions = {
      from: 'pavankattamuri2004@gmail.com',
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
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const mailOptions = {
      from: 'pavankattamuri2004@gmail.com',
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

    const mailOptions = {
      from: 'pavankattamuri2004@gmail.com',
      to: application.email,
      subject: `Congratulations! You've been shortlisted - ${application.jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a;">
          <div style="background-color: #1a1a1a; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(255,107,53,0.2); border: 1px solid #FF6B35;">
            <h2 style="color: #FF6B35; margin-bottom: 20px;">Internship Program 2025</h2>
            <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">Dear ${application.name},</p>
            <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">
              Congratulations! 🎉 You have been <strong style="color: #FF6B35;">shortlisted</strong>.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #FF6B35;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br/>
                <strong style="color: #FF6B35;">HR Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Application accepted and email sent', application });
  } catch (err) {
    console.error('Error accepting application:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 UNIFIED SERVER running on http://localhost:${PORT}`);
  console.log(`📊 Database: careersportal`);
  console.log(`📧 Email: ENABLED`);
  console.log(`📄 PDF Upload: ENABLED\n`);
});