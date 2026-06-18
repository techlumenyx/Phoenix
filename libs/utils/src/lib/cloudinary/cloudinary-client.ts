import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function ensureConfigured(): void {
  if (configured) return;

  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: process.env['CLOUDINARY_API_KEY'],
    api_secret: process.env['CLOUDINARY_API_SECRET'],
    secure: true,
  });

  configured = true;
}

export const cloudinaryClient = new Proxy(cloudinary, {
  get(target, prop) {
    ensureConfigured();
    return Reflect.get(target, prop);
  },
});
