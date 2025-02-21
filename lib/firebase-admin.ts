import { getApps, initializeApp, cert } from 'firebase-admin/app';

export function initAdmin() {
  if (getApps().length === 0) {
    const adminConfig = JSON.parse(process.env.FIREBASE_ADMIN_SDK!);
    initializeApp({
      credential: cert(adminConfig),
    });
  }
}
