import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import ProfileMenu from '../ProfileMenu';
import UserProfileImage from './UserProfile.jpg';
import styles from '../../styles/topbar.module.css';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ onConnectWallet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tronWebState, balance, address } = useAppContext();
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMintClick = () => {
    navigate('/create_collection');
  };

  const handleWalletClick = () => {
    window.open('https://tron.network', '_blank');
  };

  const handleoptionclick = () => {
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
      <div className={styles.navbarBrand}>
      <svg width="0" height="0">
          <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#ff00cc" offset="0%" />
            <stop stopColor="#3333ff" offset="100%" />
          </linearGradient>
        </svg>
        <Brain size={30} style={{ stroke: "url(#brain-gradient)",
            marginTop: '-1px', // Adjust this value as needed
        verticalAlign: 'middle' }} /> NeuraNFT
        </div>



        <div className={styles.navItems}>
        <div 
          className={styles.navItem} 
          onMouseEnter={() => setIsDiscoverOpen(true)}
          onMouseLeave={() => setIsDiscoverOpen(false)}
        >
          Discover
          {isDiscoverOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.options}onClick={handleoptionclick}>Collections</div>
              <div  className={styles.options}onClick={handleoptionclick}>NFTs</div>
            </div>
          )}
        </div>
        <div className={styles.navItem} onClick={handleMintClick}>Mint</div>
        <div className={styles.navItem} onClick={handleMintClick}>Documentation</div>
        <div className={styles.navItem} onClick={handleMintClick}>GPU Leading</div>

        <div className={`${styles.navItem} ${styles.walletGradient}`} onClick={handleWalletClick}>Wallet</div>
      </div>
      </div>



      <div className={styles.navbarMenu}>
        {!tronWebState.loggedIn ? (
          <button className={styles.connectButton} onClick={onConnectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className={styles.walletInfo}>
            <div className={styles.balanceDisplay} onClick={toggleMenu}>
              <span className={styles.balance}>{balance} TRX</span>
              <img src={UserProfileImage} alt="Profile" className={styles.profileImage} />
            </div>
          </div>
        )}
      </div>
      <ProfileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        address={address}
        balance={balance}
        onDisconnect={onConnectWallet}
      />
    </nav>
  );
};

export default TopBar;