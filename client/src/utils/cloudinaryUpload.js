// Direct Cloudinary Upload from Client
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'pilates_uploads'); // You'll create this in Cloudinary
  formData.append('folder', 'pilates-uploads');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dvppsykcl/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

