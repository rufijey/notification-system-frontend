const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function uploadFileToS3(file: File, token: string): Promise<string> {
  // 1. Get presigned URL
  const response = await fetch(`${API_URL}/api/upload/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get presigned URL');
  }

  const { uploadUrl, fileUrl } = await response.json();

  // 2. Upload file to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to S3');
  }

  return fileUrl;
}
