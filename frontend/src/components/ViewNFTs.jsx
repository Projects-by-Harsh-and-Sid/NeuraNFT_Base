import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ViewNFTs.module.css';
import TopBar from './TopBar';
import temp from './temp.jpg'; // Placeholder image
import { useAppContext } from '../AppContext';
import NFTDetailPopup from './NFTPopup'; // Import the NFTDetailPopup component


const ViewCollectionNFTs = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const nfts_temp = [
    {
      id: 1,
      name: 're:gen #3911',
      collection: 're:generates',
        image: temp,
      attributes: [
        { trait_type: "Model", value: "Llama 3.1", rarity: "90% 0.0037 ETH" },
        { trait_type: "Context Window", value: "16k tokens", rarity: "24% 0.0037 ETH" },
        { trait_type: "Total Access", value: "24", rarity: "10% 0.0037 ETH" },
        { trait_type: "hair", value: "clown_green", rarity: "4% 0.0037 ETH" },
      ],
      accessList: [
        { address: '0x123...', accessLevel: 'Level 1' },
        { address: '0x456...', accessLevel: 'Level 3' },
        // ...more entries...
      ],
      contractAddress: '0x56...bc4a',
      tokenId: '4911',
      tokenStandard: 'ERC-721',
      owner: '0x58...4c4c',
      chain: 'Base',
      description: "This is a unique NFT from the re:generates collection. It features...",

      creatorAddress: "0x9876...5432",
      ownerAddress: "0x5432...9876",
    },

    
    // ... other NFTs
  ];

  const fetchNFTs = () => {
    // Placeholder data. Replace with actual API call
    setNfts(nfts_temp);
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
           <div key={nft.id} className={styles.gridItem} onClick={() => handleNFTClick(nft)}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            <div className={styles.nftDetails}>
              <h3>{nft.name}</h3>
              <p>{nft.price}</p>
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