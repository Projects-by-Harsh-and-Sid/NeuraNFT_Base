import React, { useState,useEffect  } from 'react';
import { Brain } from 'lucide-react';
import { Menu } from 'lucide-react';
import { X } from 'lucide-react';
import ProfileMenu from '../Profile/ProfileMenu';
import UserProfileImage from './UserProfile.jpg';
import styles from './styles/topbar.module.css';
import { useAppContext } from '../../WalletContext';
import { useNavigate,Link  } from 'react-router-dom';

const TopBar = ({ onConnectWallet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tronWebState, balance, address,disconnectWallet } = useAppContext();
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsDiscoverOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMintClick = () => {
    navigate('/create_collection');
  };

  const handleWalletClick = () => {
    window.open('https://www.coinbase.com/wallet', '_blank');
  };

  const handleoptionclick = () => {
    navigate('/');
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setIsMenuOpen(false);
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };


  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (isMenuOpen) {
  //       setIsMenuOpen(false);
  //     }
  //   };
  
  //   window.addEventListener('scroll', handleScroll);
  
  //   // Cleanup function to remove the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen, isSidebarOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
      <button 
            className={styles.menuButton}
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>



      <Link to="/" className={styles.navbarBrand} style={{ textDecoration: 'none' }}>
      <svg width="0" height="0">
          <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#ff00cc" offset="0%" />
            <stop stopColor="#3333ff" offset="100%" />
          </linearGradient>
        </svg>
        <Brain size={30} style={{ stroke: "url(#brain-gradient)",
            marginTop: '-1px', // Adjust this value as needed
        verticalAlign: 'middle' }} /> NeuraNFT
      </Link>



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
        <div className={styles.navItem} onClick={handleMintClick}>GPU Lending</div>

        <div className={`${styles.navItem} ${styles.walletGradient}`} onClick={handleWalletClick}>Wallet</div>
      </div>
      </div>



      <div className={styles.navbarMenu}>
        {!tronWebState.loggedIn ? (
          <button className={styles.fancybutton} onClick={onConnectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className={styles.walletInfo}>
            <div className={styles.balanceDisplay} onClick={toggleMenu}>
              <span className={styles.balance}>{balance} ETH</span>
              <img src={UserProfileImage} alt="Profile" className={styles.profileImage} />
            </div>
          </div>
        )}
      </div>

            {/* Mobile Sidebar */}
    <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
    <div className={styles.sidebarHeader}>
    {/* Logo moved inside header */}
    <Link to="/" className={styles.sidebarBrand} onClick={toggleSidebar}>
      <svg width="0" height="0">
        <linearGradient id="brain-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="#ff00cc" offset="0%" />
          <stop stopColor="#3333ff" offset="100%" />
        </linearGradient>
      </svg>
      <Brain 
        size={30} 
        style={{ 
          stroke: "url(#brain-gradient-mobile)",
          marginTop: '-1px',
          verticalAlign: 'middle' 
        }} 
      /> 
      <span>NeuraNFT</span>
    </Link>
    <button onClick={toggleSidebar} className={styles.closeButton}>
      <X size={24} />
    </button>
  </div>


        {/* Mobile Sidebar */}
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarItem}>
            <span onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}>
              Discover
            </span>
            {isDiscoverOpen && (
              <div className={styles.sidebarSubmenu}>
                <div onClick={handleoptionclick}>Collections</div>
                <div onClick={handleoptionclick}>NFTs</div>
              </div>
            )}
          </div>
          <div className={styles.sidebarItem} onClick={handleMintClick}>Mint</div>
          <div className={styles.sidebarItem} onClick={handleMintClick}>Documentation</div>
          <div className={styles.sidebarItem} onClick={handleMintClick}>GPU Lending</div>
          <div className={`${styles.sidebarItem} ${styles.walletGradient}`} onClick={handleWalletClick}>
            Wallet
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

<ProfileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        address={address}
        balance={balance}
        onDisconnect={handleDisconnectWallet}
      />
    </nav>
  );
};

export default TopBar;