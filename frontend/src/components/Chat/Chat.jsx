import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import styles from './Chat.module.css';

const NFTImage = ({ nftImage, name }) => {
  const [imageError, setImageError] = useState(false);

  const uint8ArrayToBase64 = (uint8Array) => {
    if (!(uint8Array instanceof Uint8Array)) {
      console.error('Invalid image data: not a Uint8Array for NFT:', name);
      return '';
    }
    
    try {
      const binary = String.fromCharCode.apply(null, uint8Array);
      return window.btoa(binary);
    } catch (error) {
      console.error('Error converting Uint8Array to base64 for NFT:', name, error);
      return '';
    }
  };

  const handleImageError = (error) => {
    console.error('Failed to load image for NFT:', name, error);
    setImageError(true);
  };

  const imageSource = React.useMemo(() => {
    if (!nftImage || nftImage.length === 0) {
      console.error('Empty or invalid image data for NFT:', name);
      return '';
    }
    
    try {
      const base64 = uint8ArrayToBase64(nftImage);
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error creating image source for NFT:', name, error);
      return '';
    }
  }, [nftImage, name]);

  if (imageError || !imageSource) {
    return (
      <div className={styles.nftImagePlaceholder}>
        <p>Image not available for {name || 'Unnamed NFT'}</p>
      </div>
    );
  }

  return (
    <img
      src={imageSource}
      alt={name || 'Unnamed NFT'}
      onError={handleImageError}
      className={styles.nftImage}
    />
  );
};

const Chat = () => {
  const { collectionId, nftID } = useParams();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [jwtToken, setJwtToken] = useState(null);
  const [ChatUrl, setChatUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [nftDetails, setNftDetails] = useState({
    name: 'Unnamed NFT',
    description: 'No description available',
    model: 'Unknown',
    nft_image: null,
  });
  const [isModelFeaturesOpen, setIsModelFeaturesOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (collectionId) {
    //   fetchNFTDetails();
      initializeChat();
      console.log("Collection ID:", collectionId);
    } else {
      navigate('/collections');
    }
  }, [collectionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const initializeChat = async () => {



    setIsInitializing(true);

    // const API_Keys = await get_api_key(collectionId, nftID);
    // const url = API_Keys['hpcEndpoint']+":"+API_Keys['hpcEndpointPort']+"/start_chat";
    // const apiKey = API_Keys['apiKey'];

    // // post request to get the jwt token and chat url

    // console.log("---------------------------------------------------------------");
    // console.log("API Keys:", apiKey);
    // console.log("URL:", url);


      
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-API-Key': apiKey
    //   },}
     
    // );

    // const decoded_response = await response.json();

    // const jwt_Token = decoded_response['jwt_token'];

    // console.log("JWT Token:", jwt_Token);

    // setJwtToken(jwt_Token);
    // setChatUrl(decoded_response['url']);



    // // console.log("Response:", response);
    // setIsInitializing(false);

  };

  const toggleModelFeatures = () => {
    setIsModelFeaturesOpen(!isModelFeaturesOpen);
  };

  const fetchNFTDetails = async () => {

    const collectionDetails = await get_collection_data(collectionId);
    const nftDetails = await get_nft_data(collectionId, nftID);
    console.log("NFT Details:", nftDetails);
    console.log("Collection Details:", collectionDetails);
        
    const nft_data = {
      name: nftDetails.name,
      description: nftDetails.description,
      model: collectionDetails.name +" : " +collectionDetails.baseModel,
      nft_image: nftDetails.uri,
      }

    setNftDetails(nft_data);


  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const simulateTyping = async (message) => {
    setIsTyping(true);
    let typedMessage = '';
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      typedMessage += words[i] + ' ';
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory];
        newHistory[newHistory.length - 1] = { 
          type: 'bot', 
          content: `<div class="bot-response">${typedMessage.trim()}</div>`
        };
        return newHistory;
      });
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }
    setIsTyping(false);
  };


  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || isInitializing) return;

    const newUserMessage = { type: 'user', content: userInput };
    setChatHistory(prevHistory => [...prevHistory, newUserMessage]);
    setIsLoading(true);
    setUserInput('');

    console.log("JWT Token:", jwtToken);

    try {
      const response = await fetch('http://localhost:5500/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken
        },
        body: JSON.stringify({ query: userInput, url: ChatUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const rawMarkdown = responseData.answer || 'No answer provided';
      const sanitizedHtml = DOMPurify.sanitize(marked(rawMarkdown));
      
      setChatHistory(prevHistory => [...prevHistory, { type: 'bot', content: '' }]);
      await simulateTyping(`<div class="bot-response">${sanitizedHtml}</div>`);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = `An error occurred: ${error.message}`;
      setChatHistory(prevHistory => [...prevHistory, { type: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={styles.chatPage}>
      <div className={styles.sidebar}>
        {nftDetails && (
          <>
            <img
              src={nftDetails.nft_image}
              alt={nftDetails.name || 'Unnamed NFT'}
              className={styles.nftImage}
            />
            <h2>{nftDetails.name || 'Unnamed NFT'}</h2>
            <p>{nftDetails.description || 'No description available'}</p>
            <div className={styles.modelInfo}>
              <div className={styles.modelTag} onClick={toggleModelFeatures}>
                <span className={styles.modelName}>
                  Model: {nftDetails.model || 'Unknown'}
                </span>
                <span className={styles.arrowDown}></span>
              </div>
              {isModelFeaturesOpen && (
                <ul className={styles.modelFeatures}>
                  <li>Content window: 16k</li>
                </ul>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.chatContainer}>
        <h2 className={styles.chatHeader}>Chat with NFT: {nftDetails.name}</h2>
        <div className={styles.chatMessages}>
          {chatHistory.map((message, index) => (
            <div key={index} className={message.type === 'user' ? styles.userMessage : styles.botMessage}>
              {message.type === 'bot' ? (
                <div className={styles.botPara} dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          ))}
          {isTyping && (
            <div className={styles.botMessage}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {isLoading && (
          <div className={styles.loadingIndicator}></div>
        )}
      </div>
      <div className={styles.chatInputContainer}>
        {isInitializing && (
          <div className={styles.initializingMessage}>Loading your model...</div>
        )}
        <input
          className={styles.chatInput}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
        />
        <button 
          className={styles.sendButton}
          onClick={sendMessage} 
          disabled={isLoading || isInitializing}
        >
          <svg className={styles.sendIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;