import React, { useEffect, useState, useRef } from "react";
import styles from './styles/topcollectiongrid.module.css';
import { useNavigate } from 'react-router-dom';
import { fetchData } from "../Utils/datafetch";


function TopCollectionGrid() {

  useEffect(() => {
    (async () => {
      const allCollectionsData = await fetchData("allCollections");
      console.log("Collectiondata",allCollectionsData);
      setCollections(allCollectionsData);

    })();
  }, []);
  
  const collectionsRef = useRef(null);
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);

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
