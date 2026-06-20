import { AUTH_STORAGE_KEYS } from './session';

/** Open a printable certificate in a new tab (requires auth token in localStorage). */
export async function openCertificateDownload(certificateId: string): Promise<void> {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (!token) {
    throw new Error('Sign in to download your certificate.');
  }

  const response = await fetch(`/api/certificates/${certificateId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Could not load certificate.');
  }

  const html = await response.text();
  const popup = window.open('', '_blank');
  if (!popup) {
    throw new Error('Allow pop-ups to view your certificate.');
  }
  popup.document.write(html);
  popup.document.close();
}
