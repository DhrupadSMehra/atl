import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, type DepartmentEnum } from '../../context/AuthContext';
import { Cpu, Palette, Camera, Share2, TrendingUp, HeartHandshake, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import './auth.css';

interface DepartmentOption {
  id: DepartmentEnum;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEPARTMENTS: DepartmentOption[] = [
  { id: 'TECHNICAL', name: 'Technical', description: 'Robotics, IoT, Coding & Hardware Development', icon: Cpu },
  { id: 'CREATIVE', name: 'Creative', description: 'UI/UX Design, Graphics, 3D & Product Design', icon: Palette },
  { id: 'PHOTOGRAPHY', name: 'Photography', description: 'Filmmaking, Media Coverage & Editing', icon: Camera },
  { id: 'SOCIAL_MEDIA', name: 'Social Media', description: 'Content Creation, Strategy & Online Presence', icon: Share2 },
  { id: 'MARKETING', name: 'Marketing', description: 'Outreach, Public Relations & Event Management', icon: TrendingUp },
  { id: 'HOSPITALITY', name: 'Hospitality', description: 'Guest Relations, Operations & Logistics', icon: HeartHandshake }
];

export const ATLRegistrationFlow: React.FC = () => {
  const {
    pendingGoogleAccount,
    verifyRegistrationPassword,
    completeMemberRegistration,
    logout
  } = useAuth();

  // Step State (1: Verification, 2: Profile Setup)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [password, setPassword] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [fullName, setFullName] = useState(pendingGoogleAccount?.name || '');
  const [studentClass, setStudentClass] = useState('XI');
  const [section, setSection] = useState('A');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState<DepartmentEnum>('TECHNICAL');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1: Password Verification Submission
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!password.trim()) {
      setErrorMessage('Please enter the registration password.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRegistrationPassword(password);
      if (res.success) {
        setVerifiedPassword(password);
        setStep(2);
      } else {
        setErrorMessage(res.error || 'Invalid registration password. Please contact an ATL Head if you believe this is an error.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while validating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Registration Submission
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!studentClass.trim()) errors.studentClass = 'Class is required';
    if (!section.trim()) errors.section = 'Section is required';

    const cleanPhone = contactNumber.trim();
    if (!cleanPhone) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      errors.contactNumber = 'Contact number must contain exactly 10 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fix the errors below before completing registration.');
      return;
    }

    setLoading(true);
    try {
      await completeMemberRegistration({
        password: verifiedPassword || password,
        fullName: fullName.trim(),
        studentClass: studentClass.trim(),
        section: section.trim(),
        contactNumber: cleanPhone,
        department
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        className="atl-onboarding-card"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Header & Progress Bar */}
        <div className="onboarding-header">
          <div className="onboarding-brand">
            <span className="onboarding-badge">ATL MEMBER PORTAL</span>
            <h1 className="onboarding-title">Member Registration</h1>
          </div>

          {/* Step Progress Indicator */}
          <div className="step-progress-bar">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > 1 ? <CheckCircle2 className="step-icon" /> : '1'}
              </div>
              <span className="step-label">Verification</span>
            </div>

            <div className={`step-line ${step > 1 ? 'active' : ''}`} />

            <div className={`step-item ${step === 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Profile Setup</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <motion.div
            className="auth-alert error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {errorMessage}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: PASSWORD VERIFICATION */}
          {step === 1 && (
            <motion.form
              key="step1"
              onSubmit={handleVerifyPassword}
              className="onboarding-step-content"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="verification-info-box">
                <ShieldCheck className="info-box-icon" />
                <div>
                  <h3 className="info-box-title">Verification Required</h3>
                  <p className="info-box-desc">
                    To create an ATL Member account, please enter the registration password provided by the ATL Heads.
                  </p>
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-password">
                  Registration Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className={`auth-input ${errorMessage ? 'has-error' : ''}`}
                  placeholder="Enter registration password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>

              <div className="onboarding-actions">
                <button
                  type="button"
                  className="auth-btn-cancel"
                  onClick={logout}
                  disabled={loading}
                >
                  Cancel / Sign Out
                </button>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Continue →'}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: PROFILE SETUP */}
          {step === 2 && (
            <motion.form
              key="step2"
              onSubmit={handleCompleteRegistration}
              className="onboarding-step-content"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Personal Information */}
              <div className="form-section">
                <h2 className="form-section-heading">Personal Information</h2>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="fullName">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className={`auth-input ${fieldErrors.fullName ? 'has-error' : ''}`}
                    placeholder="e.g. Shourya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.fullName && <span className="auth-field-error">{fieldErrors.fullName}</span>}
                </div>

                <div className="form-row-2col">
                  <div className="auth-form-group">
                    <label className="auth-label" htmlFor="studentClass">
                      Class <span className="req">*</span>
                    </label>
                    <input
                      id="studentClass"
                      type="text"
                      className={`auth-input ${fieldErrors.studentClass ? 'has-error' : ''}`}
                      placeholder="e.g. XI"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      disabled={loading}
                      required
                    />
                    {fieldErrors.studentClass && <span className="auth-field-error">{fieldErrors.studentClass}</span>}
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label" htmlFor="section">
                      Section <span className="req">*</span>
                    </label>
                    <input
                      id="section"
                      type="text"
                      className={`auth-input ${fieldErrors.section ? 'has-error' : ''}`}
                      placeholder="e.g. A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      disabled={loading}
                      required
                    />
                    {fieldErrors.section && <span className="auth-field-error">{fieldErrors.section}</span>}
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="contactNumber">
                    Contact Number (10 Digits) <span className="req">*</span>
                  </label>
                  <input
                    id="contactNumber"
                    type="tel"
                    maxLength={10}
                    className={`auth-input ${fieldErrors.contactNumber ? 'has-error' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={contactNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setContactNumber(val);
                    }}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.contactNumber && <span className="auth-field-error">{fieldErrors.contactNumber}</span>}
                </div>
              </div>

              {/* Department Selection */}
              <div className="form-section">
                <div className="form-section-header">
                  <h2 className="form-section-heading">Primary Department</h2>
                  <span className="section-hint">Select one department that best matches your role</span>
                </div>

                <div className="department-grid" role="radiogroup" aria-label="Primary Department">
                  {DEPARTMENTS.map((dept) => {
                    const IconComponent = dept.icon;
                    const isSelected = department === dept.id;
                    return (
                      <div
                        key={dept.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`department-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setDepartment(dept.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setDepartment(dept.id);
                          }
                        }}
                      >
                        <div className="dept-card-header">
                          <div className="dept-icon-wrapper">
                            <IconComponent className="dept-icon" />
                          </div>
                          {isSelected && <CheckCircle2 className="dept-check-icon" />}
                        </div>
                        <h3 className="dept-name">{dept.name}</h3>
                        <p className="dept-desc">{dept.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Google Account Confirmation Box */}
              <div className="google-confirm-box">
                <UserCheck className="google-confirm-icon" />
                <div className="google-confirm-content">
                  <span className="google-confirm-label">Google Account Link</span>
                  <span className="google-confirm-email">{pendingGoogleAccount?.email || 'Authenticated Account'}</span>
                  <p className="google-confirm-subtext">
                    This Google account will now be permanently linked to your ATL Member profile.
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="onboarding-actions">
                <button
                  type="button"
                  className="auth-btn-cancel"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back to Verification
                </button>
                <button
                  type="submit"
                  className="auth-btn-primary cta-btn"
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Complete Registration'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ATLRegistrationFlow;
