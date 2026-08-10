import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { DepartmentEnum } from '../../context/AuthContext';
import type { StayBackCardData } from './StayBackCard';
import './staybacks.css';

interface CreateStayBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  stayBackToEdit?: StayBackCardData | null;
  onSuccess: () => void;
}

const DEPARTMENTS: { id: DepartmentEnum; name: string }[] = [
  { id: 'TECHNICAL', name: 'Technical' },
  { id: 'CREATIVE', name: 'Creative' },
  { id: 'PHOTOGRAPHY', name: 'Photography' },
  { id: 'SOCIAL_MEDIA', name: 'Social Media' },
  { id: 'MARKETING', name: 'Marketing' },
  { id: 'HOSPITALITY', name: 'Hospitality' }
];

export const CreateStayBackModal: React.FC<CreateStayBackModalProps> = ({
  isOpen,
  onClose,
  stayBackToEdit,
  onSuccess,
}) => {
  const isEditing = !!stayBackToEdit;

  const [title, setTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('02:30 PM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(15);
  const [requiredDepartments, setRequiredDepartments] = useState<DepartmentEnum[]>(['TECHNICAL']);
  const [status, setStatus] = useState<'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'>('OPEN');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (stayBackToEdit) {
      setTitle(stayBackToEdit.title);
      setProjectName(stayBackToEdit.projectName);
      setDescription(stayBackToEdit.description);
      setDate(new Date(stayBackToEdit.date).toISOString().split('T')[0]);
      setStartTime(stayBackToEdit.startTime);
      setEndTime(stayBackToEdit.endTime);
      setApplicationDeadline(new Date(stayBackToEdit.applicationDeadline).toISOString().slice(0, 16));
      setMaxParticipants(stayBackToEdit.maxParticipants);
      setRequiredDepartments(stayBackToEdit.requiredDepartments);
      setStatus(stayBackToEdit.status);
    } else {
      // Defaults for creation
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDate(defaultDate.toISOString().split('T')[0]);

      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 2);
      setApplicationDeadline(defaultDeadline.toISOString().slice(0, 16));
    }
  }, [stayBackToEdit]);

  if (!isOpen) return null;

  const toggleDepartment = (deptId: DepartmentEnum) => {
    if (requiredDepartments.includes(deptId)) {
      if (requiredDepartments.length === 1) return; // Require at least one department
      setRequiredDepartments(requiredDepartments.filter((d) => d !== deptId));
    } else {
      setRequiredDepartments([...requiredDepartments, deptId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !projectName.trim() || !description.trim() || !date || !startTime || !endTime || !applicationDeadline) {
      setErrorMsg('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

      const payload = {
        title: title.trim(),
        projectName: projectName.trim(),
        description: description.trim(),
        date: new Date(date).toISOString(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        maxParticipants: Number(maxParticipants),
        requiredDepartments,
        status
      };

      const url = isEditing
        ? `${API_BASE_URL}/api/staybacks/${stayBackToEdit.id}`
        : `${API_BASE_URL}/api/staybacks`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to save StayBack.');
      }
    } catch (err: any) {
      setErrorMsg('Network error saving StayBack.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="stayback-detail-overlay" onClick={onClose}>
        <motion.div
          className="stayback-detail-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="detail-header">
            <div>
              <span className="stayback-badge-sub">ADMIN CONTROL</span>
              <h2 className="detail-title">{isEditing ? 'Edit StayBack' : 'Create New StayBack'}</h2>
            </div>
            <button type="button" className="profile-close-btn" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-row-2col">
              <div className="auth-form-group">
                <label className="auth-label">StayBack Title *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Hexapod Robotics Assembly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Project Name *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Project TinkerBot"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Description & Objectives *</label>
              <textarea
                className="auth-input"
                style={{ height: '80px', padding: '10px 14px' }}
                placeholder="Describe stayback scope, prerequisites, lab guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="auth-form-group">
                <label className="auth-label">StayBack Date *</label>
                <input
                  type="date"
                  className="auth-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Max Participants *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="auth-input"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="auth-form-group">
                <label className="auth-label">Start Time *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="02:30 PM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">End Time *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="05:00 PM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="auth-form-group">
                <label className="auth-label">Application Deadline *</label>
                <input
                  type="datetime-local"
                  className="auth-input"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Status *</label>
                <select
                  className="auth-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={loading}
                >
                  <option value="OPEN">OPEN (Accepting Applications)</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Department Selection Checkboxes */}
            <div className="auth-form-group">
              <label className="auth-label">Target Departments *</label>
              <div className="card-depts-wrap mt-1">
                {DEPARTMENTS.map((d) => {
                  const isSelected = requiredDepartments.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={`dept-pill ${isSelected ? 'matching' : ''}`}
                      style={{ cursor: 'pointer', padding: '6px 12px' }}
                      onClick={() => toggleDepartment(d.id)}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="onboarding-actions pt-4">
              <button type="button" className="auth-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="auth-btn-primary cta-btn" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create StayBack'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateStayBackModal;
