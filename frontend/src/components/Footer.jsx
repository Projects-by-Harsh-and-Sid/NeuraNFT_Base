// Footer.js
import React from 'react';
import styles from '../styles/footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>
            NeuraNFT</h3>
          <p className={styles.footerDescription}>
            The largest NFT marketplace and Runes platform. Buy, sell and discover Ordinals and NFTs across multiple blockchains.
          </p>
        </div>
        <div className={styles.footerSection}>
          <h4>Follow</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                Discord
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Resources</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href="/support">Support</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; 2024 NeuraNFT. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
