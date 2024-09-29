import React, { useEffect, useState, useRef } from "react";
import styles from './styles/topcollectiongrid.module.css';
import { useNavigate } from 'react-router-dom';
import temp from './Images//temp.jpg'; // Adjust the path based on your project structure
const collections = [
  {
    id: 1,
    name: "Mint Terminal",
    image: temp,
    description: "Mint your NFTs here",
  },
  {
    id: 2,
    name: "Diamond Rewards",
    image: temp,
    description: "Earn rewards for minting NFTs",
  },
  {
    id: 3,
    name: "New Profile Page",
    image: temp,
    description: "Customize your profile page",
  },
  {
    id: 4,
    name: "On Chain Daily",
    image: temp,
    description: "Daily NFT drops",
  },
  {
    id: 5,
    name: "Capy Friends",
    image: temp,
    description: "Mint your NFTs here",
  },
  {
    id: 6,
    name: "Capy Friends",
    image: temp,
    description: "Mint your NFTs here",
  },
  {
    id: 7,
    name: "Capy Friends",
    image: temp,
    description: "Mint your NFTs here",
  },
  {
    id: 8,
    name: "Capy Friends",
    image: temp,
    description: "Mint your NFTs here",
  },
];

function TopCollectionGrid() {
  const collectionsRef = useRef(null);
  const navigate = useNavigate();

  const scrollCollections = (direction) => {
    if (collectionsRef.current) {
      const scrollAmount = direction === "right" ? 240 : -240; // Adjust as needed
      collectionsRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleExploreClick = (id) => {
    navigate(`/collection/${id}`);
  };

  return (
    <div className={styles.collectionsmainContainer}>
      <h2 className={styles.collectionheader}> Popular Collections</h2>
      <div className={styles.collectionsContainer}>
        <button
          className={styles.scrollArrowLeft}
          onClick={() => scrollCollections("left")}
        >
          &#8249;
        </button>

        <div className={styles.collectionsGrid} ref={collectionsRef}>
          {collections.map((collection) => (
            <div key={collection.id} className={styles.collectionCard}>
              <img src={collection.image} alt={collection.name} />
              <h3 className={styles.collectionCardTitle}>{collection.name}</h3>
              <div className={styles.overlay}>
                <p>{collection.description}</p>
                <button
                  className={styles.overlayButton}
                  onClick={() => handleExploreClick(collection.id)}
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className={styles.scrollArrowRight}
          onClick={() => scrollCollections("right")}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}

export default TopCollectionGrid;
