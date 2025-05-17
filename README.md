# AI Cover Letter Generator

An AI-powered web application that generates professional cover letters using OpenAI's GPT model.

## Features

- Generate customized cover letters based on job title, company, experience, and skills
- Clean and intuitive user interface
- Real-time cover letter generation
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run client
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Fill in the form with:
   - Job Title
   - Company Name
   - Your CV
   - Inventivity
   - Humor

2. Click "Generate Cover Letter"
3. Wait for the AI to generate your personalized cover letter
4. Review and copy the generated cover letter

## Technologies Used

- Frontend: React.js
- Backend: Node.js, Express
- AI: OpenAI GPT-3.5
- Styling: CSS 
