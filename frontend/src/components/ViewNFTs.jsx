import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ViewNFTs.module.css';
import TopBar from './TopBar';
import temp from './temp.jpg'; // Placeholder image
import { useAppContext } from '../AppContext';
import NFTDetailPopup from './NFTPopup'; // Import the NFTDetailPopup component
import { fetchData } from './Utils/datafetch';

const ViewCollectionNFTs = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [collectionAddress, setCollectionAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState(null);
  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();

  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
    //   setIsLoading(true);
    const collectionIdInt = parseInt(collectionId, 10);
      const collectionData = fetchData('collection_from_id', collectionIdInt);
      if (collectionData && collectionData.myCollections && collectionData.myCollections.length > 0) {
        const fetchedCollection = collectionData.myCollections[0];
        setCollection(fetchedCollection);
        fetchCollectionNFTs(fetchedCollection.collectionaddress);
      } else {
        setError('Collection not found');
      }
    } catch (err) {
      setError('Error fetching collection data');
      console.error(err);
    } 
  };

  const fetchCollectionNFTs = (collectionAddress) => {
    try {
      const collectionNFTs = fetchData('collection_nft', collectionAddress);
      if (collectionNFTs && collectionNFTs.myNFTs) {
        setNfts(collectionNFTs.myNFTs);
      } else {
        setNfts([]);
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setNfts([]);
    }
  };

  
  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    setIsPopupOpen(true);
  };


  if (!collection) {
    return <div>Loading...</div>;
  }
  const handleCreateNFTs = () => {
    navigate('/create_nft');
  };

  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } else {
      disconnectWallet();
    }
  };


  return (
    <div className={styles.container}>
   <TopBar onConnectWallet={handleConnectWallet} />
      
      <div className={styles.collectionInfo}>
        <img src={collection.image} alt={collection.name} className={styles.collectionImage} />
        <div className={styles.collectionDetails}>
          <h2 className={styles.collectionName}>{collection.name}</h2>
          <p className={styles.collectionAddress}>{collection.collectionaddress}</p>
        </div>
      </div>

      {/* <div className={styles.collectionStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Floor Price</span>
          <span className={styles.statValue}>{collection.floorPrice}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Top Offer</span>
          <span className={styles.statValue}>{collection.topOffer}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>24h Vol</span>
          <span className={styles.statValue}>{collection.volume}</span>
        </div>
      </div> */}

      

      <div className={styles.gridContainer}>
      <div className={`${styles.gridItem} ${styles.createNew}`} onClick={handleCreateNFTs}>
          <div className={styles.createNewContent}>
            <span className={styles.plusSign}>+</span>
            {/* <p>Create New Collection</p> */}
          </div>
        </div>
        {nfts.map((nft) => (
           <div key={nft.id} className={styles.gridItem} onClick={() => handleNFTClick(nft)}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            <div className={styles.nftDetails}>
              <h3>{nft.name}</h3>
              {/* <p>{nft.price}</p> */}
            </div>
          </div>
        ))}
      </div>
      {isPopupOpen && selectedNFT && (
        <NFTDetailPopup
          nft={selectedNFT}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ViewCollectionNFTs;