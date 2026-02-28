import { create } from 'zustand';

interface ManualProfile {
  name: string;
  contactInfo: string;
  summary: string;
  experience: string;
  projects: string;
  education: string;
  skills: string;
  others: string;
}

interface GeneratedContent {
  coverLetter: string;
  emailBody: string;
}

interface GeneratorState {
  activeTab: 'upload' | 'manual';
  setActiveTab: (tab: 'upload' | 'manual') => void;

  jobDescription: string;
  setJobDescription: (desc: string) => void;

  companyName: string;
  setCompanyName: (name: string) => void;

  position: string;
  setPosition: (pos: string) => void;

  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;

  newProfileName: string;
  setNewProfileName: (name: string) => void;

  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;

  extractedText: string;
  setExtractedText: (text: string) => void;

  manualProfile: ManualProfile;
  setManualProfile: (profile: ManualProfile) => void;
  updateManualProfile: (field: keyof ManualProfile, value: string) => void;

  generatedContent: GeneratedContent | null;
  setGeneratedContent: (content: GeneratedContent | null) => void;
  
  // Actions to reset state if needed
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
  activeTab: 'upload',
  setActiveTab: (tab) => set({ activeTab: tab }),

  jobDescription: '',
  setJobDescription: (desc) => set({ jobDescription: desc }),

  companyName: '',
  setCompanyName: (name) => set({ companyName: name }),

  position: '',
  setPosition: (pos) => set({ position: pos }),

  selectedProfileId: '',
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),

  newProfileName: '',
  setNewProfileName: (name) => set({ newProfileName: name }),

  resumeFile: null,
  setResumeFile: (file) => set({ resumeFile: file }),

  extractedText: '',
  setExtractedText: (text) => set({ extractedText: text }),

  manualProfile: {
    name: '',
    contactInfo: '',
    summary: '',
    experience: '',
    projects: '',
    education: '',
    skills: '',
    others: ''
  },
  setManualProfile: (profile) => set({ manualProfile: profile }),
  updateManualProfile: (field, value) => set((state) => ({
    manualProfile: { ...state.manualProfile, [field]: value }
  })),

  generatedContent: null,
  setGeneratedContent: (content) => set({ generatedContent: content }),

  reset: () => set({
    activeTab: 'upload',
    jobDescription: '',
    companyName: '',
    position: '',
    selectedProfileId: '',
    newProfileName: '',
    resumeFile: null,
    extractedText: '',
    manualProfile: {
      name: '',
      contactInfo: '',
      summary: '',
      experience: '',
      projects: '',
      education: '',
      skills: '',
      others: ''
    },
    generatedContent: null
  })
}));
