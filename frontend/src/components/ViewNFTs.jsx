import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ViewNFTs.module.css';
import TopBar from './TopBar';
import temp from './temp.jpg'; // Placeholder image
import { useAppContext } from '../AppContext';


const ViewCollectionNFTs = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);

  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();

  useEffect(() => {
    // Fetch collection and NFT data
    // This is a placeholder. Replace with actual API calls
    fetchCollectionData();
    fetchNFTs();
  }, [collectionId]);

  const fetchCollectionData = () => {
    // Placeholder data. Replace with actual API call
    setCollection({
      id: collectionId,
      name: 're:generates',
      image: temp,
      address: '0x1234...5678',
      floorPrice: '0.004 ETH',
      topOffer: '0.003 WETH',
      volume: '11 ETH'
    });
  };

  const fetchNFTs = () => {
    // Placeholder data. Replace with actual API call
    setNfts([
      { id: 1, name: 'NFT #1854', image: temp, price: '0.004 ETH' },
      { id: 2, name: 'NFT #2628', image: temp, price: '0.004 ETH' },
      { id: 3, name: 'NFT #2061', image: temp, price: '0.004 ETH' },
      // Add more NFTs as needed
    ]);
  };

  const handleNFTClick = (nftId) => {
    navigate(`/nft/${nftId}`);
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
          <p className={styles.collectionAddress}>{collection.address}</p>
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
          <div key={nft.id} className={styles.gridItem} onClick={() => handleNFTClick(nft.id)}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            <div className={styles.nftDetails}>
              <h3>{nft.name}</h3>
              <p>{nft.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewCollectionNFTs;