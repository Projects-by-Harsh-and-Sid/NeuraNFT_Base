import axios from 'axios';
// import endpoints from '../../endpoints.json';

// const baseURL = endpoints.BACKEND_URL;

const baseURL = process.env.REACT_APP_BACKEND_URL;


async function uploadImage(imageData, imageType) {
  // Validate the input imageType or determine it from imageData if possible
  const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!supportedFormats.includes(imageType)) {
    console.error('Unsupported image format. Supported formats are PNG, JPEG, GIF, and WebP.');
    return null;
  }

  // Convert imageData (which is Uint8Array) back to a Blob
  const blob = new Blob([new Uint8Array(imageData)], { type: imageType });

  // Extract the file extension from the MIME type
  const fileExtension = imageType.split('/')[1];

  // Create FormData to hold the file
  const formData = new FormData();
  formData.append('image',blob, `uploaded_image.${fileExtension}`);

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


// const uploadImage = async (imageData) => {
//   try {
//     // Create a Blob from the Uint8Array
//     const blob = new Blob([new Uint8Array(imageData)], { type: 'image/jpeg' }); // Adjust type if necessary

//     // Create a FormData object and append the blob
//     const formData = new FormData();
//     formData.append('image', blob, 'image.jpg'); // Adjust filename if necessary

//     // Send the POST request to your Flask server
//     const response = await fetch('http://localhost:5500/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error('Upload failed');
//     }

//     const filename = await response.text();
    
//     // Construct the full URL for the uploaded image
//     const fullImageUrl = `http://localhost:5500/image/${filename}`;

//     return {
//       success: true,
//       url: fullImageUrl,
//       message: 'Image uploaded successfully'
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// export  {uploadImage};