import React from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultImage from './DefaultImage.jpg';
import styles from './styles/ProfileMenu.module.css';
import classNames from 'classnames';
import TronLinkLogo from './styles/trn-link.png';
import { Copy } from 'lucide-react'; // Import the Copy icon from lucide-react

function ProfileMenu({ isOpen, onClose, address, balance,onDisconnect  }) {
  const navigate = useNavigate();

  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || 'Connect to Wallet';
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Assumes '/profile' is the route for ProfilePage
    onClose(); // Close the menu after navigation
  };
  const handleHomeClick = () => {
    navigate('/'); // Assumes '/profile' is the route for ProfilePage
    onClose(); // Close the menu after navigation
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div
      className={classNames(styles.profileMenu, {
        [styles.open]: isOpen,
      })}
    >
      <div className={styles.menuHeader}>
        <img src={DefaultImage} alt="Profile" className={styles.largeProfileImage} />
        <h3 className={styles.addressMenu}>{formatAddress(address)}</h3>
        {/* <p>{balance} SOL</p> */}
      </div>
      <div className={styles.walletInfo}>
          {/* <h3 className={styles.addressMenu}>{formatAddress(address)}</h3> */}
          <div className={styles.tronWallet}>
          <img 
              src={TronLinkLogo} 
              alt="Tron"
              className={styles.WalletIcon}
              />
            <span className={styles.Walletheader}>TronLink (1 wallet)</span>
            <div className={styles.activeStatus}>
              <span className={styles.walletStatus}>Active</span>
            </div>
          </div>
          <div className={styles.tronBalance}>

                        <img 
              src={'/tron-trx-logo.svg' } 
              alt="Tron"
              className={styles.chainIcon}
              // className={styles.chainIcon}
            />
          <div className={styles.tronInfo}>
            <span>0.00 TrX</span>
            <div className={styles.addressContainer}>
              <h3 className={styles.addressMenusmall}>{formatAddress(address)}</h3>
              <button 
                className={styles.copyButton} 
                onClick={() => copyToClipboard(address)}
                aria-label="Copy address"
              >
                <Copy size={10} />
              </button>
            </div>
          </div>
          </div>
        </div>
      <div className={styles.menuItems}>
      <button 
          className={styles.profileButton}
          onClick={handleHomeClick}
        >
          Home
        </button>
        <button 
          className={styles.profileButton}
          onClick={handleProfileClick}
        >
          Profile
        </button>
        {/* Add other menu items here if needed */}
      </div>
      <div className={styles.menuFooter}>
        <button className={styles.menuFooterButton} onClick={() => {
              onDisconnect();
              onClose();
            }}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default ProfileMenu;