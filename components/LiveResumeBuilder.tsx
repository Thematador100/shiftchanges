import React, { useState } from 'react';
import { CareerLevel } from '../types';

interface LiveResumeBuilderProps {
  onGenerate: (prompt: string, level: CareerLevel) => Promise<void>;
  onBack: () => void;
}

const LiveResumeBuilder: React.FC<LiveResumeBuilderProps> = ({ onGenerate, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CareerLevel | null>(null);
  const [experience, setExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLevel || !experience.trim()) return;

    setIsLoading(true);
    const prompt = `Name: ${fullName || 'Nurse'}\nTitle: ${title || 'Registered Nurse'}\nLocation: ${location}\nExperience: ${experience}`;
    try {
      await onGenerate(prompt, selectedLevel);
    } finally {
      setIsLoading(false);
    }
  };

  // Professional resume preview that updates in real-time
  const PreviewPanel = () => (
    <div className="sticky top-24 h-fit">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Resume Document */}
        <div className="bg-white p-8 font-sans text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>

          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-2">
              {title || 'Registered Nurse'}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              {location && <p>{location}</p>}
              {phone && <p>{phone}</p>}
              {email && <p>{email}</p>}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 border-b border-gray-300 pb-1 mb-3">
              Professional Summary
            </h2>
            <p className="text-gray-800 leading-relaxed text-sm">
              {experience || 'Dedicated nursing professional with expertise in patient care, clinical procedures, and healthcare coordination. Proven track record of delivering high-quality care in fast-paced medical environments.'}
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 border-b border-gray-300 pb-1 mb-3">
              Professional Experience
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">Registered Nurse</h3>
                  <span className="text-xs text-gray-600">2020 - Present</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">Medical Center | City, State</p>
                <ul className="space-y-1 text-sm text-gray-800">
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>Provide direct patient care in high-acuity medical-surgical unit</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>Manage patient assessments, medication administration, and treatment plans</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>Collaborate with interdisciplinary healthcare team for optimal patient outcomes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 border-b border-gray-300 pb-1 mb-3">
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-gray-800">Patient Care</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-800">Clinical Assessment</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-800">EMR Documentation</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-800">Medication Administration</span>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 border-b border-gray-300 pb-1 mb-3">
              Education & Certifications
            </h2>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">Bachelor of Science in Nursing (BSN)</p>
              <p className="text-gray-700">University Name, Year</p>
              <p className="text-gray-800 mt-2"><strong>Licenses:</strong> RN, BLS, ACLS</p>
            </div>
          </div>
        </div>

        {/* Preview Label */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
          <p className="text-xs text-slate-500 text-center">
            Live Preview • Your resume updates as you type
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              ← Back
            </button>
            <h1 className="text-lg font-bold text-slate-900">Resume Builder</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Input Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your Information</h2>
              <p className="text-sm text-slate-600">Fill in your details to see your professional resume take shape.</p>
            </div>

            {/* Career Level Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Select Your Career Stage</label>
              <div className="grid grid-cols-3 gap-3">
                {(['new_grad', 'experienced', 'leadership'] as CareerLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-2 text-sm font-medium rounded border-2 transition-all ${
                      selectedLevel === level
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {level === 'new_grad' ? 'New Grad' : level === 'experienced' ? 'Experienced' : 'Leadership'}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900">Contact Information</label>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Professional Title (e.g., Registered Nurse, CCRN)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Your Experience</label>
              <textarea
                placeholder="Describe your nursing experience, specialties, key achievements, years of practice, unit types, patient populations, certifications..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                The more details you provide, the better your AI-optimized resume will be.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedLevel || !experience.trim() || isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating Your Professional Resume...' : 'Generate Full Resume with AI'}
            </button>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="hidden lg:block">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResumeBuilder;
