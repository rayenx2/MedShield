import { describe, it, expect } from 'vitest';
import { AUTH_ROLES, roleByKey } from './authRoles';

describe('AUTH_ROLES', () => {
  it('defines exactly patient, doctor, hospital', () => {
    expect(AUTH_ROLES.map((r) => r.key)).toEqual(['patient', 'doctor', 'hospital']);
  });

  it('gives every role a unique login, register, and dashboard path', () => {
    const paths = AUTH_ROLES.flatMap((r) => [r.loginPath, r.registerPath, r.dashboardPath]);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('roleByKey', () => {
  it('finds a role by key', () => {
    expect(roleByKey('doctor')).toMatchObject({ key: 'doctor', label: 'Doctor' });
  });

  it('returns undefined for an unknown key', () => {
    expect(roleByKey('admin')).toBeUndefined();
  });
});
