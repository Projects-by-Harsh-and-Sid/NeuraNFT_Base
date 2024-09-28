// MainComponent.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import temp from './temp.jpg'; // Adjust the path based on your project structure
import Footer from './Footer';
import ProfileMenu from './ProfileMenu';
import styles from '../styles/maincomponent.module.css';
import classNames from 'classnames'; // Import classnames library

function MainComponent() {
  const [tronWebState, setTronWebState] = useState({
    installed: false,
    loggedIn: false,
  });
  const [address, setAddress] = useState(null);
  const [connectInitiated, setConnectInitiated] = useState(false);
  const [balance, setBalance] = useState(null);
  const [activeTab, setActiveTab] = useState('allCollections');
  const navigate = useNavigate();
  const collectionsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (connectInitiated) {
      const timer = setInterval(async () => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(timer);
          setTronWebState({
            installed: true,
            loggedIn: true,
          });
          const userAddress = window.tronWeb.defaultAddress.base58;
          setAddress(userAddress);
          // Fetch and set balance
          const balanceInSun = await window.tronWeb.trx.getBalance(userAddress);
          const balanceInTRX = window.tronWeb.fromSun(balanceInSun);
          setBalance(parseFloat(balanceInTRX).toFixed(3));
        } else if (window.tronWeb) {
          setTronWebState({
            installed: true,
            loggedIn: false,
          });
        } else {
          setTronWebState({
            installed: false,
            loggedIn: false,
          });
        }
      }, 500);

      return () => clearInterval(timer);
    }
  }, [connectInitiated]);

  const connectWallet = () => {
    if (window.tronWeb) {
      setConnectInitiated(true);
    } else {
      alert('Please install TronLink wallet extension.');
    }
  };

  const logout = () => {
    setTronWebState({
      installed: false,
      loggedIn: false,
    });
    setAddress(null);
    setBalance(null);
    setConnectInitiated(false);
  };

  // Mock data for collections
  const collections = [
    { id: 1, name: 'Mint Terminal', image: temp },
    { id: 2, name: 'Diamond Rewards', image: temp },
    { id: 3, name: 'New Profile Page', image: temp },
    { id: 4, name: 'On Chain Daily', image: temp },
    { id: 5, name: 'Capy Friends', image: temp },
    { id: 6, name: 'Capy Friends', image: temp },
    { id: 7, name: 'Capy Friends', image: temp },
    { id: 8, name: 'Capy Friends', image: temp },
  ];

  const collectionsData = [
    { id: 1, name: 're:generates', image: temp, floor: '0.0042 ETH', volume: '8.316 ETH', sales: '1,842' },
    { id: 2, name: 'onchain gaias', image: temp, floor: '0.33 ETH', volume: '4.202 ETH', sales: '9' },
    { id: 3, name: 'Rebel Monkes', image: temp, floor: '0.025 ETH', volume: '2.227 ETH', sales: '94' },
    { id: 4, name: 'MankiBeanz', image: temp, floor: '0.0011 ETH', volume: '1.999 ETH', sales: '1,183' },
    { id: 5, name: 'based punks', image: temp, floor: '0.198 ETH', volume: '1.719 ETH', sales: '8' },
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
      <nav className={styles.navbar}>
        <div className={styles.navbarBrand}>NeuraNFT</div>
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
      />

      <div className={styles.content}>
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
                  <p>Some additional info about {collection.name}</p>
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
            <div className={styles.headerItem}>Floor</div>
            <div className={styles.headerItem}>Volume</div>
            <div className={styles.headerItem}>Sales</div>
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
                <div className={styles.rowItem}>{item.floor}</div>
                <div className={styles.rowItem}>{item.volume}</div>
                <div className={styles.rowItem}>{item.sales}</div>
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
