import axios from 'axios';


const baseURL = 'http://localhost:5500';

async function uploadImage(imageData) {
  // Convert imageData (which is Uint8Array) back to a Blob
  const blob = new Blob([imageData]);

  // Create FormData to hold the file
  const formData = new FormData();
  formData.append('image', new File([blob], 'uploaded_image.png', { type: 'image/png' }));

  try {
    // Send a POST request to the Flask backend
    const response = await axios.post(`${baseURL}/upload_image_url`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Return the URL received from the backend
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export default uploadImage;
