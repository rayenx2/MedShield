import { useState, useEffect, useRef, useCallback } from 'react';

const stepIcon = (paths) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);

const ICON = {
    createAccount: stepIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></>),
    upload: stepIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>),
    grantAccess: stepIcon(<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>),
    emergency: stepIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
    monitor: stepIcon(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>),
    request: stepIcon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
    receivePermission: stepIcon(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>),
    viewHistory: stepIcon(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>),
    diagnose: stepIcon(<><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></>),
    registerInstitution: stepIcon(<><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><line x1="9" y1="9" x2="9" y2="9.01"/><line x1="9" y1="12" x2="9" y2="12.01"/><line x1="9" y1="15" x2="9" y2="15.01"/></>),
    uploadReports: stepIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>),
    secureStore: stepIcon(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
    share: stepIcon(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>),
};

const ROLES = [
    {
        id: 'patient',
        label: 'Patient',
        icon: (
            <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        ),
        steps: [
            { icon: ICON.createAccount, title: 'Create Account', desc: 'Sign up and set up your secure MedShield profile.' },
            { icon: ICON.upload, title: 'Upload Records', desc: 'Add your health records, lab reports, prescriptions, and documents.' },
            { icon: ICON.grantAccess, title: 'Grant Doctor Access', desc: 'Give your doctor permission to view specific records.' },
            { icon: ICON.emergency, title: 'Emergency Access Enabled', desc: "Critical data is available to ER doctors if you're incapacitated." },
            { icon: ICON.monitor, title: 'Monitor Audit Logs', desc: 'See exactly who accessed your records, when, and why.' },
        ],
    },
    {
        id: 'doctor',
        label: 'Doctor',
        icon: (
            <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M10 13v4M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        ),
        steps: [
            { icon: ICON.request, title: 'Request Patient Access', desc: "Send a secure request to view a patient's medical records." },
            { icon: ICON.receivePermission, title: 'Receive Permission', desc: 'Patient grants access. Role-based permissions are enforced automatically.' },
            { icon: ICON.viewHistory, title: 'View Medical History', desc: 'Access the full record history, AI summaries, and past treatments.' },
            { icon: ICON.diagnose, title: 'Diagnose Confidently', desc: 'Make better decisions using complete, accurate medical context.' },
        ],
    },
    {
        id: 'hospital',
        label: 'Hospital',
        icon: (
            <svg viewBox="0 0 20 20" fill="none">
                <rect x="2" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 18V13h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M7 4h6M10 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        ),
        steps: [
            { icon: ICON.registerInstitution, title: 'Register Institution', desc: 'Onboard your hospital and verify your identity on the platform.' },
            { icon: ICON.uploadReports, title: 'Upload Patient Reports', desc: 'Directly add diagnostic reports into patient vaults after visits.' },
            { icon: ICON.secureStore, title: 'Securely Store Documents', desc: "All documents are encrypted and stored in the patient's own vault." },
            { icon: ICON.share, title: 'Share with Authorized Doctors', desc: 'Affiliated doctors receive scoped access to relevant patient records only.' },
        ],
    },
];

const ROLE_CYCLE_MS = 5000;

export default function FlowSection() {
    const [activeRole, setActiveRole] = useState('patient');
    const [activeStep, setActiveStep] = useState(0);
    const stepTimerRef = useRef(null);
    const roleIdxRef = useRef(0);

    const getRoleSteps = useCallback((roleId) => {
        return ROLES.find((r) => r.id === roleId)?.steps ?? [];
    }, []);

    const runStepCycler = useCallback((roleId) => {
        clearInterval(stepTimerRef.current);
        const steps = getRoleSteps(roleId);
        const stepMs = Math.floor(ROLE_CYCLE_MS / steps.length);
        let idx = 0;
        setActiveStep(0);

        stepTimerRef.current = setInterval(() => {
            idx++;
            if (idx < steps.length) {
                setActiveStep(idx);
            } else {
                clearInterval(stepTimerRef.current);
                // Advance to next role
                roleIdxRef.current = (roleIdxRef.current + 1) % ROLES.length;
                const nextRole = ROLES[roleIdxRef.current].id;
                setActiveRole(nextRole);
                // runStepCycler called via useEffect when activeRole changes
            }
        }, stepMs);
    }, [getRoleSteps]);

    // When role changes, restart step cycler
    useEffect(() => {
        roleIdxRef.current = ROLES.findIndex((r) => r.id === activeRole);
        runStepCycler(activeRole);
        return () => clearInterval(stepTimerRef.current);
    }, [activeRole, runStepCycler]);

    const handleTabClick = (roleId) => {
        clearInterval(stepTimerRef.current);
        setActiveRole(roleId);
        setActiveStep(0);
        // The useEffect above will restart the cycler
    };

    const currentRole = ROLES.find((r) => r.id === activeRole);

    return (
        <section className="section flow-section" id="flow">
            <div className="container">
                <div className="section-header">
                    <span className="section-tag">How It Works</span>
                    <h2>Designed for Every Role</h2>
                    <p>MedShield adapts to how each person interacts with healthcare data, securely and transparently.</p>
                </div>

                {/* Role Tabs */}
                <div className="flow-tabs" role="tablist">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            className={`flow-tab${activeRole === role.id ? ' active' : ''}`}
                            data-role={role.id}
                            role="tab"
                            aria-selected={activeRole === role.id}
                            onClick={() => handleTabClick(role.id)}
                        >
                            {role.icon}
                            {role.label}
                        </button>
                    ))}
                </div>

                {/* Flow Panel */}
                <div className="flow-panels">
                    <div className="flow-panel active">
                        <div className="flow-stepper">
                            {currentRole?.steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`flow-step${i === currentRole.steps.length - 1 ? ' last' : ''}${i === activeStep ? ' step-current' : ''}`}
                                >
                                    <div className={`step-bubble${i === activeStep ? ' step-active' : ''}`}>
                                        {i + 1}
                                    </div>
                                    {i < currentRole.steps.length - 1 && <div className="step-connector" />}
                                    <div className="step-body">
                                        <div className="step-icon">{step.icon}</div>
                                        <h4>{step.title}</h4>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
