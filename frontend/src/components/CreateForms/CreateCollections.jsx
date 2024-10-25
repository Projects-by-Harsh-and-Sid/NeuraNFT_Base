import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { Image } from 'lucide-react';
// import { mintNFTData } from './metagraph_scripts/mint_functions';
import styles from './styles/nft_collections.module.css';
import { useAppContext } from '../../WalletContext';
import uploadImage from '../Utils/imageupload';
import {createCollection} from '../Utils/signData';

const CreateNFTCollection = () => {
  const navigate = useNavigate();
  const { coinbaseState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [ImageType, setImageType] = useState('');
  const [collectionImagePreview, setCollectionImagePreview] = useState(null);
  const [collectionImage, setCollectionImage] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState('');
  const imageInputRef = useRef(null);

  // console.log('Address:', address);

  const handleCollectionNameChange = (event) => setCollectionName(event.target.value);
  const handleCollectionDescriptionChange = (event) => setCollectionDescription(event.target.value);
  const handleModelChange = (event) => setSelectedModel(event.target.value);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCollectionImage(file);
      setImageType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollectionImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  

  const handleMintCollection = async () => {
    if (!collectionImage || !collectionName || !selectedModel) {
      alert('Please fill in all fields and upload the collection image');
      return;
    }
  
    setIsMinting(true);
    setMintResult('');
  
    try {
      const imageData = Array.from(new Uint8Array(await collectionImage.arrayBuffer()));

      const image_url = await uploadImage(imageData,ImageType); 
      console.log('Image URL:', image_url);

        try {
            const result = await createCollection(
                collectionName,
                1024,
                selectedModel,
                image_url,
                collectionDescription
            );
            console.log('Collection created:', result);
            setMintResult('NFT Collection minted successfully!');
            navigate('/profile');
            // Handle successful creation (e.g., show success message to user)
        } catch (error) {
            console.error('Failed to create collection:', error);
            setMintResult(`Error: ${error.message}`);
            // Handle error (e.g., show error message to user)
        }
      // console.log('Image Data:', imageData);

      // await mintNFTData({
      //   name: collectionName,
      //   description: collectionDescription,
      //   model: selectedModel,
      //   image: imageData,
      // });


    } catch (error) {
      console.error('Error minting NFT Collection:', error);
      setMintResult(`Error: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleCloseAlert = () => {
    setMintResult('');
  };

  return (
    <div className={styles['create-nft-container']}>
      <Snackbar 
        open={!!mintResult}
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={mintResult.includes('Error') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {mintResult}
        </Alert>
      </Snackbar>



      <button 
        className={styles['back-button']}
        onClick={() => navigate('/')}
      >
        Back to Main
      </button>

      <div className={`${styles['create-nft-form']} ${isMinting ? styles.minting : ''}`}>
        <h1 className={styles['nft-mint-collection-header']} >Mint NFT Collection</h1>
        <div className={styles['form-group']}>
          <label className={styles['collection-image-label']}>Collection Image</label>
          <div className={styles['nft-image-preview']}>
            <div className={styles['nft-image-circle']}>
              {collectionImagePreview ? (
                <img src={collectionImagePreview} alt="Collection Preview" />
              ) : (
                <Image size={40} />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              ref={imageInputRef}
              className={styles['hidden-input']}
            />
            <button 
              onClick={() => imageInputRef.current.click()}
              className={styles['change-photo-button']}
            >
              {collectionImage ? 'Change Photo' : 'Select Photo'}
            </button>
          </div>
        </div>

        <div className={styles['form-group']}>
          <label className={styles['name-label']}>Name of Collection</label>
          <input 
            type="text" 
            value={collectionName} 
            onChange={handleCollectionNameChange}
            className={styles['text-input']}
            placeholder="Enter collection name"
          />
        </div>

        <div className={styles['form-group']}>
          <label className={styles['desc-label']}>Description</label>
          <textarea 
            value={collectionDescription} 
            onChange={handleCollectionDescriptionChange}
            className={styles['text-input']}
            placeholder="Enter collection description"
            rows="3"
          />
        </div>

        <div className={styles['form-group']}>
          <label className={styles['select-label']}> Select Base Model</label>
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className={styles['select-input']}
          >
            <option value="">Select a model</option>
            <option value="Llama 3.1">Llama 3.1</option>
            <option value="Llama 70b">Llama 70b</option>
          </select>
        </div>

        <div className={styles['form-group']}>
          <label className={styles['upload-label']}>Input fine tune data for custom model</label>
          <div className={styles['pdf-upload-area']}>
            <p>Coming Soon..</p>

          </div>
          </div>
        

        <div className={styles['button-group']}>
          <button 
            onClick={handleMintCollection}
            className={styles['upload-button']}
            disabled={isMinting}
          >
            {isMinting ? 'Minting...' : 'Mint Collection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNFTCollection;