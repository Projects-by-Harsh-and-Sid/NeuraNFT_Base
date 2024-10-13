import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/ViewNFTs.module.css';
import TopBar from '../Common_Components/TopBar';
import DefaultImage from './DefaultImage.jpg'; // Placeholder image
import { useAppContext } from '../../WalletContext';
import NFTDetailPopup from './NFTPopup'; // Import the NFTDetailPopup component
import { fetchData } from '../Utils/datafetch';
import Loading from './Loading';

const ViewCollectionNFTs = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [collectionAddress, setCollectionAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  // const [selectNFTidForPopup, setselectNFTidForPopup] = useState(null);
  // const [selectCollectionidForPopup, setselectCollectionidForPopup] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState(null);
  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  const [nftLoaded, setNftLoaded] = useState(false);

  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
    //   setIsLoading(true);
    const collectionIdInt = parseInt(collectionId, 10);
      const collectionData = await fetchData('collection_from_id', collectionIdInt);
      console.log("Collectiondata",collectionData);
      if (collectionData) {
        const fetchedCollection = collectionData;
        setCollection(fetchedCollection);
        await fetchCollectionNFTs(fetchedCollection.id);
      } else {
        setError('Collection not found');
      }
    } catch (err) {
      setError('Error fetching collection data');
      console.error(err);
    } 
  };

  const fetchCollectionNFTs = async (id) => {
    try {
      const collectionNFTs = await fetchData('collection_nft', id);
      console.log("NFT DATA",collectionNFTs);
      if (collectionNFTs) {
        setNfts(collectionNFTs);
      } else {
        setNfts([]);
      }
      setNftLoaded(true);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setNfts([]);
    }
  };

  
  const handleNFTClick = async (nftid) => {
    // setselectNFTidForPopup(nftid);
    // setselectCollectionidForPopup(collectionid);
    const fetchedNFT = await fetchData('compounded_nft',collectionId, nftid);
    setSelectedNFT(fetchedNFT);
    setIsPopupOpen(true);
  };




  if (!collection) { 
    return <Loading />;
  }

  if(!nftLoaded){
    return <Loading />;
  }
  const handleCreateNFTs = () => {
    navigate('/create_nft');
  };

  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } 
    // else {
    //   disconnectWallet();
    // }
  };


  return (
    <div className={styles.container}>
   <TopBar onConnectWallet={handleConnectWallet} />
      
   {/* <div className={styles.collectionInfo}>
        <img src={collection.image || DefaultImage} alt={collection.name} className={styles.collectionImage} />
        <div className={styles.collectionDetails}>
          <h2 className={styles.collectionName}>{collection.name}</h2>
          <p className={styles.collectionAddress}>{collection.collectionaddress}</p>
          <p className={styles.collectionDescription}>{collection.description}</p>
        </div>
      </div> */}
            <div className={styles.collectionInfo}>
              <div className={styles.collectionImage}>
              <img src={collection.image || DefaultImage} alt={collection.name}  />
        </div>
        <div className={styles.collectionDetails}>
          <div className={styles.collectionHeader}>
            <h2 className={styles.collectionName}>{collection.name}</h2>
            <div className={styles.serverInfo2}>
              <p className={styles.serverInfo}>No. of Servers</p>
              <p className={styles.serverCount}>{collection.noOfServers}</p>
            </div>
            <div className={styles.serverInfo}>
            <p className={styles.serverInfo}>Model:</p>
              <span className={styles.serverCount}>{collection.model}</span>
            </div>
            <div className={styles.serverInfo}>
            <p className={styles.serverInfo}>Date Created: </p>
            
              <span className={styles.serverCount}>{new Date(parseInt(collection.dateCreated,10) * 1000).toLocaleDateString()}</span>
              {/* <span className={styles.serverCount}>{collection.dateCreated}</span> */}

            </div>
            <div className={styles.serverInfo}>
            <p className={styles.serverInfo}>Unique Holders</p>
              <span className={styles.serverCount}>{collection.uniqueHolders}</span>
            </div>
            <div className={styles.serverInfo}>
            <p className={styles.serverInfo}>ContextWindow: </p>
              <span className={styles.serverCount}>{collection.contextWindow}</span>
            </div>
            <div className={styles.serverInfo3}>
            <p className={styles.serverInfo}>Number of NFTs: </p>
              <span className={styles.serverCount}>{collection.noOfNFTs}</span>
            </div>
          </div>
          

          <p className={styles.collectionDescription}>{collection.description}</p>
        </div>
      </div>

      

      <div className={styles.gridContainer}>
      <div className={`${styles.gridItem} ${styles.createNew}`} onClick={handleCreateNFTs}>
          <div className={styles.createNewContent}>
            <span className={styles.plusSign}>+</span>
            {/* <p>Create New Collection</p> */}
          </div>
        </div>
        {nfts.map((nft) => (
           <div key={nft.id} className={styles.gridItem} onClick={() => handleNFTClick(nft.id)}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            <div className={styles.nftDetails}>
              <h3>{nft.name}</h3>
              {/* <p>{nft.price}</p> */}
            </div>
          </div>
        ))}
      </div>
      {isPopupOpen && (
        <NFTDetailPopup
          // nftid={selectNFTidForPopup}
          // collectionid={collectionId}
          nft={selectedNFT}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ViewCollectionNFTs;