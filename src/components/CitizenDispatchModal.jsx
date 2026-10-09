import React, { useState } from 'react';
import { 
  X, AlertTriangle, Mic, MicOff, Camera, MapPin, 
  Send, CheckCircle, ShieldAlert 
} from 'lucide-react';

export function CitizenDispatchModal({
  currentLocation,
  cityName,
  onClose,
  onSubmitReport
}) {
  const [category, setCategory] = useState('waterlog_risk');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('high');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle Simulated Voice Note Recording
  const handleToggleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceNoteDuration(1);
      const timer = setInterval(() => {
        setVoiceNoteDuration(prev => {
          if (prev >= 15) {
            clearInterval(timer);
            setIsRecording(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setIsRecording(false);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReport = {
      id: `citizen-report-${Date.now()}`,
      title: title.trim(),
      type: category,
      lat: currentLocation[0] + (Math.random() - 0.5) * 0.008,
      lng: currentLocation[1] + (Math.random() - 0.5) * 0.008,
      severity,
      description: description.trim() || 'Citizen reported urban alert.',
      hasVoiceNote: voiceNoteDuration > 0,
      hasPhoto: Boolean(photoPreview),
      reportedDate: 'Just now',
      verifiedCount: 1
    };

    onSubmitReport(newReport);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: '#ef4444' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#ef4444',
                letterSpacing: '0.04em'
              }}>
                Citizen Dispatch & Smart Insights
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Report Urban Chaos or Hidden Gem
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {isSubmitted ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Incident Broadcasted to Map!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Thank you for contributing to safer, smarter city exploration in {cityName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category Selector */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Incident Classification:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {[
                  { id: 'waterlog_risk', label: '🌊 Waterlogging' },
                  { id: 'dark_corridor', label: '💡 Dark Alley' },
                  { id: 'traffic_choke', label: '🚦 Traffic Snarl' },
                  { id: 'accident_zone', label: '⚠️ Road Hazard' },
                  { id: 'hidden_gem_discovery', label: '💎 Hidden Spot' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    style={{
                      background: category === c.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                      color: category === c.id ? 'var(--accent-primary)' : 'var(--text-main)',
                      border: `1px solid ${category === c.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Headline:
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Severe waterlogging near railway subway exit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Severity Level */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Urgency Severity:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['low', 'medium', 'high', 'critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: `1px solid ${severity === lvl ? '#ef4444' : 'var(--border-subtle)'}`,
                      background: severity === lvl ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-tertiary)',
                      color: severity === lvl ? '#ef4444' : 'var(--text-muted)'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Context & Guidance for Fellow Navigators:
              </label>
              <textarea
                rows={3}
                placeholder="Describe current status, alternate pedestrian route, lighting, or specific risks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Multi-modal Attachments: Voice Note & Photo Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Voice Note Recording Simulation */}
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: isRecording ? '#ef4444' : 'rgba(56, 189, 248, 0.2)',
                    color: isRecording ? '#ffffff' : 'var(--accent-primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    animation: isRecording ? 'pulse-hazard 1s infinite' : 'none'
                  }}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {isRecording ? `Recording (${voiceNoteDuration}s)...` : voiceNoteDuration > 0 ? `Voice Note Saved (${voiceNoteDuration}s)` : 'Record Voice Note'}
                </span>
              </div>

              {/* Photo Upload */}
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                position: 'relative'
              }}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Upload Preview"
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <label
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {photoPreview ? 'Photo Attached ✓' : 'Upload Hazard Photo'}
                </span>
              </div>
            </div>

            {/* Geolocation Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              <MapPin size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Location pinned automatically to current exploration precinct.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-urgent"
              style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
            >
              <Send size={16} />
              <span>Broadcast Citizen Alert to Live Map</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
