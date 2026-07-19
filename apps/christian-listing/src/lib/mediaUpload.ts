import { firebaseAuth } from '../firebase';

export type UploadPurpose = 'MEMBER_AVATAR' | 'ORGANISATION_LOGO' | 'ORGANISATION_GALLERY' | 'VERIFICATION_DOCUMENT' | 'EVENT_IMAGE' | 'EVENT_VIDEO' | 'MARKETPLACE_IMAGE' | 'MARKETPLACE_VIDEO' | 'JOB_CV';
export interface UploadedMedia { assetId: string; publicId: string; url: string; resourceType: 'image' | 'video' | 'raw'; format: string; bytes: number; width: number | null; height: number | null; duration: number | null; posterUrl: string | null }

const endpointByPurpose: Record<UploadPurpose, string> = {
  MEMBER_AVATAR: process.env['CL_IDENTITY_MEDIA_URL'] ?? 'http://localhost:4001/media/upload',
  ORGANISATION_LOGO: process.env['CL_IDENTITY_MEDIA_URL'] ?? 'http://localhost:4001/media/upload',
  ORGANISATION_GALLERY: process.env['CL_IDENTITY_MEDIA_URL'] ?? 'http://localhost:4001/media/upload',
  VERIFICATION_DOCUMENT: process.env['CL_IDENTITY_MEDIA_URL'] ?? 'http://localhost:4001/media/upload',
  EVENT_IMAGE: process.env['CL_EVENTS_MEDIA_URL'] ?? 'http://localhost:4002/media/upload',
  EVENT_VIDEO: process.env['CL_EVENTS_MEDIA_URL'] ?? 'http://localhost:4002/media/upload',
  MARKETPLACE_IMAGE: process.env['CL_CLASSIFIEDS_MEDIA_URL'] ?? 'http://localhost:4003/media/upload',
  MARKETPLACE_VIDEO: process.env['CL_CLASSIFIEDS_MEDIA_URL'] ?? 'http://localhost:4003/media/upload',
  JOB_CV: process.env['CL_CLASSIFIEDS_MEDIA_URL'] ?? 'http://localhost:4003/media/upload',
};

export async function uploadMedia(file: File, purpose: UploadPurpose, ownerId?: string, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in before uploading files.');
  const url = new URL(endpointByPurpose[purpose]);
  url.searchParams.set('purpose', purpose);
  if (ownerId) url.searchParams.set('ownerId', ownerId);
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url.toString());
    request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.setRequestHeader('Content-Type', 'application/octet-stream');
    request.setRequestHeader('X-File-Name', file.name);
    request.setRequestHeader('X-File-Type', file.type);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress?.(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    request.onload = () => {
      let body: UploadedMedia | { error?: string };
      try { body = JSON.parse(request.responseText) as UploadedMedia | { error?: string }; }
      catch { reject(new Error('Upload service returned an invalid response.')); return; }
      if (request.status < 200 || request.status >= 300) reject(new Error(('error' in body && body.error) || 'Upload failed.'));
      else resolve(body as UploadedMedia);
    };
    request.send(file);
  });
}

export async function deleteUploadedMedia(media: UploadedMedia, purpose: UploadPurpose, ownerId?: string): Promise<void> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) return;
  const endpoint = endpointByPurpose[purpose].replace(/\/upload$/, '/delete');
  await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose, ownerId: ownerId ?? null, publicId: media.publicId, resourceType: media.resourceType }) });
}
