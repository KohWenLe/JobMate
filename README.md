# JobMate - AI-Powered Job Application Assistant

A web application that streamlines the job application process by generating personalized cover letters and emails using AI, parsing resumes, and managing application history.

## Key Features

- **AI-Generated Content**: Create professional and enthusiastic cover letters and emails using OpenAI GPT-4o-mini
- **Resume Parsing**: Extract information from PDF resumes automatically
- **Profile Management**: Save and load multiple user profiles for different job applications
- **Application Dashboard**: Track your job application history and generated documents
- **Document Export**: Download generated content as Word documents (.docx format)

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **AI Integration**: OpenAI GPT-4o-mini API
- **Document Processing**: PDF parsing and Word document generation

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API Key
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KohWenLe/jobmate.git
   cd jobmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Usage Guide

1. **Upload Resume**: Start by uploading your PDF resume to automatically populate your profile
2. **Create Profile**: Fill in your personal information, skills, and experience
3. **Generate Content**: 
   - Select the type of document (cover letter or email)
   - Enter job details and company information
   - Generate personalized content using AI
4. **Manage Applications**: View your application history in the dashboard
5. **Export Documents**: Download generated documents as Word files


## API Endpoints

- `POST /api/parse-resume` - Parse uploaded PDF resume
- `POST /api/generate-content` - Generate cover letter/email using AI
- `GET /api/profiles` - Get user profiles
- `POST /api/profiles` - Create new profile
- `GET /api/applications` - Get application history
- `POST /api/export` - Export document as Word file

## Development

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Schema

The application uses SQLite with the following main tables:
- `users` - User account information
- `profiles` - User professional profiles
- `applications` - Job application history
- `documents` - Generated content metadata

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License
