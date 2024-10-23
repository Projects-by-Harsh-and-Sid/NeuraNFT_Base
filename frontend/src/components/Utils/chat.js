
import endpoints from '../../endpoints.json';

const baseURL = endpoints.BACKEND_URL;


export async function get_api_key(collectionId, nftID){ 

    const response = await fetch(`${baseURL}/generate_key?collection_id=${collectionId}&nft_id=${nftID}`);
    console.log("Response:", response);
    const data = response.json();
    return data;
    
}

export async function get_jwt_decoded_response_for_chat(collectionId, nftID){

  
    const API_Keys = await get_api_key(collectionId, nftID);


    const url = API_Keys['hpcEndpoint']+":"+API_Keys['hpcEndpointPort']+"/start_chat";
    const apiKey = API_Keys['apiKey'];



    // post request to get the jwt token and chat url
    console.log("API Keys:", apiKey);
    console.log("URL:", url);

        const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },}

        );
    const decoded_response = await response.json();

    const jwt_Token = decoded_response['jwt_token'];

    console.log("JWT Token:", jwt_Token);

    return {jwt_Token, decoded_response};

}

// export {get_jwt_decoded_response_for_chat,get_api_key};
