// import endpoints from '../../endpoints.json';

// const baseURL = endpoints.BACKEND_URL;

const baseURL = process.env.REACT_APP_BACKEND_URL;


async function convertPdfToText(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${baseURL}/convertpdfToLink`, {
      method: 'POST',
      body: formData
    });
    // return the response as text
    return response.text();

  }
  
  export default convertPdfToText ;
  