import allnfts from "./Images/allnfts.jpg";
import mynfts from "./Images/mynfts.jpg";
import night from "./Images/night.jpg";
import create from "./Images/create.jpg"; // Adjust the path based on your project structure
import planet_image from "./Images/planet.jpg"; // Adjust the path based on your project structure
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRef } from "react";
import styles from './styles/actiongrid.module.css';
import { useCommonLogic } from './CommonComponet'; // Adjust the path as needed







function ActionGrid({ setActiveTab, allCollectionsRef, scrollToSection }) {
    const {
      navigate,
      handleCreateCollection,
    } = useCommonLogic();

const actions = [
    {
      id: 1,
      name: "Your Collections",
      image: create,
      description: "See all the collections you have created",
      action: () => navigate("/profile"),
    },
    {
      id: 2,
      name: "All Collections",
      image: planet_image,
      description: "See all the collections created by everyone",
      action: () => {
        setActiveTab("allCollections");
        scrollToSection(allCollectionsRef);
      },
    },
    {
      id: 3,
      name: "Create Collections",
      image: night,
      description: "Create a new collection",
      action: handleCreateCollection,
    },
    {
      id: 4,
      name: "Your NFTs",
      image: allnfts,
      description: "See all the NFTs you own",
      action: () => navigate("/profile"),
    },
    {
      id: 5,
      name: "All NFTs",
      image: mynfts,
      description: "See all the NFTs created by everyone",
      action: () => {
        setActiveTab("allNFTs");
        scrollToSection(allCollectionsRef);
      },
    },
    // { id: 4, name: 'onchain gaias', image: gradient },
  ];



  return (
    <div>
      {/* <div className={styles.actionsContainer}>
      <button className={styles.scrollArrowLeft} onClick={() => scrollGrid(actionsRef, 'left')}>
            &#8249;
          </button> */}
      {/* <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <div
            key={action.id}
            className={styles.actionCard}
            onClick={action.action}
          >
            <img src={action.image} alt={action.name} />
            <h3 className={styles.actionCardTitle}>{action.name}</h3>
          </div>
        ))}
      </div> */}
      {/* <div className={styles.actionsGrid}>
  {actions.map((action) => (
    <div key={action.id} className={styles.actionCard} onClick={action.action}>
      <img src={action.image} alt={action.name} />
      <div className={styles.actionCardContent}>
        <h3 className={styles.actionCardTitle}>{action.name}</h3>
        <p className={styles.actionCardInfo}>{action.description}</p>
      </div>
    </div>
  ))}
</div> */}
<div className={styles.actionsGrid}>
  {actions.map((action) => (
    <div key={action.id} className={styles.actionCard} onClick={action.action}>
      <img src={action.image} alt={action.name} />
      {/* <h3 className={styles.actionCardTitle}>{action.name}</h3> */}
      <div className={styles.actionCardContent}>
        <h3 className={styles.actionCardTitle}>{action.name}</h3>
        <p className={styles.actionCardInfo}>{action.description}</p>
      </div>
    </div>
  ))}
</div>
      {/* <button className={styles.scrollArrowRight} onClick={() => scrollGrid(actionsRef, 'right')}>
          &#8250;
        </button>
      </div> */}
    </div>
  );
}


export default ActionGrid;