



async function convertPdfToText(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:5500/convertpdfToLink', {
      method: 'POST',
      body: formData
    });
    // return the response as text
    return response.text();

  }
  
  export default convertPdfToText ;
  