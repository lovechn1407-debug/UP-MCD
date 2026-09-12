import { IMGBB_API_KEY } from '../utils/constants';

export async function uploadToImgbb(file) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.data.url;
}

export async function uploadMultipleToImgbb(files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadToImgbb(file);
    urls.push(url);
  }
  return urls;
}
