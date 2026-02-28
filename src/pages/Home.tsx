import { useState, useEffect } from 'react';
import { Upload, FileText, User, Send, Edit, RefreshCw, Save, FolderOpen, Download, Trash2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface Profile {
  id: number;
  name: string;
  type: 'upload' | 'manual';
  content: string;
  updated_at: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  
  // Profiles State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [newProfileName, setNewProfileName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  
  // Manual Profile State
  const [manualProfile, setManualProfile] = useState({
    name: '',
    contactInfo: '',
    summary: '',
    experience: '',
    projects: '',
    education: '',
    skills: '',
    others: ''
  });
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    coverLetter: string;
    emailBody: string;
  } | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/profiles');
      const data = await response.json();
      if (data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!newProfileName.trim()) {
      alert('Please enter a profile name');
      return;
    }

    const content = activeTab === 'upload' ? extractedText : manualProfile;
    
    if (activeTab === 'upload' && !extractedText) {
      alert('No resume text to save');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProfileName,
          type: activeTab,
          content: content,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile saved successfully!');
        setNewProfileName('');
        setShowSaveDialog(false);
        fetchProfiles();
      } else {
        alert('Failed to save profile: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) {
      alert('Please select a profile to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/profiles/${selectedProfileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile deleted successfully!');
        setSelectedProfileId('');
        // Reset form
        setExtractedText('');
        setManualProfile({
          name: '',
          contactInfo: '',
          summary: '',
          experience: '',
          projects: '',
          education: '',
          skills: '',
          others: ''
        });
        fetchProfiles();
      } else {
        alert('Failed to delete profile: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  const handleLoadProfile = (profileId: string) => {
    if (!profileId) {
      setSelectedProfileId('');
      return;
    }

    const profile = profiles.find(p => p.id === parseInt(profileId));
    if (profile) {
      setSelectedProfileId(profileId);
      setActiveTab(profile.type);
      
      if (profile.type === 'upload') {
        setExtractedText(profile.content);
      } else {
        try {
          const parsedContent = JSON.parse(profile.content);
          setManualProfile(parsedContent);
        } catch (e) {
          console.error('Error parsing profile content:', e);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setExtractedText(data.extractedText);
      } else {
        alert('Failed to extract text from resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription || !companyName || !position) {
      alert('Please fill in all job details');
      return;
    }

    if (activeTab === 'upload' && !extractedText) {
      alert('Please upload and process a resume first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          companyName,
          position,
          resumeText: activeTab === 'upload' ? extractedText : undefined,
          profileData: activeTab === 'manual' ? manualProfile : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedContent({
          coverLetter: data.coverLetter,
          emailBody: data.emailBody,
        });
      } else {
        alert('Failed to generate content: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApplication = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch('http://localhost:3001/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          position,
          appliedDate: new Date().toISOString(),
          jobDescription,
          generatedCoverLetter: generatedContent.coverLetter,
          generatedEmailBody: generatedContent.emailBody,
          resumeFilePath: resumeFile ? resumeFile.name : 'Manual Profile',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Application saved to dashboard!');
      } else {
        alert('Failed to save application');
      }
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application');
    }
  };

  const handleSendEmail = () => {
    if (!generatedContent) return;
    
    const subject = `Application for ${position} at ${companyName}`;
    const body = generatedContent.emailBody;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    handleSaveApplication();
  };

  const generateWordDocument = async () => {
    if (!generatedContent?.coverLetter) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: generatedContent.coverLetter.split('\n').map((line) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: "Calibri",
                  size: 24, // 12pt
                }),
              ],
              spacing: {
                after: 120, // Spacing after paragraph
              },
            })
          ),
        },
      ],
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${position.replace(/\s+/g, '_')}.docx`);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating Word document');
    }
  };

  return (
    <div className="space-y-8">
      {/* Job Input Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Job Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position Title</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Paste the full job description here..."
            />
          </div>
        </div>
      </section>

      {/* User Context Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <User className="w-4 h-4 mr-2" />
                Manual Profile
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={selectedProfileId}
                onChange={(e) => handleLoadProfile(e.target.value)}
                className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                title="Load Saved Profile"
              >
                <option value="">Select a profile...</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.type})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </button>
            {selectedProfileId && (
              <button
                onClick={handleDeleteProfile}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Delete Selected Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {showSaveDialog && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200 flex items-end space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., Software Engineer Profile"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        )}

        {activeTab === 'upload' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} title="Upload Resume PDF" />
              </label>
            </div>
            {resumeFile && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-md">
                <span className="text-sm text-blue-700 font-medium">{resumeFile.name}</span>
                <button
                  onClick={handleUploadResume}
                  disabled={isUploading || !!extractedText}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {isUploading ? 'Processing...' : extractedText ? 'Processed' : 'Process Resume'}
                </button>
              </div>
            )}
            
            {extractedText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extracted Resume Text (Editable)</label>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  rows={10}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border font-mono text-xs"
                  placeholder="Extracted text will appear here..."
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={manualProfile.name}
                onChange={(e) => setManualProfile({ ...manualProfile, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Information</label>
              <textarea
                value={manualProfile.contactInfo}
                onChange={(e) => setManualProfile({ ...manualProfile, contactInfo: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Email: john@example.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/johndoe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Summary <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.summary}
                onChange={(e) => setManualProfile({ ...manualProfile, summary: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Brief summary of your professional background..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Experience <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.experience}
                onChange={(e) => setManualProfile({ ...manualProfile, experience: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Senior Developer at Tech Co (2020-Present)..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Projects <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.projects}
                onChange={(e) => setManualProfile({ ...manualProfile, projects: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Key projects you have worked on..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.education}
                onChange={(e) => setManualProfile({ ...manualProfile, education: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="BS Computer Science, University of Technology..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.skills}
                onChange={(e) => setManualProfile({ ...manualProfile, skills: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="React, TypeScript, Node.js..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Others <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={manualProfile.others}
                onChange={(e) => setManualProfile({ ...manualProfile, others: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Certifications, Awards, Languages..."
              />
            </div>
          </div>
        )}
      </section>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Generate Application
            </>
          )}
        </button>
      </div>

      {/* Generated Content Section */}
      {generatedContent && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-600" />
              Review & Edit
            </h2>
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
              <textarea
                value={generatedContent.coverLetter}
                onChange={(e) => setGeneratedContent({ ...generatedContent, coverLetter: e.target.value })}
                rows={15}
                title="Generated Cover Letter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border font-mono text-sm"
              />
              <div className="mt-2">
                <button
                  onClick={generateWordDocument}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Word Doc
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
              <textarea
                value={generatedContent.emailBody}
                onChange={(e) => setGeneratedContent({ ...generatedContent, emailBody: e.target.value })}
                rows={15}
                title="Generated Email Body"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border font-mono text-sm"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
