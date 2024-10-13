// CreateNFT.js
import React, { useState, useRef ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Upload, X, Image , Brain } from 'lucide-react';
// import { useAppContext } from './WalletContext';
import styles from './styles/CreateNFT.module.css'; // Updated import
import { Alert, Snackbar } from '@mui/material';
import { useAppContext } from '../../WalletContext';
import { fetchData } from '../Utils/datafetch';
import ProgressBar from './ProgressBar'; // Adjust the path based on your file structure
import { signJsonData } from '../Utils/signData'; // Adjust the path based on your file structure
import uploadImage from '../Utils/imageupload';

import convertPdfToText from '../Utils/upload_data';
import { createNFT, createNFTMetadata } from '../Utils/signData';
import { extractNFTIdFromTransaction } from '../Utils/signData';






function CreateNFT () 
{
  const navigate                              = useNavigate();
  const [name, setName]                       = useState('');
  const [description, setDescription]         = useState('');
  const [selectedModel, setSelectedModel]     = useState('');
  const [nftImagePreview, setNftImagePreview] = useState(null);
  const [nftImage, setNftImage]               = useState(null);
  const [ImageType, setImageType] = useState('');


  const [pdfFiles, setPdfFiles]               = useState([]);
  // const { actor, authClient }                  = useAppContext();
  const totalSteps                            = 3; // Total number of steps (index starts from 0)
  const fileInputRef                          = useRef(null);
  const imageInputRef                         = useRef(null);
  const [nftCreated, setNftCreated]           = useState(false);
  const [currentStep, setCurrentStep]         = useState(0);
  const [collectionsid, setCollectionsId]     = useState({});
  const [isUploading, setIsUploading]         = useState(false);
  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  
  
  // console.log('Inside CreateNFT.jsx');

  useEffect(() => {
    console.log("Inside useEffect of CreateNFT.jsx");
    
    // Function to fetch collection data
    async function fetchCollectionData()
      {
          try {
            const allCollections = await fetchData('allCollections');
            const collection_data_map = {};

            for (const collection of allCollections) 
              {
                collection_data_map[collection.id] = collection.name;
              }

            setCollectionsId(collection_data_map);
          } 
          catch (error) 
          {
            console.error("Error fetching collection data:", error);
          }
      };

    fetchCollectionData();
  }, []);

  const incrementStep           = () => {setCurrentStep((prevStep) => (prevStep < totalSteps ? prevStep + 1 : prevStep));};
  const handleNameChange        = (event) => setName(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);
  const handleModelChange       = (event) => setSelectedModel(event.target.value);

  function handleImageChange (event) 
  {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNftImage(file);
      setImageType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNftImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };


  function handleFileChange(event)  
  {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length !== files.length) {
      alert('Please select only PDF files');
    }

    setPdfFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setPdfFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
// -------------------------------------------------------------------------------- old implementation of uploadNFT function --------------------------------------------------------------------------------
  // const uploadNFT = async () => {
  //   if (!nftImage || pdfFiles.length === 0 || !name || !description || !selectedModel) {
  //     alert('Please fill in all fields and upload required files');
  //     return;
  //   }

  //   try {
  //     const pdfContents = await Promise.all(pdfFiles.map(file => file.arrayBuffer()));
  //     const pdfContentArrays = pdfContents.map(buffer => Array.from(new Uint8Array(buffer)));

  //     const identity = '12345456'
  //     const userPrincipal = identity.getPrincipal();

  //     const nftImageArray = Array.from(new Uint8Array(await nftImage.arrayBuffer()));

  //     const input = {
  //       pdf_contents: pdfContentArrays,
  //       name: name,
  //       description: description,
  //       selected_model: selectedModel,
  //       owner_principal: userPrincipal,
  //       nft_image: nftImageArray
  //     };

  //     // TODO: react -> flask -> blockchain
  //     // const tokenId = await actor.process_pdfs_and_mint_nft(input);// rust 
  //     // setNftCreated(true);
  //     // console.log('NFT minted with token ID:', tokenId);
  //     // alert(`NFT minted with token ID: ${tokenId}`);
  //   } catch (error) {
  //     console.error('Error processing PDFs and minting NFT:', error);
  //     alert('Error processing PDFs and minting NFT');
  //   }
  // };

  // -------------------------------------------------------------------------------- constellation implementation of uploadNFT function --------------------------------------------------------------------------------
  async function uploadNFT() 
  {
    // run this for 5 secs
    

    console.log("Inside uploadNFT function");

    // if (!nftImage || pdfFiles.length === 0 || !name || !description || !selectedModel) {
    //   alert('Please fill in all fields and upload required files');
    //   return;
    // }


    try {

      


      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // ---------------------------------------------------Getting Data-------------------------------------------------------------------------------------------------------------------
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      setIsUploading(true);

      // // // start
      // // Sign the jsonData using TronLink
      // const signatureResult = await signJsonData(jsonData);
  
      // if (!signatureResult) {
      //   alert('Error signing data');
      //   setIsUploading(false);
      //   return;
      // }


      const nftImageArray   = Array.from(new Uint8Array(await nftImage.arrayBuffer()));
      const image_url       = await uploadImage(nftImageArray,ImageType); 
      const data_url        = await convertPdfToText(pdfFiles[0]); // yet to be implemented



      const collectionID    = selectedModel;
      const accesslevel     = 6;
      const NFTname         = name;

      const metadata =             {
                                      image: image_url,
                                      baseModel: "llama-3.1",
                                      data: data_url,
                                      rag: "",
                                      fineTuneData: "",
                                      description: description
                                  }

      // const metadata =  ( image_url,
      //                     "llama-3.1",
      //                     data_url,
      //                     "",
      //                     "",
      //                     description
      //                     );



      console.log("collectionID : ",collectionID);
      console.log("NFTname : ",NFTname);
      console.log("accesslevel : ",accesslevel);
      console.log("metadata : ",metadata);

      incrementStep();
      // // // end


      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // ---------------------------------------------------Mininting NFT-------------------------------------------------------------------------------------------------------------------
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      
      // // // // // start
      
      console.log("-----------------------------------Minting NFT-----------------------------------");


      // wait for 5 seconds
      
      // collectionid, name, accesslevel = 6
      
      const nftResult = await createNFT(collectionID, NFTname, accesslevel);
      
      console.log('NFT created:', nftResult);

      await new Promise(resolve => setTimeout(resolve, 5000));


      const newNFTId = await extractNFTIdFromTransaction(nftResult);

      console.log('New NFT ID:', newNFTId);



      incrementStep();

      // // // // end
      
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // ---------------------------------------------------Creating MetaData-------------------------------------------------------------------------------------------------------------------
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


      // collectionid, nftid, metadata

      await new Promise(resolve => setTimeout(resolve, 5000));

      // const collectionID    = 13;
      // const accesslevel     = 6;
      // const NFTname         = "name";

      // const metadata =             {
      //                                 "image": "image_url",
      //                                 "baseModel": "llama-3.1",
      //                                 "data": "data_url",
      //                                 "rag": "",
      //                                 "fineTuneData": "",
      //                                 "description": "description"
      //                             }

      // const newNFTId = 1;

      const metadataResult = await createNFTMetadata(collectionID, parseInt(newNFTId), metadata);
      console.log('Metadata created:', metadataResult);




      incrementStep();
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // ---------------------------------------------------Finalizing-------------------------------------------------------------------------------------------------------------------
      // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      await new Promise(resolve => setTimeout(resolve, 3000));


      setIsUploading(false);

      setNftCreated(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigate(`/collection/${collectionID}`);












    } catch (error) {
    //   console.error('Error processing PDFs and minting NFT:', error);
    //   alert('Error processing PDFs and minting NFT');
    }























  };
  // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  const handleCloseAlert = () => {
    setNftCreated(false);
  };

  return (
    <div className={styles.createNftContainer}>
      <Snackbar 
        open={!!nftCreated}
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          NFT Created Successfully!
        </Alert>
      </Snackbar>
      
      <button 
        className={styles.backButton}
        onClick={() => navigate('/')}
      >
        Back to Main
      </button>

    <ProgressBar currentStep={currentStep} />
     <div className={`${styles.createNftForm} ${isUploading ? styles.uploading : ''}`}>
        <div className={styles.formGroup}>
          <label>NFT Image</label>
          <div className={styles.nftImagePreview}>
            <div className={styles.nftImageCircle}>
              {nftImagePreview ? (
                <img src={nftImagePreview} alt="NFT Preview" />
              ) : (
                <Image size={40} />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              ref={imageInputRef}
              className={styles.hiddenInput}
            />
            <button 
              onClick={() => imageInputRef.current.click()}
              className={styles.changePhotoButton}
            >
              {nftImage ? 'Change Photo' : 'Select Photo'}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.nameLabel}>Name of NFT</label>
          <input 
            type="text" 
            value={name} 
            onChange={handleNameChange}
            className={styles.textInputname}
            placeholder="Enter NFT name"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.descLabel}>Description</label>
          <textarea 
            value={description} 
            onChange={handleDescriptionChange}
            className={styles.textInputdesc}
            placeholder="Enter NFT description"
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.selectLabel}>Select Collection</label>
          {/* <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className={styles.selectInput}
          >
            <option value="">Select a model</option>
            <option value="Llama 3.1">Llama 3.1</option>
            <option value="Llama 70b">Llama 70b</option> */}
            <select value={selectedModel} onChange={handleModelChange} className={styles.selectInput}>
                <option value="" disabled selected>Select a model</option>
                    {Object.entries(collectionsid).map(([id, name]) => 
                        (<option key={id} value={id}> 
                            {id} : {name}
                          </option>
                        ))
                      }
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.uploadLabel}>Upload Knowledge. Fine Tune Your Model</label>
          <div className={styles.pdfUploadArea}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf" 
              onChange={handleFileChange} 
              multiple
              className={styles.hiddenInput}
            />
            {pdfFiles.length > 0 ? (
              <div className={styles.pdfFileList}>
                {pdfFiles.map((file, index) => (
                  <div key={index} className={styles.pdfFileItem}>
                    <div className={styles.pdfIcon}>PDF</div>
                    <span className={styles.pdfName}>{file.name}</span>
                    <button onClick={() => handleRemoveFile(index)} className={styles.removeFileButton}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Click the attach button</p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => fileInputRef.current.click()}
              className={styles.attachButton}
            >
              <Paperclip size={20} /> Attach
            </button>
            <button 
              onClick={uploadNFT}
              className={styles.uploadButton}
            >
              <Brain size={20} /> {isUploading ? 'Tokenizing...' : 'Tokenize Knowledge'}
            </button>
            {/* <button onClick={incrementStep} className={styles.nextButton}>
          Next Step
        </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
