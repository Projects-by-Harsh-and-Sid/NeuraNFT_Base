import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ViewCollection.module.css';
import TopBar from './Common_Components/TopBar';
import { useAppContext } from '../WalletContext';
import DefaultImage from './DefaultImage.jpg'; // Placeholder image

const ViewCollection = () => {
  const navigate = useNavigate();
  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();

  // Dummy data for collections (replace with actual data fetching)
  const collections = [
    { id: 1, name: 'Collection 1', image: DefaultImage  },
    { id: 2, name: 'Collection 2', image: DefaultImage },
    { id: 3, name: 'Collection 3', image: DefaultImage },
    // Add more collections as needed
  ];

  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || 'Connect to Wallet';
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/collection/${collectionId}`);
  };

  const handleCreateCollection = () => {
    navigate('/create_collection');
  };

  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } else {
      disconnectWallet();
    }
  };

  // can make a function for selective rendering of collections based on user. if user clicks all collection then all collections will be shown
  // if user clicks on his collection then only his collections will be shown which are mapped to his address

  return (
    <div className={styles.container}>
      <TopBar onConnectWallet={handleConnectWallet} />
      
      <div className={styles.userInfo}>
        <img src={DefaultImage} alt="User" className={styles.userImage} />
        <h2 className={styles.userAddress}>{formatAddress(address)}</h2>
      </div>
{/* 
      <div className={styles.collectionStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Floor Price</span>
          <span className={styles.statValue}>0.004 ETH</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Top Offer</span>
          <span className={styles.statValue}>0.003 WETH</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>24h Vol</span>
          <span className={styles.statValue}>11 ETH</span>
        </div>
      </div> */}

      <div className={styles.gridContainer}>
        <div className={`${styles.gridItem} ${styles.createNew}`} onClick={handleCreateCollection}>
          <div className={styles.createNewContent}>
            <span className={styles.plusSign}>+</span>
            {/* <p>Create New Collection</p> */}
          </div>
        </div>
        {collections.map((collection) => (
          <div key={collection.id} className={styles.gridItem} onClick={() => handleCollectionClick(collection.id)}>
            <img src={collection.image} alt={collection.name} className={styles.collectionImage} />
            <div className={styles.collectionDetails}>
              <h3>{collection.name}</h3>
              {/* <p>Floor: {collection.floorPrice}</p>
              <p>Top Offer: {collection.topOffer}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewCollection;