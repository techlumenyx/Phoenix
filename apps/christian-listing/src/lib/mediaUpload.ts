import { firebaseAuth } from '../firebase';
import { resolveMediaEndpoint } from './media-endpoint';

export type UploadPurpose = 'MEMBER_AVATAR' | 'ORGANISATION_LOGO' | 'ORGANISATION_GALLERY' | 'VERIFICATION_DOCUMENT' | 'EVENT_IMAGE' | 'EVENT_VIDEO' | 'MARKETPLACE_IMAGE' | 'MARKETPLACE_VIDEO' | 'JOB_CV';
export interface UploadedMedia { assetId: string; publicId: string; url: string; resourceType: 'image' | 'video' | 'raw'; format: string; bytes: number; width: number | null; height: number | null; duration: number | null; posterUrl: string | null }
export const MAX_VIDEO_BYTES = 20_000_000;

const endpointByPurpose: Record<UploadPurpose, string> = {
  MEMBER_AVATAR: resolveMediaEndpoint(process.env['CL_IDENTITY_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'identity'),
  ORGANISATION_LOGO: resolveMediaEndpoint(process.env['CL_IDENTITY_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'identity'),
  ORGANISATION_GALLERY: resolveMediaEndpoint(process.env['CL_IDENTITY_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'identity'),
  VERIFICATION_DOCUMENT: resolveMediaEndpoint(process.env['CL_IDENTITY_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'identity'),
  EVENT_IMAGE: resolveMediaEndpoint(process.env['CL_EVENTS_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'events'),
  EVENT_VIDEO: resolveMediaEndpoint(process.env['CL_EVENTS_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'events'),
  MARKETPLACE_IMAGE: resolveMediaEndpoint(process.env['CL_CLASSIFIEDS_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'classifieds'),
  MARKETPLACE_VIDEO: resolveMediaEndpoint(process.env['CL_CLASSIFIEDS_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'classifieds'),
  JOB_CV: resolveMediaEndpoint(process.env['CL_CLASSIFIEDS_MEDIA_URL'], process.env['CL_GRAPHQL_URL'], 'classifieds'),
};

export async function uploadMedia(file: File, purpose: UploadPurpose, ownerId?: string, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  if ((purpose === 'EVENT_VIDEO' || purpose === 'MARKETPLACE_VIDEO') && file.size > MAX_VIDEO_BYTES) {
    throw new Error('Video must be 20 MB or smaller.');
  }
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
