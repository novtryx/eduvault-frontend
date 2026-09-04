// Client-side ImageKit upload helper. Talks to our own /api/imagekit-auth
// route for a signature (that's the only place the private key is
// used), then uploads the file directly from the browser to ImageKit
// using the PUBLIC key — the private key never touches client code.
const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export class ImageUploadError extends Error {}

interface ImageKitUploadResponse {
  url: string;
  [key: string]: unknown;
}

export async function uploadImageToImageKit(file: File, folder = '/eduvault'): Promise<string> {
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new ImageUploadError('Image upload is not configured.');
  }

  const authRes = await fetch('/api/imagekit-auth');
  if (!authRes.ok) {
    throw new ImageUploadError("Couldn't start the upload. Please try again.");
  }
  const { token, expire, signature } = (await authRes.json()) as {
    token: string;
    expire: number;
    signature: string;
  };

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
  formData.append('token', token);
  formData.append('expire', String(expire));
  formData.append('signature', signature);
  formData.append('folder', folder);
  // Reusing the same fileName (e.g. re-uploading a school's logo)
  // replaces the previous file at that path instead of accumulating
  // duplicates in the ImageKit media library.
  formData.append('useUniqueFileName', 'true');

  const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.json().catch(() => undefined);
    const message = typeof body?.message === 'string' ? body.message : 'Upload failed. Please try again.';
    throw new ImageUploadError(message);
  }

  const result = (await uploadRes.json()) as ImageKitUploadResponse;
  return result.url;
}