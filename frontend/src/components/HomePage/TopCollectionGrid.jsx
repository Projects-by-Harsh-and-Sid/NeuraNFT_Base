import React, { useEffect, useState, useRef } from "react";
import styles from './styles/topcollectiongrid.module.css';
import { useNavigate } from 'react-router-dom';
import temp from './Images//temp.jpg'; // Adjust the path based on your project structure
import temp2 from './Images//temp2.png'; // Adjust the path based on your project structure
import temp3 from './Images//temp3.png'; // Adjust the path based on your project structure
import temp4 from './Images//temp4.png'; // Adjust the path based on your project structure
import temp5 from './Images//temp5.png'; // Adjust the path based on your project structure
import temp6 from './Images//temp6.png'; // Adjust the path based on your project structure
import temp7 from './Images//temp7.png'; // Adjust the path based on your project structure

const collections = [
  {
    id: 1,
    name: "Neural Mint Hub",
    image: temp7,
    description: "Mint your NFTs here",
  },
  {
    id: 2,
    name: "Quantum Rewards",
    image: temp2,
    description: "Earn rewards for minting NFTs",
  },
  {
    id: 3,
    name: "AI Profile Architect",
    image: temp3,
    description: "Customize your profile page",
  },
  {
    id: 4,
    name: "Algorithmic Daily Drops",
    image: temp4,
    description: "Daily NFT drops",
  },
  {
    id: 5,
    name: "Digital Personas",
    image: temp5,
    description: "Mint your NFTs here",
  },
  {
    id: 6,
    name: "Synthetic Sidekicks",
    image: temp6,
    description: "Mint your NFTs here",
  },
  {
    id: 7,
    name: "Virtual Companions",
    image: temp,
    description: "Mint your NFTs here",
  },
  {
    id: 8,
    name: "Cyber Entities",
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
                {/* <p>{collection.description}</p> */}
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
