// MainComponent.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import temp from './temp.jpg'; // Adjust the path based on your project structure
import create from './create.jpg'; // Adjust the path based on your project structure
import gradient from './gradient.jpg'; // Adjust the path based on your project structure
import Footer from './Footer';
import ProfileMenu from './ProfileMenu';
import styles from '../styles/maincomponent.module.css';
import classNames from 'classnames'; // Import classnames library
import { Image, Paperclip, Brain, X } from 'lucide-react';
import TopBar from './TopBar'; // New import
import night from './night.jpg';
import { useAppContext } from '../AppContext';
// import brain image from material-ui


function MainComponent() {
  // const [tronWebState, setTronWebState] = useState({
  //   installed: false,
  //   loggedIn: false,
  // });
  
  // const [address, setAddress] = useState(null);
  const [connectInitiated, setConnectInitiated] = useState(false);
  // const [balance, setBalance] = useState(null);
  const [activeTab, setActiveTab] = useState('allCollections');
  const navigate = useNavigate();
  const collectionsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();

  // useEffect(() => {
  //   if (connectInitiated) {
  //     const timer = setInterval(async () => {
  //       if (window.tronWeb && window.tronWeb.ready) {
  //         clearInterval(timer);
  //         setTronWebState({
  //           installed: true,
  //           loggedIn: true,
  //         });
  //         const userAddress = window.tronWeb.defaultAddress.base58;
  //         setAddress(userAddress);
  //         // Fetch and set balance
  //         const balanceInSun = await window.tronWeb.trx.getBalance(userAddress);
  //         const balanceInTRX = window.tronWeb.fromSun(balanceInSun);
  //         setBalance(parseFloat(balanceInTRX).toFixed(3));
  //       } else if (window.tronWeb) {
  //         setTronWebState({
  //           installed: true,
  //           loggedIn: false,
  //         });
  //       } else {
  //         setTronWebState({
  //           installed: false,
  //           loggedIn: false,
  //         });
  //       }
  //     }, 500);

  //     return () => clearInterval(timer);
  //   }
  // }, [connectInitiated]);

  // const connectWallet = () => {
  //   if (window.tronWeb) {
  //     setConnectInitiated(true);
  //   } else {
  //     alert('Please install TronLink wallet extension.');
  //   }
  // };

  // const logout = () => {
  //   setTronWebState({
  //     installed: false,
  //     loggedIn: false,
  //   });
  //   setAddress(null);
  //   setBalance(null);
  //   setConnectInitiated(false);
  // };
  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } else {
      disconnectWallet();
    }
  };
  // Mock data for collections
  const collections = [
    { id: 1, name: 'Mint Terminal', image: temp ,description: 'Mint your NFTs here'},
    { id: 2, name: 'Diamond Rewards', image: temp,description: 'Earn rewards for minting NFTs'},
    { id: 3, name: 'New Profile Page', image: temp ,description: 'Customize your profile page'},
    { id: 4, name: 'On Chain Daily', image: temp ,description: 'Daily NFT drops'},
    { id: 5, name: 'Capy Friends', image: temp ,description: 'Mint your NFTs here'},
    { id: 6, name: 'Capy Friends', image: temp ,description: 'Mint your NFTs here'},
    { id: 7, name: 'Capy Friends', image: temp ,description: 'Mint your NFTs here'},
    { id: 8, name: 'Capy Friends', image: temp ,description: 'Mint your NFTs here'},
  ];

  const collectionsData = [
    { id: 1, name: 're:generates', image: temp, owner: '0x1234...5678', model: 'Llama 3.1', NFTs: '1,842' },
    { id: 2, name: 'onchain gaias', image: temp, owner: '0x1234...5678', model: 'Llama 3.1', NFTs: '9' },
    { id: 3, name: 'Rebel Monkes', image: temp, owner: '0x1234...5678', model: 'Llama 3.1', NFTs: '94' },
    { id: 4, name: 'MankiBeanz', image: temp, owner: '0x1234...5678', model: 'Llama 3.1', NFTs: '1,183' },
    { id: 5, name: 'based punks', image: temp, owner: '0x1234...5678', model: 'Llama 3.1', NFTs: '8' },
  ];

  const handleCreateCollection = () => {
    navigate('/create_collection');
  };

  const handleYourCollections = () => {
    navigate('/your_collections');
  };

  const handleAllCollection = () => {

    navigate('/all_collections');

  };
  const actions = [
    { id: 1, name: 'Your Collections', image: create,action: handleYourCollections },
    { id: 2, name: 'All Collections', image: gradient,action: handleAllCollection },
    { id: 3, name: 'Create Collections', image: night,action: handleCreateCollection },
    // { id: 4, name: 'onchain gaias', image: gradient },

  ];


  const handleRowClick = (id, type) => {
    if (type === 'collection') {
      navigate(`/collection/${id}`);
    } else if (type === 'nft') {
      navigate(`/nft/${id}`);
    }
  };

  // Mock data for NFTs table
  const nftsData = [
    { id: 1, name: 'NFT #1234', image: temp, price: '0.5 ETH', lastSale: '0.4 ETH', owner: '0x1234...5678' },
    { id: 2, name: 'NFT #5678', image: temp, price: '0.7 ETH', lastSale: '0.6 ETH', owner: '0x8765...4321' },
    { id: 3, name: 'NFT #9101', image: temp, price: '0.3 ETH', lastSale: '0.25 ETH', owner: '0x2468...1357' },
    { id: 4, name: 'NFT #1121', image: temp, price: '1.0 ETH', lastSale: '0.9 ETH', owner: '0x1357...2468' },
    { id: 5, name: 'NFT #3141', image: temp, price: '0.8 ETH', lastSale: '0.75 ETH', owner: '0x9876...5432' },
  ];

  const scrollCollections = (direction) => {
    if (collectionsRef.current) {
      const scrollAmount = direction === 'right' ? 240 : -240; // Adjust as needed
      collectionsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleExploreClick = (id) => {
    navigate(`/collection/${id}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.mainContainer}>
      {/* <nav className={styles.navbar}>
        <div className={styles.navbarBrand}><Brain size={20} /> NeuraNFT</div>
        <div className={styles.navbarMenu}>
          {!tronWebState.loggedIn ? (
            <button className={styles.connectButton} onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <div className={styles.walletInfo}>
              <div className={styles.balanceDisplay} onClick={toggleMenu}>
                <span className={styles.balance}>{balance} TRX</span>
                <img src={temp} alt="Profile" className={styles.profileImage} />
              </div>
            </div>
          )}
        </div>
      </nav>
      <ProfileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        address={address}
        balance={balance}
      /> */}  
 <TopBar onConnectWallet={handleConnectWallet} />
      <div className={styles.content}>
      <div className={styles.actionsGrid}>
            {actions.map((action) => (
              <div key={action.id} className={styles.actionCard} onClick={action.action}>
                <img src={action.image
                } alt={action.name} />
                <h3 className={styles.actionCardTitle}>{action.name}</h3>
              </div>
            ))}
          </div>
          <h2> Popular Collections</h2>
        <div className={styles.collectionsContainer}>
          <button className={styles.scrollArrowLeft} onClick={() => scrollCollections('left')}>
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
          <button className={styles.scrollArrowRight} onClick={() => scrollCollections('right')}>
            &#8250;
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'allCollections' })}
            onClick={() => setActiveTab('allCollections')}
          >
            All Collections
          </button>
          <button 
            className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'allNFTs' })}
            onClick={() => setActiveTab('allNFTs')}
          >
            All NFTs
          </button>
        </div>
        <div className={styles.dataTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerItem}># Collection</div>
            <div className={styles.headerItem}>Owner</div>
            <div className={styles.headerItem}>Model</div>
            <div className={styles.headerItem}>No. of NFTs</div>
          </div>
          {activeTab === 'allCollections' ? (
            collectionsData.map((item, index) => (
              <div 
                key={item.id} 
                className={styles.tableRow} 
                onClick={() => handleRowClick(item.id, 'collection')}
              >
                <div className={styles.rowItem}>
                  <span className={styles.itemNumber}>{index + 1}</span>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>{item.owner}</div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{item.NFTs}</div>
              </div>
            ))
          ) : (
            nftsData.map((item, index) => (
              <div 
                key={item.id} 
                className={styles.tableRow} 
                onClick={() => handleRowClick(item.id, 'nft')}
              >
                <div className={styles.rowItem}>
                  <span className={styles.itemNumber}>{index + 1}</span>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>{item.price}</div>
                <div className={styles.rowItem}>{item.lastSale}</div>
                <div className={styles.rowItem}>{item.owner}</div>
              </div>
            ))
          )}
        </div>
        {/* Content for All Collections or All NFTs would go here */}
        <Footer />
      </div>
    </div>
  );
}

export default MainComponent;
