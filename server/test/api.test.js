// Integration tests against a live MedShield API (docker compose stack).
// Run with: npm run test:api
// Requires: docker compose up -d  (postgres + api reachable at API_BASE_URL)
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const run = crypto.randomUUID().slice(0, 8);

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

before(async () => {
  const { status } = await api('/health');
  assert.equal(status, 200, 'API must be reachable at ' + API_BASE_URL + ' before running tests');
});

let patientToken, doctorToken, hospitalToken, patientId, documentId;

test('health check reports ok', async () => {
  const { status, body } = await api('/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
});

test('registers a patient, doctor, and hospital', async () => {
  const pat = await api('/auth/register/patient', {
    method: 'POST',
    body: JSON.stringify({
      email: `patient-${run}@test.com`,
      password: 'Passw0rd!',
      fullName: 'Test Patient',
      dateOfBirth: '1990-01-01',
      bloodGroup: 'O+',
    }),
  });
  assert.equal(pat.status, 201);
  patientToken = pat.body.token;

  const doc = await api('/auth/register/doctor', {
    method: 'POST',
    body: JSON.stringify({
      email: `doctor-${run}@test.com`,
      password: 'Passw0rd!',
      fullName: 'Dr Test',
      licenseNumber: `LIC-${run}`,
      specialization: 'Cardiology',
    }),
  });
  assert.equal(doc.status, 201);
  doctorToken = doc.body.token;

  const hos = await api('/auth/register/hospital', {
    method: 'POST',
    body: JSON.stringify({
      email: `hospital-${run}@test.com`,
      password: 'Passw0rd!',
      hospitalName: 'Test Hospital',
      licenseNumber: `HLIC-${run}`,
      phone: '+49123',
      address: 'Bonn',
    }),
  });
  assert.equal(hos.status, 201);
  hospitalToken = hos.body.token;
});

test('rejects duplicate email registration', async () => {
  const { status, body } = await api('/auth/register/patient', {
    method: 'POST',
    body: JSON.stringify({
      email: `patient-${run}@test.com`,
      password: 'Passw0rd!',
      fullName: 'Dup',
      dateOfBirth: '1990-01-01',
      bloodGroup: 'O+',
    }),
  });
  assert.equal(status, 409);
  assert.match(body.message, /already exists/);
});

test('logs in with correct credentials, rejects wrong password', async () => {
  const ok = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role: 'patient', email: `patient-${run}@test.com`, password: 'Passw0rd!' }),
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);

  const bad = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role: 'patient', email: `patient-${run}@test.com`, password: 'wrong' }),
  });
  assert.equal(bad.status, 401);
});

test('rejects unauthenticated dashboard requests', async () => {
  const { status } = await api('/api/dashboard/patient');
  assert.equal(status, 401);
});

test('loads role-specific dashboards', async () => {
  const pat = await api('/api/dashboard/patient', { headers: authHeader(patientToken) });
  assert.equal(pat.status, 200);
  assert.equal(pat.body.metrics.length, 4);

  const doc = await api('/api/dashboard/doctor', { headers: authHeader(doctorToken) });
  assert.equal(doc.status, 200);

  const hos = await api('/api/dashboard/hospital', { headers: authHeader(hospitalToken) });
  assert.equal(hos.status, 200);
});

test('updates patient profile', async () => {
  const { status, body } = await api('/api/profile/patient', {
    method: 'PATCH',
    headers: authHeader(patientToken),
    body: JSON.stringify({ bloodGroup: 'A+', emergencyContactName: 'Jane' }),
  });
  assert.equal(status, 200);
  assert.equal(body.profile.bloodGroup, 'A+');
});

test('doctor uploads a document for the patient, patient can download it', async () => {
  const form = new FormData();
  form.append('file', new Blob(['integration-test content'], { type: 'text/plain' }), 'note.txt');
  form.append('documentType', 'lab_report');
  form.append('patientId', `patient-${run}@test.com`);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: authHeader(doctorToken),
    body: form,
  });
  const body = await res.json();
  assert.equal(res.status, 201, JSON.stringify(body));
  documentId = body.documentId;

  const dl = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download`, {
    headers: authHeader(patientToken),
  });
  assert.equal(dl.status, 200);
  const text = await dl.text();
  assert.equal(text, 'integration-test content');
});

test('a stranger cannot download the document', async () => {
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download`, {
    headers: authHeader(hospitalToken),
  });
  assert.equal(res.status, 403);
});

test('access request lifecycle: request -> approve -> grant works', async () => {
  const reqRes = await api('/api/access-requests', {
    method: 'POST',
    headers: authHeader(hospitalToken),
    body: JSON.stringify({ patientEmail: `patient-${run}@test.com`, reason: 'Routine review', scope: 'all_documents' }),
  });
  assert.equal(reqRes.status, 201);
  const requestId = reqRes.body.request.id;

  const approveRes = await api(`/api/access-requests/${requestId}`, {
    method: 'PATCH',
    headers: authHeader(patientToken),
    body: JSON.stringify({ action: 'approve' }),
  });
  assert.equal(approveRes.status, 200);

  const dl = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download`, {
    headers: authHeader(hospitalToken),
  });
  assert.equal(dl.status, 200);
});

test('drug interaction note: doctor writes, patient reads, doctor deletes', async () => {
  const search = await api(`/api/patients/search?email=patient-${run}@test.com`, { headers: authHeader(doctorToken) });
  patientId = search.body.patient.id;

  const write = await api('/api/drug-interactions', {
    method: 'POST',
    headers: authHeader(doctorToken),
    body: JSON.stringify({
      patientId,
      drugA: 'Warfarin',
      drugB: 'Aspirin',
      severity: 'severe',
      interactionType: 'pharmacodynamic',
      description: 'Increased bleeding risk',
    }),
  });
  assert.equal(write.status, 201);
  const interactionId = write.body.interaction.id;

  const read = await api(`/api/drug-interactions/${patientId}`, { headers: authHeader(patientToken) });
  assert.equal(read.status, 200);
  assert.equal(read.body.interactions.length, 1);

  const del = await api(`/api/drug-interactions/${interactionId}`, {
    method: 'DELETE',
    headers: authHeader(doctorToken),
  });
  assert.equal(del.status, 200);
});

test('rejects invalid drug interaction severity', async () => {
  const { status, body } = await api('/api/drug-interactions', {
    method: 'POST',
    headers: authHeader(doctorToken),
    body: JSON.stringify({
      patientId,
      drugA: 'A',
      drugB: 'B',
      severity: 'extreme',
      interactionType: 'pharmacodynamic',
      description: 'x',
    }),
  });
  assert.equal(status, 400);
  assert.match(body.message, /severity must be one of/);
});

test('emergency access: blocked for patient role, then works for doctor after consent', async () => {
  const patientOnly = await api('/api/emergency-access/initiate', {
    method: 'POST',
    headers: authHeader(patientToken),
    body: JSON.stringify({ patientEmail: `patient-${run}@test.com` }),
  });
  assert.equal(patientOnly.status, 403);

  const ok = await api('/api/emergency-access/initiate', {
    method: 'POST',
    headers: authHeader(doctorToken),
    body: JSON.stringify({ patientEmail: `patient-${run}@test.com` }),
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.patient.name, 'Test Patient');
});
