// ProfileMenu.js
import React from 'react';
import temp from './temp.jpg';
import styles from '../styles/ProfileMenu.module.css';
import classNames from 'classnames'; // Optional: For handling dynamic class names

function ProfileMenu({ isOpen, onClose, address, balance }) {
  // Function to format the address
  const formatAddress = (addr) => {
    if (addr && addr.length > 10) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr || 'Address not available';
  };

  return (
    <div
      className={classNames(styles.profileMenu, {
        [styles.open]: isOpen,
      })}
    >
      <div className={styles.menuHeader}>
        <img src={temp} alt="Profile" className={styles.largeProfileImage} />
        <h3 className={styles.addressMenu}>{formatAddress(address)}</h3>
        {/* <p>{balance} SOL</p> */}
      </div>
      <div className={styles.menuItems}>
        <div className={styles.menuItem}>Profile</div>
        {/* <div className={styles.menuItem}>Rewards</div>
        <div className={styles.menuItem}>Account Settings</div>
        <div className={styles.menuItem}>Support</div> */}
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
