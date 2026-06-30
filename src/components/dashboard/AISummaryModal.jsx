import { useState, useEffect, useRef } from 'react';
import { summarizeDocument } from '../../services/vaultApi';

const ICONS = {
  docId: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3Z"/></svg>
  ),
  findings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  medication: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
  ),
  plain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.4 1.5 3.2A4.5 4.5 0 0 0 8 12.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.5a4.5 4.5 0 0 0-1.5-3.3C15.2 8.4 16 7.5 16 6a4 4 0 0 0-4-4Z"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
  ),
  clinical: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
  ),
  questions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="10"/></svg>
  ),
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.4 1.5 3.2A4.5 4.5 0 0 0 8 12.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.5a4.5 4.5 0 0 0-1.5-3.3C15.2 8.4 16 7.5 16 6a4 4 0 0 0-4-4Z"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
};

function parseSection(text) {
  const sections = text.split(/\n(?=DOCUMENT IDENTIFIED:|KEY FINDINGS:|ALERTS:|MEDICATIONS:|SIMPLE SUMMARY:|CLINICAL SUMMARY:|QUESTIONS:|URGENCY:)/g);
  return sections.map((section, idx) => {
    if (section.startsWith('DOCUMENT IDENTIFIED:')) {
      return (
        <div key={idx} className="aisummary-section aisummary-doc-id">
          <span className="aisummary-section-icon">{ICONS.docId}</span>
          <strong>{section.replace('DOCUMENT IDENTIFIED:', '').trim()}</strong>
        </div>
      );
    }
    if (section.startsWith('KEY FINDINGS:')) {
      const lines = section.split('\n').slice(1).filter(l => l.trim());
      return (
        <div key={idx} className="aisummary-section">
          <div className="aisummary-section-label"><span>{ICONS.findings}</span> Key Findings</div>
          <ul className="aisummary-list">
            {lines.map((l, i) => <li key={i}>{l.replace(/^[*-]\s*/, '')}</li>)}
          </ul>
        </div>
      );
    }
    if (section.startsWith('ALERTS:')) {
      const alerts = section.split('\n').filter(l => l.trim());
      return (
        <div key={idx} className="aisummary-section aisummary-alerts">
          {alerts.map((a, i) => (
            <div key={i} className="aisummary-alert-row">
              <span className="aisummary-alert-icon">{ICONS.alert}</span> {a.replace(/^ALERTS:\s*/, '').trim()}
            </div>
          ))}
        </div>
      );
    }
    if (section.startsWith('MEDICATIONS:')) {
      return (
        <div key={idx} className="aisummary-section">
          <div className="aisummary-section-label"><span>{ICONS.medication}</span> Medications</div>
          <p className="aisummary-text">{section.replace('MEDICATIONS:', '').trim()}</p>
        </div>
      );
    }
    if (section.startsWith('SIMPLE SUMMARY:')) {
      return (
        <div key={idx} className="aisummary-section aisummary-plain">
          <div className="aisummary-section-label"><span>{ICONS.plain}</span> Plain Language Summary</div>
          <p className="aisummary-text-highlight">{section.replace('SIMPLE SUMMARY:', '').trim()}</p>
        </div>
      );
    }
    if (section.startsWith('CLINICAL SUMMARY:')) {
      return (
        <div key={idx} className="aisummary-section">
          <div className="aisummary-section-label"><span>{ICONS.clinical}</span> Clinical Summary</div>
          <p className="aisummary-text">{section.replace('CLINICAL SUMMARY:', '').trim()}</p>
        </div>
      );
    }
    if (section.startsWith('QUESTIONS:')) {
      const qs = section.split('\n').slice(1).filter(l => l.trim());
      return (
        <div key={idx} className="aisummary-section">
          <div className="aisummary-section-label"><span>{ICONS.questions}</span> Questions for your doctor</div>
          <ol className="aisummary-qlist">
            {qs.map((q, i) => <li key={i}>{q.replace(/^\d+\.\s*/, '')}</li>)}
          </ol>
        </div>
      );
    }
    if (section.startsWith('URGENCY:')) {
      const level = section.replace('URGENCY:', '').trim().toLowerCase();
      const cls = level.includes('routine') ? 'is-routine' : level.includes('monitor') ? 'is-monitor' : 'is-urgent';
      return (
        <div key={idx} className={`aisummary-urgency ${cls}`}>
          Urgency: {level}
        </div>
      );
    }
    if (section.trim()) {
      return <p key={idx} className="aisummary-text">{section}</p>;
    }
    return null;
  });
}

export default function AISummaryModal({ documentId, filename, onClose }) {
  const [status, setStatus] = useState('loading'); // loading | done | error
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function analyze() {
      try {
        const data = await summarizeDocument(documentId);
        if (cancelled) return;
        setSummary(data.summary);
        setStatus('done');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'AI analysis failed.');
        setStatus('error');
      }
    }

    analyze();
    return () => { cancelled = true; };
  }, [documentId]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [status]);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="aisummary-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aisummary-shell">
        {/* Header */}
        <div className="aisummary-header">
          <div className="aisummary-header-left">
            <span className="aisummary-logo">{ICONS.brain}</span>
            <div>
              <h3 className="aisummary-title">MedShield AI Summary</h3>
              <p className="aisummary-filename">{filename}</p>
            </div>
          </div>
          <div className="aisummary-header-right">
            <button className="aisummary-close" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="aisummary-body" ref={contentRef}>
          {status === 'loading' && (
            <div className="aisummary-loading">
              <div className="aisummary-spinner" />
              <p className="aisummary-loading-title">Analyzing your document...</p>
              <p className="aisummary-loading-sub">MedShield AI is reading and summarizing</p>
              <div className="aisummary-loading-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="aisummary-error">
              <span className="aisummary-error-icon">{ICONS.alert}</span>
              <p>{error}</p>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
            </div>
          )}

          {status === 'done' && (
            <div className="aisummary-result">
              {parseSection(summary)}
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'done' && (
          <div className="aisummary-footer">
            <span className="aisummary-disclaimer">{ICONS.lock} AI analysis is for reference only. Consult your doctor for medical decisions.</span>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
