import React from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultImage from './DefaultImage.jpg';
import styles from './styles/ProfileMenu.module.css';
import classNames from 'classnames';

function ProfileMenu({ isOpen, onClose, address, balance }) {
  const navigate = useNavigate();

  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || 'Address not available';
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Assumes '/profile' is the route for ProfilePage
    onClose(); // Close the menu after navigation
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
      <div className={styles.menuItems}>
        <button 
          className={styles.profileButton}
          onClick={handleProfileClick}
        >
          Profile
        </button>
        {/* Add other menu items here if needed */}
      </div>
      <div className={styles.menuFooter}>
        <button className={styles.menuFooterButton} onClick={onClose}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default ProfileMenu;