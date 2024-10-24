import React, { useEffect, useRef, useState } from 'react';
// import { useAppContext } from './WalletContext';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization
import { marked } from 'marked'; // Import the marked library
import { useNavigate, useParams } from 'react-router-dom';
import endpoints from '../../endpoints.json';
import Loading from '../NFTs/Loading';
import { get_jwt_decoded_response_for_chat } from '../Utils/chat';
import { fetchData } from '../Utils/datafetch';
import styles from './styles/Chat.module.css';
// import {get_api_key} from './helper_functions/get_chat_data';

// import {get_collection_data , get_nft_data} from './helper_functions/get_chain_data';
const baseURL = endpoints.BACKEND_URL;

const NFTImage = ({ nftImage, name }) => {
  const [imageError, setImageError] = React.useState(false);



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
      <div className={styles['nft-image-placeholder']}>
        <p>Image not available for {name || 'Unnamed NFT'}</p>
      </div>
    );
  }

  return (
    <img
      src={imageSource}
      alt={name || 'Unnamed NFT'}
      onError={handleImageError}
      className={styles['nft-image']}
    />
  );
};




const Chat = () => {
  // const { actor, authClient } = useAppContext();
  const { collectionId, nftID } = useParams(); // Get nftId from URL
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
    image: null,
    contextWindow: 'Unknown',
    totalAccess: 'Unknown',
    collection: 'Unknown',
    attributes: [],
  });
  const [isModelFeaturesOpen, setIsModelFeaturesOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [nftdetailsloaded, setNftDetailsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchNFTDetails = async () => {
    try {
      const myNFTs = await fetchData('compounded_nft',collectionId, parseInt(nftID));
      console.log("My NFTs:", myNFTs);
      setNftDetails(myNFTs);
      setNftDetailsLoaded(true);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
    }
  };

  async function initializeChat() {


    setIsInitializing(true);

  


    const {jwt_Token,decoded_response} = await get_jwt_decoded_response_for_chat(collectionId, parseInt(nftID));


    setJwtToken(jwt_Token);
    setChatUrl(decoded_response['url']);



    // // console.log("Response:", response);
    setIsInitializing(false);

  };

  

  useEffect(() => {
    const initializeData = async () => {
      if (collectionId) {
        const task1 = fetchNFTDetails();
        const task2 = initializeChat();
        await Promise.all([task1, task2]);
        console.log("Collection ID:", collectionId);

      } else {
        navigate('/collections'); // Redirect to collections if no NFT ID is provided
      }
    };
  
    initializeData();
  },[]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if(!nftdetailsloaded){
    return <Loading />;
  }



  const toggleModelFeatures = () => {
    setIsModelFeaturesOpen(!isModelFeaturesOpen);
  };

  // const fetchNFTDetails = async () => {

  //   const collectionDetails = await get_collection_data(collectionId);
  //   const nftDetails = await get_nft_data(collectionId, nftID);
  //   console.log("NFT Details:", nftDetails);
  //   console.log("Collection Details:", collectionDetails);
        
  //   const nft_data = {
  //     name: nftDetails.name,
  //     description: nftDetails.description,
  //     model: collectionDetails.name +" : " +collectionDetails.baseModel,
  //     nft_image: nftDetails.uri,
  //     }

  //   setNftDetails(nft_data);


  // };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents default behavior (like adding a newline)
      // sendMessage();
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
          content: `<div class={styles['bot-response']}>${typedMessage.trim()}</div>`
        };
        return newHistory;
      });
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }
    setIsTyping(false);
  };


  // const sendMessage = async () => {
  //   if (!userInput.trim()) return;

  //   const newUserMessage = { type: 'user', content: userInput };
  //   setChatHistory(prevHistory => [...prevHistory, newUserMessage]);
  //   setIsLoading(true);

  //   setUserInput(''); // Clear the input field

  //   try {
  //     const response = await fetch('https://1889-115-117-107-100.ngrok-free.app/chat', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': jwtToken
  //       },
  //       body: JSON.stringify({ query: userInput, url: ChatUrl }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const responseData = await response.json();

  //     const rawMarkdown = responseData.answer || 'No answer provided';
  //     console.log("Raw Markdown:", rawMarkdown);
  //     const sanitizedHtml = DOMPurify.sanitize(marked(rawMarkdown));

      
  //   const wrappedHtml = `<div class="bot-response">${sanitizedHtml}</div>`;

  //   const newBotMessage = {
  //     type: 'bot',
  //     content: wrappedHtml
  //   };
  //     setChatHistory(prevHistory => [...prevHistory, newBotMessage]);
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     const errorMessage = {
  //       type: 'bot',
  //       content: `An error occurred: ${error.message}`
  //     };
  //     setChatHistory(prevHistory => [...prevHistory, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //     setUserInput('');
  //   }
  // };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || isInitializing) return;

    const newUserMessage = { type: 'user', content: userInput };
    setChatHistory(prevHistory => [...prevHistory, newUserMessage]);
    setIsLoading(true);
    setUserInput('');

    console.log("JWT Token:", jwtToken);

    try {
      const response = await fetch(`${baseURL}/chat`, {
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
      await simulateTyping(`<div class={styles['bot-response']}>${sanitizedHtml}</div>`);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = `An error occurred: ${error.message}`;
      setChatHistory(prevHistory => [...prevHistory, { type: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className={styles['chat-page']}>
<button 
  className={styles['menu-button']} 
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
>
  <svg viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
</button>

<div 
  className={`${styles['sidebar-overlay']} ${isSidebarOpen ? styles.open : ''}`}
  onClick={() => setIsSidebarOpen(false)}
></div>

<div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
    {nftDetails && (
      <>
      <div className={styles['nft-image-container']}>
    <img
      src={nftDetails.image}
      alt={nftDetails.name || 'Unnamed NFT'}
      className={styles['nft-image']}
    />
    </div>
      <div className={styles.chatTitle}>
        <h2>{nftDetails.name || 'Unnamed NFT'}</h2>
        <h4>{nftDetails.collection || 'Unknown'}</h4>
      </div>
        <p>{nftDetails.description || 'No description available'}</p>
        {/* <div className={styles['model-info']}>
        <div className={styles['model-tag']} onClick={toggleModelFeatures}>
                <span className={styles['model-name']}>
                  Model: {nftDetails.model || 'Unknown'}
                </span>
                <span className={styles['arrow-down']}></span>
              </div>
              {isModelFeaturesOpen && (
                <ul className={styles['model-features']}>
                  <li>Content window: 16k</li>
                </ul>
              )}
            </div> */}
            {nftDetails.attributes && nftDetails.attributes.length > 0 && (
        <div className={styles.attributesGrid}>
          {nftDetails.attributes.map((attr, index) => (
            <div key={index} className={styles.attributeItem}>
              <p className={styles.attributeType}>{attr.trait_type}</p>
              <p className={styles.attributeValue}>{attr.value}</p>
            </div>
          ))}
        </div>
      )}
      </>
    )}
  </div>
    <div className={styles['chat-container']}>
      
      <h2 className={styles['chat-header']}>{nftDetails.name}</h2>
      <div className={styles['chat-messages']}>
      <div className={styles['chat-messages']}>
          {chatHistory.map((message, index) => (
            <div key={index} className={`${styles.message} ${styles[`${message.type}-message`]}`}>
              {message.type === 'bot' ? (
                <div className={styles['bot-para']} dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : (
                <p className={styles['message']}>{message.content}</p>
              )}
            </div>
          ))}
          {isTyping && (
            <div className={styles['message bot-message']}>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {isLoading && (
          <div className={styles['loading-indicator']}></div>
        )}
      </div>
      <div className={styles['chat-input-container']}>
      {isInitializing && (
          <div className={styles['initializing-message']}>Initializing your model...</div>
        )}
        <input
          className={styles['chat-input']}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
          // disabled={isLoading || isInitializing}
        />
        <button 
          className={styles['send-button']}
          onClick={sendMessage} 
          disabled={isLoading || isInitializing}
        >
          <svg className={styles['send-icon']} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    </div>
  );
}

export default Chat;