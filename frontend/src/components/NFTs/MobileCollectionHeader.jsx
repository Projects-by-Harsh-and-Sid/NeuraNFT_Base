// MobileCollectionHeader.js
import React, { useState } from 'react';
import styles from './styles/MobileCollectionHeader.module.css';

const MobileCollectionHeader = ({ collection, DefaultImage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={styles.headerStrip}>
        <div className={styles.headerContent}>
          <div className={styles.thumbnailImage}>
            <img src={collection.image || DefaultImage} alt={collection.name} />
          </div>
          <h2 className={styles.collectionName}>{collection.name}</h2>
          <button className={styles.toggleButton} onClick={togglePopup}>
            {isOpen ? '▼' : '▲'}
          </button>
        </div>
      </div>

      <div className={`${styles.popup} ${isOpen ? styles.popupOpen : ''}`}>
        <div className={styles.popupHeader}>
          <h2 className={styles.collectionName}>{collection.name}</h2>
          <button className={styles.closeButton} onClick={togglePopup}>
            ✕
          </button>
        </div>
        
        <div className={styles.popupContent}>
          <p className={styles.description}>{collection.description}</p>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>No. of Servers</div>
            <p className={styles.infoValue}>{collection.noOfServers}</p>
          </div>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Model</div>
            <p className={styles.infoValue}>{collection.model}</p>
          </div>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Date Created</div>
            <p className={styles.infoValue}>
              {new Date(parseInt(collection.dateCreated, 10) * 1000).toLocaleDateString()}
            </p>
          </div>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Unique Holders</div>
            <p className={styles.infoValue}>{collection.uniqueHolders}</p>
          </div>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Context Window</div>
            <p className={styles.infoValue}>{collection.contextWindow}</p>
          </div>
          
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Number of NFTs</div>
            <p className={styles.infoValue}>{collection.noOfNFTs}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileCollectionHeader;