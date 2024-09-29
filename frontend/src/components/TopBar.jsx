import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import temp from './temp.jpg';
import styles from '../styles/topbar.module.css';
import { useAppContext } from '../AppContext';

const TopBar = ({ onConnectWallet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tronWebState, balance, address } = useAppContext();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}><Brain size={20} /> NeuraNFT</div>
      <div className={styles.navbarMenu}>
        {!tronWebState.loggedIn ? (
          <button className={styles.connectButton} onClick={onConnectWallet}>
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