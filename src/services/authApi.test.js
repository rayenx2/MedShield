import { describe, it, expect, beforeEach } from 'vitest';
import { loginUser, registerUser, validateStoredAuthSession } from './authApi';

// VITE_API_BASE_URL is unset in the test env, so authApi runs in mock mode
// (localStorage-backed), exercising the same register -> login -> session
// validation flow the UI uses when no backend is configured.
describe('authApi (mock mode)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers a new patient and returns a session', async () => {
    const result = await registerUser({
      role: 'patient',
      data: { email: 'patient@example.com', password: 'Passw0rd!', fullName: 'Test Patient' },
    });
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('patient@example.com');
    expect(result.user.role).toBe('patient');
  });

  it('rejects duplicate registration for the same email', async () => {
    await registerUser({ role: 'patient', data: { email: 'dup@example.com', password: 'Passw0rd!' } });
    await expect(
      registerUser({ role: 'patient', data: { email: 'dup@example.com', password: 'Passw0rd!' } })
    ).rejects.toThrow(/already exists/);
  });

  it('logs in after registering, rejects wrong password', async () => {
    await registerUser({ role: 'doctor', data: { email: 'doc@example.com', password: 'Passw0rd!' } });

    const session = await loginUser({ role: 'doctor', email: 'doc@example.com', password: 'Passw0rd!' });
    expect(session.token).toMatch(/^mock-token-doctor-/);

    await expect(
      loginUser({ role: 'doctor', email: 'doc@example.com', password: 'WrongPass1' })
    ).rejects.toThrow(/No account found/);
  });

  it('validateStoredAuthSession accepts a session that matches a registered user', async () => {
    const result = await registerUser({ role: 'patient', data: { email: 'p2@example.com', password: 'Passw0rd!' } });
    const session = { token: result.token, user: result.user };
    expect(validateStoredAuthSession(session)).toBe(true);
  });

  it('validateStoredAuthSession rejects a session for a user that was never registered', () => {
    const session = { token: 'mock-token-patient-1', user: { email: 'ghost@example.com', role: 'patient' } };
    expect(validateStoredAuthSession(session)).toBe(false);
  });
});
