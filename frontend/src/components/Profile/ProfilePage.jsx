import React, { useState,useEffect } from 'react';
import styles from './styles/ProfilePage.module.css';
import TopBar from '../Common_Components/TopBar';
import DefaultImage from './DefaultImage.jpg';
// import gradient from './gradient.jpg';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../Utils/datafetch';


const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('collections');
  const [viewMode, setViewMode] = useState('grid');
  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [nfts, setNFTs] = useState([]);

  const temp_address = '0x8765...4321';
  useEffect(() => {
    const loadData = async () => {
      if (temp_address) {
        const { myCollections, myNFTs } = await fetchData('myData', temp_address);
        setCollections(myCollections);
        setNFTs(myNFTs);
      }
    };
    loadData();
  }, [temp_address]);

  

  // Dummy data
  const userAddress = '6Senu...HBX'; // get the real address
  const fullAddress = '6SenuEHBX...'; // Replace with actual full address
  const totalItems = '24';

  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || 'Address not available';
  };


  // make function to fetch user data 
    // const fetchUserData = async () => {
    //     try {
    //         const response = await fetch('http://localhost:5000/api/user', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //
    //             },
    //         });
    //         const data = await response.json();
    //         console.log(data);
    //     } catch (error) {
    //         console.error('Error fetching user data:', error);
    //     }
    // };
    // fetchUserData();

    // const collections = [
    //     { id: 1, name: 'Collection 1', image: temp, numberOfNFTs: 5 },
    //     { id: 2, name: 'Collection 2', image: temp, numberOfNFTs: 3 },
    //     { id: 3, name: 'Collection 3', image: temp, numberOfNFTs: 7 },



    //   ];
    
    //   const nfts = [
    //     { id: 1, name: 'NFT 1', image: temp },
    //     { id: 2, name: 'NFT 2', image: temp },
    //     { id: 3, name: 'NFT 3', image: temp },
    //     { id: 4, name: 'NFT 4', image: temp },
    //   ];

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

  const handleCollectionClick = (collectionId) => {
    navigate(`/collection/${collectionId}`);
  };

  const handleNFTClick = (nftId) => {
    navigate(`/nft/${nftId}`);
  };
  const handleBrowseNFTs = () => {
    navigate('/browse-nfts'); // Implement this route in your application
  };

  return (
    <div className={styles.container}>
         <TopBar onConnectWallet={handleConnectWallet} />
      {/* Banner */}
      <div className={styles.banner}>
        <button className={styles.bannerButton}>Change Banner</button>
        {/* <button className={styles.bannerButton}>Profile Not Public</button> */}
      </div>

      {/* Profile Info */}
      <div className={styles.profileInfo}>
        <img src={DefaultImage} alt="Profile" className={styles.profileImage} />
        <div className={styles.profileDetails}>
          <h1 className={styles.profileAddress}>{formatAddress(address)}</h1>
          {/* <button className={styles.editButton}>Edit Profile</button> */}
          <div className={styles.profileStats}>
          <p>Total Collections: {collections.length}</p>
          <p>Total NFTs: {nfts.length}</p>
          </div>
        </div>
        {/* <div className={styles.profileStats}>
          <p>Total Items: {totalItems}</p>
        </div> */}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'collections' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            My Collections
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'nfts' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            My NFTs
          </button>
        </div>

        <div className={styles.contentControls}>
          {/* <div>
            <button className={styles.viewModeButton} onClick={() => setViewMode('list')}>List</button>
            <button className={styles.viewModeButton} onClick={() => setViewMode('grid')}>Grid</button>
          </div> */}
          {/* <div className={styles.searchSort}>
            <input 
              type="search" 
              placeholder="Search items" 
              className={styles.searchInput}
            />
            <select className={styles.sortSelect}>
              <option>Recently Listed</option>
              <option>All</option>
            </select>
          </div> */}
        </div>

        {activeTab === 'collections' && collections.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No Collections</h3>
            <p>Collections you create will appear here</p>
            <button className={styles.actionButton} onClick={handleCreateCollection}>Create Collection</button>
          </div>
        ) : activeTab === 'nfts' && nfts.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No NFTs</h3>
            <p>NFTs you own will appear here</p>
            <button className={styles.actionButton} onClick={handleBrowseNFTs}>Browse NFTs</button>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {activeTab === 'collections' && (
              <>
                <div className={`${styles.gridItem} ${styles.createNew}`} onClick={handleCreateCollection}>
                  <div className={styles.createNewContent}>
                    <span className={styles.plusSign}>+</span>
                  </div>
                </div>
                {collections.map((collection) => (
                  <div key={collection.id} className={styles.gridItem} onClick={() => handleCollectionClick(collection.id)}>
                    <img src={collection.image} alt={collection.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <h3>{collection.name}</h3>
                      <p>{collection.noOfNFTs} NFTs</p>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'nfts' && (
              <>
                {nfts.map((nft) => (
                  <div key={nft.id} className={styles.gridItem} onClick={() => handleNFTClick(nft.id)}>
                    <img src={nft.image} alt={nft.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <h3>{nft.name}</h3>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;