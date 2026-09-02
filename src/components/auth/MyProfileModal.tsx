import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, type DepartmentEnum } from '../../context/AuthContext';
import { X, CheckCircle2, Mail, Calendar } from 'lucide-react';
import './auth.css';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS: { id: DepartmentEnum; name: string }[] = [
  { id: 'TECHNICAL', name: 'Technical' },
  { id: 'CREATIVE', name: 'Creative' },
  { id: 'PHOTOGRAPHY', name: 'Photography' },
  { id: 'SOCIAL_MEDIA', name: 'Social Media' },
  { id: 'MARKETING', name: 'Marketing' },
  { id: 'HOSPITALITY', name: 'Hospitality' }
];

export const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose }) => {
  const { member, user, updateMemberProfile } = useAuth();

  const [fullName, setFullName] = useState(member?.fullName || user?.name || '');
  const [studentClass, setStudentClass] = useState(member?.studentClass || '');
  const [section, setSection] = useState(member?.section || '');
  const [contactNumber, setContactNumber] = useState(member?.contactNumber || '');
  const [department, setDepartment] = useState<DepartmentEnum>(member?.department || 'TECHNICAL');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (member) {
      setFullName(member.fullName);
      setStudentClass(member.studentClass);
      setSection(member.section);
      setContactNumber(member.contactNumber);
      setDepartment(member.department);
    }
  }, [member]);

  if (!isOpen || (!member && !user)) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName.trim() || !studentClass.trim() || !section.trim()) {
      setErrorMsg('Full Name, Class, and Section are required.');
      return;
    }

    const cleanPhone = contactNumber.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('Contact number must contain exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await updateMemberProfile({
        fullName: fullName.trim(),
        studentClass: studentClass.trim(),
        section: section.trim(),
        contactNumber: cleanPhone,
        department
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const regDate = member?.createdAt
    ? new Date(member.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Session';

  const userEmail = member?.email || user?.email || 'N/A';

  return (
    <AnimatePresence>
      <div className="auth-modal-overlay" onClick={onClose}>
        <motion.div
          className="profile-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="profile-modal-header">
            <div>
              <h2 className="profile-modal-title">{member ? 'My Member Profile' : 'My Account Profile'}</h2>
              <p className="profile-modal-subtitle">
                {member ? 'View and update your Tinkethix profile details' : 'Authenticated session information'}
              </p>
            </div>
            <button type="button" className="profile-close-btn" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-alert success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* If not a member, display clean account summary */}
          {!member ? (
            <div className="profile-modal-form" style={{ gap: '16px' }}>
              <div className="profile-readonly-banner">
                <div className="readonly-item">
                  <Mail className="readonly-icon" />
                  <div>
                    <span className="readonly-label">Account Email</span>
                    <span className="readonly-value">{userEmail}</span>
                  </div>
                </div>
                <div className="readonly-item">
                  <Calendar className="readonly-icon" />
                  <div>
                    <span className="readonly-label">Access Role</span>
                    <span className="readonly-value">{user?.role?.toUpperCase() || 'VIEWER'}</span>
                  </div>
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Display Name</label>
                <div className="auth-input" style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                  {user?.name || 'Explorer'}
                </div>
              </div>

              {user?.adminProfile?.position && (
                <div className="auth-form-group">
                  <label className="auth-label">Assigned Designation</label>
                  <div className="auth-input" style={{ display: 'flex', alignItems: 'center', color: '#00ff66' }}>
                    {user.adminProfile.position}
                  </div>
                </div>
              )}

              <div className="profile-modal-actions" style={{ marginTop: '12px' }}>
                <button type="button" className="auth-btn-primary" onClick={onClose} style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-modal-form">
              {/* Read-Only Info Card */}
              <div className="profile-readonly-banner">
                <div className="readonly-item">
                  <Mail className="readonly-icon" />
                  <div>
                    <span className="readonly-label">Google Email</span>
                    <span className="readonly-value">{userEmail}</span>
                  </div>
                </div>
                <div className="readonly-item">
                  <Calendar className="readonly-icon" />
                  <div>
                    <span className="readonly-label">Registration Date</span>
                    <span className="readonly-value">{regDate}</span>
                  </div>
                </div>
              </div>

            {/* Editable Fields */}
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="prof-fullName">
                Full Name
              </label>
              <input
                id="prof-fullName"
                type="text"
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="prof-class">
                  Class
                </label>
                <input
                  id="prof-class"
                  type="text"
                  className="auth-input"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="prof-section">
                  Section
                </label>
                <input
                  id="prof-section"
                  type="text"
                  className="auth-input"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="prof-contactNumber">
                Contact Number (10 Digits)
              </label>
              <input
                id="prof-contactNumber"
                type="tel"
                maxLength={10}
                className="auth-input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="prof-department">
                Primary Department
              </label>
              <select
                id="prof-department"
                className="auth-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentEnum)}
                disabled={loading}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} Department
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-modal-actions">
              <button type="button" className="auth-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MyProfileModal;
