import { randomBytes, createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

// Runs on the Next.js server only — never shipped to the browser. This
// is the ONE place IMAGEKIT_PRIVATE_KEY is read. Do not import this
// key, or anything that touches it, from client components.
//
// ImageKit's client-side upload flow: the browser asks this route for
// a short-lived {token, expire, signature}, then uploads the file
// directly to ImageKit using that signature + the PUBLIC key. This
// route never sees the file itself, and ImageKit is never given our
// private key over the wire — only an HMAC computed from it.
// https://imagekit.io/docs/api-reference/upload-file/client-side-file-upload
export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    // Fails loudly rather than silently returning a broken signature —
    // a misconfigured env var should surface immediately, not as a
    // mysterious "upload failed" for whoever's testing the feature.
    return NextResponse.json({ message: 'Image upload is not configured on this server.' }, { status: 500 });
  }

  const token = randomBytes(16).toString('hex');
  // 30 minutes out, in seconds (ImageKit's `expire` is Unix seconds, not ms).
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;

  const signature = createHmac('sha1', privateKey).update(token + expire).digest('hex');

  return NextResponse.json({ token, expire, signature });
}