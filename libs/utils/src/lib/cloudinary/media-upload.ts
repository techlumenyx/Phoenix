import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Transform, type Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { cloudinaryClient } from './cloudinary-client';

export const MEDIA_PURPOSES = [
  'MEMBER_AVATAR', 'ORGANISATION_LOGO', 'ORGANISATION_GALLERY',
  'VERIFICATION_DOCUMENT', 'EVENT_IMAGE', 'EVENT_VIDEO',
  'MARKETPLACE_IMAGE', 'MARKETPLACE_VIDEO', 'JOB_CV',
  'FEATURED_PLACEMENT_IMAGE',
] as const;
export type MediaPurpose = (typeof MEDIA_PURPOSES)[number];
export const MAX_VIDEO_BYTES = 20_000_000;

type Policy = { maxBytes: number; mimeTypes: string[]; resourceType: 'image' | 'video' | 'raw'; private: boolean };
export const MEDIA_POLICIES: Record<MediaPurpose, Policy> = {
  MEMBER_AVATAR: { maxBytes: 5e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
  ORGANISATION_LOGO: { maxBytes: 5e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
  ORGANISATION_GALLERY: { maxBytes: 8e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
  VERIFICATION_DOCUMENT: { maxBytes: 10e6, mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'], resourceType: 'raw', private: true },
  EVENT_IMAGE: { maxBytes: 8e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
  EVENT_VIDEO: { maxBytes: MAX_VIDEO_BYTES, mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'], resourceType: 'video', private: false },
  MARKETPLACE_IMAGE: { maxBytes: 8e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
  MARKETPLACE_VIDEO: { maxBytes: MAX_VIDEO_BYTES, mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'], resourceType: 'video', private: false },
  JOB_CV: { maxBytes: 10e6, mimeTypes: ['application/pdf'], resourceType: 'raw', private: true },
  FEATURED_PLACEMENT_IMAGE: { maxBytes: 8e6, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], resourceType: 'image', private: false },
};

export interface MediaUploadResult {
  assetId: string;
  publicId: string;
  url: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  posterUrl: string | null;
}

interface RegisterOptions {
  service: string;
  purposes: MediaPurpose[];
  authorize: (request: FastifyRequest, purpose: MediaPurpose, ownerId: string | null) => boolean | Promise<boolean>;
  onUploaded?: (request: FastifyRequest, purpose: MediaPurpose, ownerId: string | null, result: MediaUploadResult) => void | Promise<void>;
  onDeleted?: (publicId: string) => void | Promise<void>;
}

export function registerMediaUploadRoutes(fastify: FastifyInstance, options: RegisterOptions): void {
  fastify.addContentTypeParser('application/octet-stream', (_request, payload, done) => done(null, payload));
  fastify.options('/media/upload', async (_request, reply) => reply.code(204).send());
  fastify.options('/media/delete', async (_request, reply) => reply.code(204).send());
  fastify.post('/media/upload', async (request, reply) => {
    setCors(request, reply);
    const query = request.query as { purpose?: string; ownerId?: string };
    if (!MEDIA_PURPOSES.includes(query.purpose as MediaPurpose) || !options.purposes.includes(query.purpose as MediaPurpose)) {
      return reply.code(400).send({ error: 'Unsupported media purpose' });
    }
    const purpose = query.purpose as MediaPurpose;
    if (!(await options.authorize(request, purpose, query.ownerId ?? null))) return reply.code(403).send({ error: 'You cannot upload this media' });
    const policy = MEDIA_POLICIES[purpose];
    const mimeType = String(request.headers['x-file-type'] ?? '').toLowerCase();
    if (!policy.mimeTypes.includes(mimeType)) return reply.code(415).send({ error: `Unsupported file type for ${purpose}` });
    try {
      const result = await uploadMediaStream(request.body as Readable, {
        policy, purpose, service: options.service, ownerId: query.ownerId,
        originalName: String(request.headers['x-file-name'] ?? 'upload'), mimeType,
      });
      try {
        await options.onUploaded?.(request, purpose, query.ownerId ?? null, result);
      } catch (error) {
        await cloudinaryClient.uploader.destroy(result.publicId, { resource_type: result.resourceType, invalidate: true, type: policy.private ? 'private' : 'upload' }).catch(() => undefined);
        throw error;
      }
      return result;
    } catch (error) {
      request.log.error({ err: error, purpose }, 'Media upload failed');
      const message = error instanceof Error && error.message === 'FILE_TOO_LARGE' ? policy.resourceType === 'video' ? 'Video must be 20 MB or smaller' : 'File exceeds the allowed size' : error instanceof Error && error.message === 'INVALID_FILE_SIGNATURE' ? 'The file contents do not match the selected file type' : error instanceof Error && error.message.startsWith('VIDEO_TOO_LONG:') ? `Video exceeds the ${error.message.split(':')[1]} second duration limit` : 'Media upload failed';
      return reply.code(message.startsWith('File') ? 413 : 502).send({ error: message });
    }
  });
  fastify.post('/media/delete', async (request, reply) => {
    setCors(request, reply);
    const input = request.body as { purpose?: string; ownerId?: string | null; publicId?: string; resourceType?: string };
    if (!MEDIA_PURPOSES.includes(input.purpose as MediaPurpose) || !options.purposes.includes(input.purpose as MediaPurpose) || !input.publicId || !['image', 'video', 'raw'].includes(input.resourceType ?? '')) return reply.code(400).send({ error: 'Invalid media deletion request' });
    if (!(await options.authorize(request, input.purpose as MediaPurpose, input.ownerId ?? null))) return reply.code(403).send({ error: 'You cannot delete this media' });
    await cloudinaryClient.uploader.destroy(input.publicId, { resource_type: input.resourceType, invalidate: true, type: MEDIA_POLICIES[input.purpose as MediaPurpose].private ? 'private' : 'upload' });
    await options.onDeleted?.(input.publicId);
    return { deleted: true };
  });

  fastify.addHook('onSend', async (request, reply, payload) => {
  if (request.url.startsWith('/media/')) setCors(request, reply);
    return payload;
  });
}

function setCors(request: FastifyRequest, reply: { header(name: string, value: string): unknown }) {
  const origin = String(request.headers.origin ?? '');
  const allowed = (process.env['CL_MEDIA_ALLOWED_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3001').split(',').map((value) => value.trim());
  if (allowed.includes(origin)) reply.header('Access-Control-Allow-Origin', origin);
  reply.header('Vary', 'Origin');
  reply.header('Access-Control-Allow-Headers', 'authorization,content-type,x-file-name,x-file-type');
  reply.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
}

async function uploadMediaStream(stream: Readable, input: { policy: Policy; purpose: MediaPurpose; service: string; ownerId?: string | null; originalName: string; mimeType: string }): Promise<MediaUploadResult> {
  let bytes = 0;
  const limiter = new Transform({
    transform(chunk, _encoding, callback) {
      bytes += chunk.length;
      callback(bytes > input.policy.maxBytes ? new Error('FILE_TOO_LARGE') : null, chunk);
    },
  });
  let inspected = false;
  const signatureGuard = new Transform({ transform(chunk: Buffer, _encoding, callback) { if (!inspected) { inspected = true; if (!matchesSignature(chunk, [input.mimeType])) { callback(new Error('INVALID_FILE_SIGNATURE')); return; } } callback(null, chunk); } });
  const folder = ['cl', process.env['NODE_ENV'] ?? 'development', input.service, input.purpose.toLowerCase(), safeSegment(input.ownerId ?? 'unowned')].join('/');
  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const target = cloudinaryClient.uploader.upload_stream({
      resource_type: input.policy.resourceType,
      type: input.policy.private ? 'private' : 'upload',
      folder,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      discard_original_filename: true,
      context: `purpose=${input.purpose}|original_name=${sanitiseName(input.originalName)}`,
    }, (error, value) => error ? reject(error) : resolve(value as unknown as Record<string, unknown>));
    void pipeline(stream, signatureGuard, limiter, target).catch(reject);
  });
  const publicId = String(result['public_id']);
  const resourceType = input.policy.resourceType;
  const format = resolveMediaFormat(result['format'], input.mimeType);
  const duration = numberOrNull(result['duration']);
  const durationLimit = input.purpose === 'EVENT_VIDEO' ? 120 : input.purpose === 'MARKETPLACE_VIDEO' ? 30 : null;
  if (durationLimit && duration && duration > durationLimit) {
    await cloudinaryClient.uploader.destroy(publicId, { resource_type: 'video', invalidate: true });
    throw new Error(`VIDEO_TOO_LONG:${durationLimit}`);
  }
  return {
    assetId: String(result['asset_id']), publicId, url: input.policy.private ? encodePrivateMediaRef(resourceType, format, publicId) : String(result['secure_url']), resourceType,
    format, bytes: Number(result['bytes'] ?? bytes),
    width: numberOrNull(result['width']), height: numberOrNull(result['height']), duration,
    posterUrl: resourceType === 'video' ? cloudinaryClient.url(publicId, { resource_type: 'video', format: 'jpg', transformation: [{ width: 1280, height: 720, crop: 'fill', gravity: 'auto' }] }) : null,
  };
}

function safeSegment(value: string) { return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'unknown'; }
function sanitiseName(value: string) { return value.replace(/[|=\r\n]/g, '_').slice(0, 180); }
function numberOrNull(value: unknown) { return typeof value === 'number' && Number.isFinite(value) ? value : null; }

export function resolveMediaFormat(value: unknown, mimeType: string) {
  const reported = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (reported) return reported;
  return ({
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
  } as Record<string, string>)[mimeType] ?? 'bin';
}

function matchesSignature(bytes: Buffer, allowedMimeTypes: string[]) {
  const hex = bytes.subarray(0, 16).toString('hex');
  const ascii = bytes.subarray(0, 16).toString('ascii');
  return allowedMimeTypes.some((mime) => {
    if (mime === 'image/jpeg') return hex.startsWith('ffd8ff');
    if (mime === 'image/png') return hex.startsWith('89504e470d0a1a0a');
    if (mime === 'image/webp') return ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP';
    if (mime === 'application/pdf') return ascii.startsWith('%PDF-');
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return hex.startsWith('504b0304');
    if (mime === 'video/mp4' || mime === 'video/quicktime') return ascii.slice(4, 8) === 'ftyp';
    if (mime === 'video/webm') return hex.startsWith('1a45dfa3');
    return false;
  });
}

export function resolvePrivateMediaRef(value: string, expiresInSeconds = 300): string {
  if (!value.startsWith('cl-private:')) return value;
  const [, resourceType, format, encodedPublicId] = value.split(':');
  return cloudinaryClient.utils.private_download_url(decodeURIComponent(encodedPublicId), decodeURIComponent(format), {
    resource_type: resourceType,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    attachment: true,
  });
}

function encodePrivateMediaRef(resourceType: string, format: string, publicId: string) {
  return `cl-private:${resourceType}:${encodeURIComponent(format)}:${encodeURIComponent(publicId)}`;
}
