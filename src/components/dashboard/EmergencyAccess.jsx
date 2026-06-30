import { useState, useEffect } from 'react';

const svgIcon = (paths, sz = 18) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);

const ICONS = {
  fingerprint: svgIcon(<><path d="M12 10a2 2 0 0 0-2 2c0 1.5-.3 5.4-1 7"/><path d="M18 8.6C15.7 6.6 13.9 5.8 12 5.8c-1.9 0-3.7.8-6 2.8"/><path d="M6 13a6 6 0 0 1 6-6 6 6 0 0 1 6 6c0 1 0 2.5-.5 4"/><path d="M9 12a3 3 0 0 1 6 0c0 2-.5 3.5-1 5"/></>),
  idMatch: svgIcon(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h4M15 12h4M6 16h12"/></>),
  lock: svgIcon(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
  clipboard: svgIcon(<><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="M9 12h6M9 16h6"/></>),
  timer: svgIcon(<><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="9"/><circle cx="12" cy="14" r="8"/></>),
  medical: svgIcon(<><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/><path d="M12 8v6M9 11h6"/></>),
  emergency: svgIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
  checkCircle: svgIcon(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>),
  search: svgIcon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
  bolt: svgIcon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>),
  unlock: svgIcon(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>),
  user: svgIcon(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>, 22),
  alertTriangle: svgIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, 14),
  noEntry: svgIcon(<><circle cx="12" cy="12" r="10"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/></>, 14),
  pill: svgIcon(<><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></>, 14),
  droplet: svgIcon(<path d="M12 2s6 7 6 12a6 6 0 1 1-12 0c0-5 6-12 6-12Z"/>, 14),
  hospital: svgIcon(<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M9 21V13h6v8"/><path d="M9 4h6M12 2v5"/></>, 14),
  phone: svgIcon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>, 14),
  fileText: svgIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></>, 14),
  refresh: svgIcon(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>, 14),
  brain: svgIcon(<><path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.4 1.5 3.2A4.5 4.5 0 0 0 8 12.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.5a4.5 4.5 0 0 0-1.5-3.3C15.2 8.4 16 7.5 16 6a4 4 0 0 0-4-4Z"/><line x1="10" y1="22" x2="14" y2="22"/></>, 14),
  closeCircle: svgIcon(<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>, 12),
};

const STEPS = [
  { id: 1, emoji: ICONS.fingerprint, title: 'Reading Fingerprint', sub: 'Extracting biometric markers...' },
  { id: 2, emoji: ICONS.idMatch, title: 'Aadhaar API Match', sub: 'Connecting to UIDAI database...' },
  { id: 3, emoji: ICONS.lock, title: 'Decrypting Vault', sub: 'AES-256 secure unlock...' },
  { id: 4, emoji: ICONS.clipboard, title: 'Loading Medical Records', sub: 'Fetching emergency data...' },
  { id: 5, emoji: ICONS.timer, title: 'Granting 24h Access', sub: 'Emergency access token issued...' },
];

/* ── tiny helpers ─────────────────────────────────── */
function TypingDots() {
  return (
    <span className="ea-typing-dots">
      {[0, 1, 2].map(i => (
        <span key={i} className="ea-dot" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="ea-info-row">
      <span className="ea-info-label">{icon} {label}</span>
      <span className="ea-info-value">{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="ea-section-label">{children}</div>;
}

function GlassBtn({ children, onClick, variant = 'default', disabled }) {
  return (
    <button
      className={`ea-glass-btn ea-glass-btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ── SCREEN 1 — SCANNER ──────────────────────────── */
function ScannerScreen({ onScanComplete, onDemo, patientEmail, setPatientEmail, error }) {
  const [scanState, setScanState] = useState('idle');

  const startScan = () => {
    if (!patientEmail.trim()) return;
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
      setTimeout(onScanComplete, 900);
    }, 2600);
  };

  const ringClass = scanState === 'success' ? 'ea-ring--success' : scanState === 'scanning' ? 'ea-ring--scanning' : '';

  return (
    <div className="ea-card ea-screen-enter">
      <div className="ea-header-block">
        <span className="ea-logo-pill"><span className="ea-logo-icon">{ICONS.medical}</span><span className="ea-logo-text">MedShield</span></span>
        <div><span className="ea-emergency-badge">{ICONS.emergency} Emergency Access Mode</span></div>
        <h2 className="ea-title">Patient Identification</h2>
        <p className="ea-subtitle">Scan patient fingerprint to retrieve emergency medical records via Aadhaar verification</p>
      </div>

      {/* Patient email input */}
      <div className="ea-email-field">
        <label htmlFor="eaPatientEmail">Patient Email</label>
        <input
          id="eaPatientEmail"
          type="email"
          placeholder="patient@example.com"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          disabled={scanState !== 'idle'}
        />
      </div>
      {error && <p className="ea-error">{error}</p>}

      {/* Scanner */}
      <div className="ea-scanner-wrap">
        <div className="ea-scanner-ring-outer">
          <div className={`ea-ring-spin ${ringClass}`} />
          <div className="ea-ring-dashed" />
          <div
            className={`ea-scan-circle ${ringClass}`}
            onClick={scanState === 'idle' ? startScan : undefined}
            role="button"
            tabIndex={0}
          >
            {scanState === 'scanning' && <div className="ea-scan-line" />}
            <span className={`ea-scan-emoji ${scanState === 'idle' ? 'ea-finger-float' : ''}`}>
              {scanState === 'success' ? ICONS.checkCircle : scanState === 'scanning' ? ICONS.fingerprint : ICONS.fingerprint}
            </span>
          </div>
        </div>
        <div className="ea-scan-status">
          {scanState === 'idle' && 'Tap the scanner to scan fingerprint'}
          {scanState === 'scanning' && <span>Scanning fingerprint<TypingDots /></span>}
          {scanState === 'success' && <span className="ea-text-success">✓ Fingerprint captured successfully!</span>}
        </div>
      </div>

      <GlassBtn variant="emergency" onClick={startScan} disabled={scanState !== 'idle' || !patientEmail.trim()}>
        {scanState === 'scanning' ? <span>{ICONS.search} Scanning<TypingDots /></span> : <span>{ICONS.search} Scan Fingerprint</span>}
      </GlassBtn>
      <GlassBtn onClick={onDemo} disabled={!patientEmail.trim()}>{ICONS.bolt} Demo: Skip to Results</GlassBtn>
    </div>
  );
}

/* ── SCREEN 2 — PROCESSING ───────────────────────── */
const PROCESSING_PCTS = [20, 40, 65, 85, 100];
const PROCESSING_LABELS = [
  'Reading fingerprint...',
  'Matching Aadhaar identity...',
  'Decrypting medical vault...',
  'Loading medical records...',
  'Granting 24-hour access...',
];

function ProcessingScreen({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Initializing...');

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= STEPS.length) { setTimeout(onComplete, 600); return; }
      setActiveStep(i + 1);
      setProgress(PROCESSING_PCTS[i]);
      setLabel(PROCESSING_LABELS[i]);
      if (i > 0) setDoneSteps(d => [...d, i]);
      i++;
      setTimeout(tick, 950);
    };
    setTimeout(tick, 300);
    // Fixed-length onboarding animation — intentionally runs once on mount,
    // not on every onComplete identity change from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ea-card ea-screen-enter">
      <div className="ea-header-block">
        <span className="ea-logo-pill"><span className="ea-logo-icon">{ICONS.medical}</span><span className="ea-logo-text">MedShield</span></span>
        <div><span className="ea-verify-badge">{ICONS.search} Verifying Identity</span></div>
        <h2 className="ea-title">Aadhaar Verification</h2>
        <p className="ea-subtitle">Matching biometric data with national health registry</p>
      </div>

      <div className="ea-steps-list">
        {STEPS.map((step, idx) => {
          const isDone = doneSteps.includes(idx + 1);
          const isActive = activeStep === idx + 1;
          const cls = isDone ? 'ea-step--done' : isActive ? 'ea-step--active' : 'ea-step--pending';
          return (
            <div key={step.id} className={`ea-step ${cls}`}>
              <span className="ea-step-emoji">{step.emoji}</span>
              <div className="ea-step-body">
                <div className="ea-step-title">{step.title}</div>
                <div className="ea-step-sub">{step.sub}</div>
              </div>
              <span className={`ea-step-check ${isDone ? 'visible' : ''}`}>✓</span>
            </div>
          );
        })}
      </div>

      <div className="ea-progress">
        <div className="ea-progress-head">
          <span>{label}</span>
          <span className="ea-progress-pct">{progress}%</span>
        </div>
        <div className="ea-progress-track">
          <div className="ea-progress-fill" style={{ width: `${progress}%` }}>
            <div className="ea-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SCREEN 3 — PATIENT PROFILE ──────────────────── */
function PatientScreen({ patient, endsAt, onViewRecords, onReset }) {
  const [seconds, setSeconds] = useState(() => {
    const diff = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  });
  const [accessTimeStr] = useState(() => new Date().toLocaleString('en-IN'));

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');

  const p = patient;

  return (
    <div className="ea-card ea-screen-enter">
      <div className="ea-scrollable">
        <div className="ea-header-block">
          <span className="ea-logo-pill"><span className="ea-logo-icon">{ICONS.medical}</span><span className="ea-logo-text">MedShield</span></span>
          <div><span className="ea-success-badge">{ICONS.checkCircle} Identity Verified</span></div>
        </div>

        {/* Patient Card */}
        <div className="ea-patient-card">
          <div className="ea-avatar">{ICONS.user}</div>
          <div>
            <div className="ea-patient-name">{p.name}</div>
            <div className="ea-patient-meta">{p.dob ? `DOB: ${p.dob} · ` : ''}{p.gender || 'N/A'}</div>
            <div className="ea-patient-id">MedShield Patient</div>
            <span className="ea-biometric-tag">✓ Biometric Match Confirmed</span>
          </div>
        </div>

        {/* Timer */}
        <div className="ea-timer-bar">
          <div>
            <div className="ea-timer-title">{ICONS.unlock} Emergency Access Active</div>
            <div className="ea-timer-sub">Auto-expires · Patient notified on recovery</div>
          </div>
          <div className="ea-countdown">{h}:{m}:{s}</div>
        </div>

        {/* Critical Alerts */}
        {p.allergies && p.allergies.length > 0 && (
          <div className="ea-alerts-box">
            <div className="ea-alerts-title">{ICONS.alertTriangle} Critical Alerts, Allergies</div>
            <div className="ea-alert-tags">
              {p.allergies.map((a, i) => <span key={i} className="ea-alert-tag">{ICONS.noEntry} {a}</span>)}
            </div>
          </div>
        )}

        {/* Drug Reactions (legacy plain-text field) */}
        {p.drugReactions && (
          <div className="ea-alerts-box" style={{ background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.35)' }}>
            <div className="ea-alerts-title" style={{ color: '#c084fc' }}>{ICONS.pill} Drug Reactions &amp; Body Reactiveness</div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{p.drugReactions}</p>
          </div>
        )}

        {/* Structured Drug Interactions */}
        {p.drugInteractions && p.drugInteractions.length > 0 && (
          <div className="ea-alerts-box ea-di-box">
            <div className="ea-alerts-title ea-di-header">{ICONS.pill} Recorded Drug Interactions ({p.drugInteractions.length})</div>
            {p.drugInteractions.map((di, idx) => (
              <div key={di.id || idx} className={`ea-di-item ea-di-sev--${di.severity}`}>
                <div className="ea-di-pair">
                  <span className="ea-di-drug">{di.drugA}</span>
                  <span className="ea-di-arrow">⇄</span>
                  <span className="ea-di-drug">{di.drugB}</span>
                  <span className={`ea-di-sev-badge ea-di-sev--${di.severity}`}>{di.severity}</span>
                </div>
                <div className="ea-di-desc">{di.description}</div>
                {di.recommendation && (
                  <div className="ea-di-rec">{ICONS.medical} {di.recommendation}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vitals Grid */}
        {p.bloodGroup && (
          <>
            <SectionLabel>{ICONS.droplet} Vital Information</SectionLabel>
            <div className="ea-vitals-grid">
              {[
                { emoji: ICONS.droplet, title: 'Blood Group', val: p.bloodGroup },
                ...(p.conditions || []).map(c => ({ emoji: ICONS.hospital, title: 'Condition', val: c })),
              ].map((item, i) => (
                <div key={i} className="ea-vital-card ea-card-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="ea-vital-emoji">{item.emoji}</div>
                  <div className="ea-vital-title">{item.title}</div>
                  <div className="ea-vital-val">{item.val}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Medications */}
        {p.medications && p.medications.length > 0 && (
          <>
            <SectionLabel>{ICONS.pill} Current Medications</SectionLabel>
            {p.medications.map((med, i) => (
              <InfoRow key={i} icon={ICONS.pill} label={typeof med === 'string' ? med : med.name} value={typeof med === 'string' ? '' : `${med.dose} · ${med.freq}`} />
            ))}
          </>
        )}

        {/* Emergency Contact */}
        {p.emergencyContact && (
          <>
            <SectionLabel>{ICONS.phone} Emergency Contact</SectionLabel>
            <InfoRow icon={ICONS.user} label={p.emergencyContact.name} value={p.emergencyContact.phone} />
          </>
        )}

        <div className="ea-divider" />

        <GlassBtn variant="teal" onClick={onViewRecords}>{ICONS.fileText} View Full Medical Records</GlassBtn>
        <GlassBtn onClick={onReset}>{ICONS.refresh} New Patient Scan</GlassBtn>

        <div className="ea-access-log">
          <p>{ICONS.lock} This access is logged and audited<br />Access granted: {accessTimeStr}</p>
        </div>
      </div>
    </div>
  );
}

/* ── SCREEN 4 — FULL RECORDS ─────────────────────── */
function RecordsScreen({ patient, onBack, onReset, onView }) {
  return (
    <div className="ea-card ea-screen-enter">
      <div className="ea-scrollable">
        <div className="ea-records-header">
          <button className="ea-back-btn" onClick={onBack}>← Back</button>
          <div>
            <div className="ea-records-title">{ICONS.clipboard} Full Records</div>
            <div className="ea-records-sub">{patient.name} · Emergency Access</div>
          </div>
        </div>

        <SectionLabel>{ICONS.fileText} Uploaded Documents</SectionLabel>
        {(!patient.documents || patient.documents.length === 0) && (
          <p className="ea-empty">No documents found for this patient.</p>
        )}
        {(patient.documents || []).map((doc, i) => (
          <div
            key={doc.id || i}
            className="ea-doc-row ea-card-fade-up"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => onView && onView(doc.id)}
            role="button"
            tabIndex={0}
          >
            <span className="ea-doc-icon">{ICONS.fileText}</span>
            <div className="ea-doc-body">
              <div className="ea-doc-title">{doc.title || doc.originalFilename || 'Document'}</div>
              <div className="ea-doc-meta">{doc.date || ''}{doc.type ? ` · ${doc.type}` : ''}</div>
            </div>
            <span className="ea-doc-arrow">›</span>
          </div>
        ))}

        {/* AI Summary */}
        {((patient.conditions && patient.conditions.length > 0) || patient.drugReactions || (patient.drugInteractions && patient.drugInteractions.length > 0)) && (
          <>
            <SectionLabel>{ICONS.brain} AI Summary</SectionLabel>
            <div className="ea-ai-box">
              <div className="ea-ai-title">{ICONS.brain} PLAIN LANGUAGE SUMMARY</div>
              <p className="ea-ai-text">
                {patient.allergies && patient.allergies.length > 0
                  ? `Known allergies: ${patient.allergies.join(', ')}. `
                  : 'No known allergies. '}
                {patient.conditions && patient.conditions.length > 0
                  ? `Conditions: ${patient.conditions.join(', ')}. `
                  : ''}
                {patient.medications && patient.medications.length > 0
                  ? `Currently on: ${patient.medications.map(m => typeof m === 'string' ? m : m.name).join(', ')}. `
                  : ''}
                {patient.drugReactions
                  ? `Drug reactions: ${patient.drugReactions}. `
                  : ''}
                {patient.drugInteractions && patient.drugInteractions.length > 0
                  ? `${patient.drugInteractions.length} drug interaction(s) on record, review before prescribing. `
                  : ''}
                Patient requires careful monitoring during emergency care.
              </p>
            </div>
          </>
        )}

        {/* Doctor Action Points */}
        {((patient.allergies && patient.allergies.length > 0) || patient.drugReactions || (patient.drugInteractions && patient.drugInteractions.length > 0)) && (
          <div className="ea-action-box">
            <div className="ea-action-title">{ICONS.alertTriangle} Doctor's Action Points</div>
            {(patient.allergies || []).map((a, i) => (
              <div key={i} className="ea-action-item">{i + 1}. {ICONS.closeCircle} Do NOT administer {a}</div>
            ))}
            {patient.drugReactions && (
              <div className="ea-action-item">{(patient.allergies?.length || 0) + 1}. {ICONS.pill} DRUG REACTIONS: {patient.drugReactions}</div>
            )}
            {(patient.drugInteractions || []).map((di, i) => {
              const baseIdx = (patient.allergies?.length || 0) + (patient.drugReactions ? 1 : 0) + i + 1;
              return (
                <div key={di.id || i} className={`ea-action-item ea-action-item--${di.severity}`}>
                  {baseIdx}. {ICONS.pill} <strong>{di.drugA} ⇄ {di.drugB}</strong> [{di.severity}]
                  {di.recommendation ? `: ${di.recommendation}` : `: ${di.description}`}
                </div>
              );
            })}
            {patient.emergencyContact && (
              <div className="ea-action-item">
                {(patient.allergies?.length || 0) + (patient.drugReactions ? 1 : 0) + (patient.drugInteractions?.length || 0) + 1}.
                {ICONS.phone} Contact family: {patient.emergencyContact.phone}
              </div>
            )}
          </div>
        )}

        <GlassBtn onClick={onReset}>{ICONS.refresh} New Patient Scan</GlassBtn>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────── */
export default function EmergencyAccess({ onViewDocument }) {
  const [screen, setScreen] = useState('scan');
  const [patientEmail, setPatientEmail] = useState('');
  const [patient, setPatient] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_BASE_URL?.trim() || '';

  const initiateEmergency = async () => {
    setError('');
    try {
      const token = JSON.parse(localStorage.getItem('medshield.auth') || '{}').token || '';
      const res = await fetch(`${API}/api/emergency-access/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientEmail: patientEmail.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Emergency access failed');
      setPatient(body.patient);
      setEndsAt(body.endsAt);
      setScreen('processing');
    } catch (err) {
      setError(err.message);
      setScreen('scan');
    }
  };

  const handleScanComplete = () => initiateEmergency();
  const handleDemo = () => initiateEmergency();

  const handleReset = () => {
    setScreen('scan');
    setPatient(null);
    setEndsAt(null);
    setError('');
    setPatientEmail('');
  };

  return (
    <div className="ea-container">
      {screen === 'scan' && (
        <ScannerScreen
          onScanComplete={handleScanComplete}
          onDemo={handleDemo}
          patientEmail={patientEmail}
          setPatientEmail={setPatientEmail}
          error={error}
        />
      )}
      {screen === 'processing' && (
        <ProcessingScreen onComplete={() => setScreen('patient')} />
      )}
      {screen === 'patient' && patient && (
        <PatientScreen
          patient={patient}
          endsAt={endsAt}
          onViewRecords={() => setScreen('records')}
          onReset={handleReset}
        />
      )}
      {screen === 'records' && patient && (
        <RecordsScreen
          patient={patient}
          onBack={() => setScreen('patient')}
          onReset={handleReset}
          onView={onViewDocument}
        />
      )}
    </div>
  );
}
