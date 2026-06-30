import { useState, useRef, useEffect } from 'react';
import VerifiedStamp from './VerifiedStamp';

const DOC_TYPES = [
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
];

export default function UploadModal({ onUpload, onClose, busy }) {
  const [form, setForm] = useState({
    patientId: '',
    documentType: 'lab_report',
    description: '',
    visitDate: '',
    file: null,
    preview: null,
  });
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState(0); // 0=form, 1=uploading, 2=verifying, 3=stamping
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape' && step === 0) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, step]);

  const handleFile = (f) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((p) => ({ ...p, file: f, preview: e.target.result }));
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!form.file) { setError('Please select a file.'); return; }
    if (!form.patientId) { setError('Patient email is required.'); return; }
    setError('');
    setStep(1);
    setTimeout(() => setStep(2), 900);
    setTimeout(() => setStep(3), 1900);
    setTimeout(async () => {
      try {
        await onUpload({
          file: form.file,
          patientId: form.patientId,
          documentType: form.documentType,
          description: form.description,
          visitDate: form.visitDate,
        });
        setStep(0);
        onClose();
      } catch (err) {
        setStep(0);
        setError(err.message);
      }
    }, 2800);
  };

  const isPdf = form.file?.name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="upload-modal-overlay" onClick={() => { if (step === 0) onClose(); }}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <div>
            <h3>Upload Document</h3>
            <p className="upload-modal-hint">
              <span className="upload-dot" />
              MedShield stamp applied automatically
            </p>
          </div>
          {step === 0 && (
            <button type="button" className="upload-modal-close" onClick={onClose}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          )}
        </div>

        <div className="upload-modal-body">
          {step > 0 ? (
            <div className="upload-progress">
              <div className="upload-steps">
                {[
                  { label: 'Uploading', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, active: step >= 1 },
                  { label: 'Verifying', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, active: step >= 2 },
                  { label: 'Stamping', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>, active: step >= 3 },
                ].map((s, i) => (
                  <div key={i} className="upload-step-group">
                    <div className="upload-step-col">
                      <div className={`upload-step-circle${s.active ? ' is-active' : ''}`}>
                        <span style={{ opacity: s.active ? 1 : 0.3 }}>{s.icon}</span>
                      </div>
                      <div className={`upload-step-label${s.active ? ' is-active' : ''}`}>{s.label}</div>
                    </div>
                    {i < 2 && <div className={`upload-step-line${step > i + 1 ? ' is-done' : ''}`} />}
                  </div>
                ))}
              </div>
              {step === 3 && (
                <div className="upload-stamp-reveal">
                  <VerifiedStamp size={130} />
                </div>
              )}
              <div className={`upload-step-message${step === 3 ? ' is-done' : ''}`}>
                {step === 1 && 'Uploading your document…'}
                {step === 2 && 'MedShield is verifying…'}
                {step === 3 && 'Stamp burned onto your document!'}
              </div>
            </div>
          ) : (
            <>
              {error && <p className="upload-error">{error}</p>}

              {/* File drop zone */}
              <div
                className={`upload-dropzone${drag ? ' is-dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {form.file ? (
                  <div className="upload-file-preview">
                    {form.preview && !isPdf ? (
                      <img src={form.preview} alt="" className="upload-thumb" />
                    ) : (
                      <span className="upload-file-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
                    )}
                    <div className="upload-file-info">
                      <div className="upload-file-name">{form.file.name}</div>
                      <div className="upload-file-size">{(form.file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-drop-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 0 9Z"/></svg></div>
                    <div className="upload-drop-label">Drop your document or click to browse</div>
                    <div className="upload-drop-hint">PDF, JPG, PNG, WEBP supported</div>
                  </>
                )}
              </div>

              {/* Form fields */}
              <div className="dashboard-field" style={{ marginBottom: 12 }}>
                <label htmlFor="uploadPatientEmail">Patient Email *</label>
                <input
                  id="uploadPatientEmail"
                  placeholder="patient@example.com"
                  value={form.patientId}
                  onChange={(e) => setForm((p) => ({ ...p, patientId: e.target.value }))}
                />
              </div>

              <div className="dashboard-form-grid" style={{ marginBottom: 12 }}>
                <div className="dashboard-field">
                  <label htmlFor="uploadDocType">Document Type</label>
                  <select
                    id="uploadDocType"
                    value={form.documentType}
                    onChange={(e) => setForm((p) => ({ ...p, documentType: e.target.value }))}
                  >
                    {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="dashboard-field">
                  <label htmlFor="uploadVisitDate">Visit Date</label>
                  <input
                    id="uploadVisitDate"
                    type="date"
                    value={form.visitDate}
                    onChange={(e) => setForm((p) => ({ ...p, visitDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="dashboard-field" style={{ marginBottom: 16 }}>
                <label htmlFor="uploadDesc">Description</label>
                <textarea
                  id="uploadDesc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ minHeight: 60 }}
                />
              </div>

              <div className="upload-stamp-banner">
                <span className="upload-stamp-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                <div>
                  <div className="upload-stamp-title">Auto-verified & stamped</div>
                  <div className="upload-stamp-desc">The MedShield seal is burned directly onto the uploaded file</div>
                </div>
              </div>

              <div className="upload-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary upload-submit-btn"
                  onClick={handleSubmit}
                  disabled={busy || !form.file || !form.patientId}
                >
                  ↑ Upload &amp; Stamp
                </button>
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
