require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Generate cover letter endpoint
app.post('/api/generate', upload.single('cv'), async (req, res) => {
  console.log('Received request:', {
    body: req.body,
    file: req.file ? 'File received' : 'No file'
  });

  try {
    const { jobTitle, company, inventiveness, humor } = req.body;
    let cvContent = '';

    if (req.file) {
      try {
        cvContent = await extractTextFromPDF(req.file.path);
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error processing CV:', error);
      }
    }

    if (!jobTitle || !company) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          jobTitle: !jobTitle,
          company: !company
        }
      });
    }

    console.log('Generating cover letter for:', { jobTitle, company });

    // Convert inventiveness and humor to temperature and presence_penalty
    const temperature = 0.3 + (parseInt(inventiveness) / 100) * 0.7; // Range from 0.3 to 1.0
    const presence_penalty = (parseInt(humor) / 100) * 0.5; // Range from 0 to 0.5

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}. 
    ${cvContent ? `Here is the candidate's CV content for context: ${cvContent}` : ''}
    
    Style guidelines:
    - Inventiveness level: ${inventiveness}% (${inventiveness < 30 ? 'Keep it traditional and straightforward' : 
      inventiveness < 70 ? 'Add some creative elements while maintaining professionalism' : 
      'Feel free to be innovative and unique'})
    - Humor level: ${humor}% (${humor < 30 ? 'Keep it strictly professional' : 
      humor < 70 ? 'Add subtle wit where appropriate' : 
      'Can include light humor and playful elements'})
    
    Important instructions:
    1. DO NOT use placeholder text like [Your Name], [Address], etc.
    2. DO NOT include contact information or addresses
    3. Start directly with "Dear Hiring Manager"
    4. Focus on the candidate's actual experience from their CV
    5. Make specific references to the company and position
    6. Keep the tone professional but engaging
    7. End with "Best regards" followed by a blank line
    8. The letter should be concise and impactful, typically 3-4 paragraphs
    9. If no CV is provided, focus on transferable skills and enthusiasm for the role
    10. Avoid generic statements and clichés`;

    console.log('Sending request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer. Write clear, concise, and impactful cover letters that highlight the candidate's relevant experience and skills. Never use placeholder text or include contact information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: temperature,
      presence_penalty: presence_penalty,
      max_tokens: 1000
    });

    console.log('OpenAI Response received');

    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    res.json({ coverLetter: response.choices[0].message.content });
  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to generate cover letter',
      details: error.message,
      type: error.type
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');
  console.log('CORS enabled for http://localhost:3000');
}); 