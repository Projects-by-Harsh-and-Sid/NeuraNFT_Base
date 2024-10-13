// MainComponent.js
import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

import Footer from '../Footer';
import ProfileMenu from '../Profile/ProfileMenu';
import styles from './styles/maincomponent.module.css';

import { Image, Paperclip, Brain, X } from 'lucide-react';
import TopBar from '../Common_Components/TopBar'; // New import
import { useAppContext } from '../../WalletContext';
import ChainSelector from '../ChainSelector';
import ActionGrid from './ActionGrid';
import { useCommonLogic } from './CommonComponet'; // Adjust the path as needed
import TopCollectionGrid from './TopCollectionGrid';
import AllCollections from './AllCollections';

// import brain image from material-ui



function MainComponent() {
  // const [tronWebState, setTronWebState] = useState({
  //   installed: false,
  //   loggedIn: false,
  // });
  
  // const [address, setAddress] = useState(null);
  const [connectInitiated, setConnectInitiated] = useState(false);
  // const [balance, setBalance] = useState(null);
  // const [activeTab, setActiveTab] = useState('allCollections');
  // const navigate = useNavigate();

  // const actionsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const allCollectionsRef = useRef(null);
  const allNFTsRef = useRef(null);



  



  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  const {
    navigate,
    activeTab,
    setActiveTab,
    allCollectionsRef,
    scrollToSection,
    handleCreateCollection,
  } = useCommonLogic();




  
  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } 
    // else {
    //   disconnectWallet();
    // }
  };
  // Mock data for collections


  const handleYourCollections = () => {
    navigate('/your_collections');
  };



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollGrid = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'right' ? 240 : -240;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.mainContainer}>

 <TopBar onConnectWallet={handleConnectWallet} />
 <ChainSelector />

  <div className={styles.content}>

      <ActionGrid 
        setActiveTab={setActiveTab} 
        allCollectionsRef={allCollectionsRef}
        scrollToSection={scrollToSection}
      />

      <TopCollectionGrid />
     

      <div ref={allCollectionsRef}className={styles.tabs}></div>
      <AllCollections 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
        {/* Content for All Collections or All NFTs would go here */}
        <Footer />
      </div>
  );
}

export default MainComponent;
