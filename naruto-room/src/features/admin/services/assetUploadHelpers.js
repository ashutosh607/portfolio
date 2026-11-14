import { apiRequest } from './api';

const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export function isPdfAssetFile(file) {
  return (
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    file.name?.toLowerCase().endsWith('.pdf')
  );
}

export function isImageAssetFile(file) {
  return IMAGE_MIME.has(file.type) || /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name || '');
}

export function extractClipboardFile(clipboardData) {
  if (!clipboardData) return null;
  const files = Array.from(clipboardData.files || []);
  if (files.length > 0) return files[0];
  const items = Array.from(clipboardData.items || []);
  for (const item of items) {
    if (item.kind === 'file') {
      const f = item.getAsFile();
      if (f) return f;
    }
  }
  return null;
}

export async function uploadAssetToServer(file) {
  const pdf = isPdfAssetFile(file);
  const data = new FormData();
  data.append('file', file, file.name || (pdf ? 'pasted-document.pdf' : 'pasted-screenshot.png'));
  const res = await apiRequest('/upload/' + (pdf ? 'document' : 'image'), {
    method: 'POST',
    body: data,
  });
  return res.data.url;
}

