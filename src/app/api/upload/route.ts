import { NextResponse } from 'next/server';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // 1. Signed API upload using API key + Secret
    if (cloudName && apiKey && apiSecret && cloudName !== 'your_cloudinary_cloud_name') {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const cloudinaryBody = new FormData();
      cloudinaryBody.append('file', file);
      cloudinaryBody.append('api_key', apiKey);
      cloudinaryBody.append('timestamp', timestamp);
      cloudinaryBody.append('signature', signature);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const uploadRes = await fetch(url, {
        method: 'POST',
        body: cloudinaryBody,
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        console.log('Successfully uploaded image to Cloudinary:', data.secure_url);
        return NextResponse.json({ secure_url: data.secure_url, public_id: data.public_id });
      } else {
        const errText = await uploadRes.text();
        console.warn('Cloudinary signed upload failed, checking preset/fallback:', errText);
      }
    }

    // 2. Unsigned upload using Upload Preset if present
    if (preset && cloudName && preset !== 'your_cloudinary_preset') {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const body = new FormData();
      body.append('file', file);
      body.append('upload_preset', preset);

      const uploadRes = await fetch(url, { method: 'POST', body });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        return NextResponse.json({ secure_url: data.secure_url });
      }
    }

    // 3. Fallback to Data URL if Cloudinary fails
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    return NextResponse.json({ secure_url: `data:${mimeType};base64,${base64}` });
  } catch (err: any) {
    console.error('Image upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
