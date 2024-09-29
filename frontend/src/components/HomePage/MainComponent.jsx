// MainComponent.js
import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

import Footer from '../Footer';
import ProfileMenu from '../ProfileMenu';
import styles from './styles/maincomponent.module.css';
import classNames from 'classnames'; // Import classnames library
import { Image, Paperclip, Brain, X } from 'lucide-react';
import TopBar from '../Common_Components/TopBar'; // New import
import { useAppContext } from '../../AppContext';
import ChainSelector from '../ChainSelector';
import ActionGrid from './ActionGrid';
import { useCommonLogic } from './CommonComponet'; // Adjust the path as needed
import TopCollectionGrid from './TopCollectionGrid';

// import brain image from material-ui
import { fetchData } from '../Utils/datafetch';


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

  const [collectionsData, setCollectionsData] = useState([]);
  const [nftsData, setNftsData] = useState([])
  

  const [currentPage, setCurrentPage] = useState(1);

  const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();
  const {
    navigate,
    activeTab,
    setActiveTab,
    allCollectionsRef,
    scrollToSection,
    handleCreateCollection,
  } = useCommonLogic();


  useEffect(() => {
    const allCollectionsData = fetchData('allCollections');
    setCollectionsData(allCollectionsData);
    const allNFTsData = fetchData('allNFTs');
    setNftsData(allNFTsData);
  }, []);



  
  const handleConnectWallet = async () => {
    if (!tronWebState.loggedIn) {
      await connectWallet();
    } else {
      disconnectWallet();
    }
  };
  // Mock data for collections


  const handleYourCollections = () => {
    navigate('/your_collections');
  };


  const handleRowClick = (id, type) => {
    if (type === 'collection') {
      navigate(`/collection/${id}`);
    } else if (type === 'nft') {
      navigate(`/nft/${id}`);
    }
  };



  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentCollections = collectionsData.slice(indexOfFirstItem, indexOfLastItem);
  const currentNFTs = nftsData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil((activeTab === 'allCollections' ? collectionsData.length : nftsData.length) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
     


        <div ref={allCollectionsRef}className={styles.tabs}>
          <button 
            className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'allCollections' })}
            onClick={() => {
              setActiveTab('allCollections');
              setCurrentPage(1);
            }}
          >
            All Collections
          </button>
          <button 
            className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'allNFTs' })}
            onClick={() => {
              setActiveTab('allNFTs');
              setCurrentPage(1);
            }}
          >
            All NFTs
          </button>
        </div>
        <div className={styles.dataTable}>
          {/* <div className={styles.tableHeader}>
            <div className={styles.headerItem}># Collection</div>
            <div className={styles.headerItem}>Owner</div>
            <div className={styles.headerItem}>Model</div>
            <div className={styles.headerItem}>No. of NFTs</div>
          </div> */}
          {activeTab === 'allCollections' ? (<>
            <div className={styles.tableHeader}>
      <div className={styles.headerItem}># Collection</div>
      <div className={styles.headerItem}>Creator</div>
      <div className={styles.headerItem}>Model</div>
      <div className={styles.headerItem}>No. of NFTs</div>
      <div className={styles.headerItem}>Context Window</div>

    </div>
            {currentCollections.map((item, index) => (
              <div 
                key={item.id} 
                className={styles.tableRow} 
                onClick={() => handleRowClick(item.id, 'collection')}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>{item.creator}</div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{item.noOfNFTs}</div>
                <div className={styles.rowItem}>{item.contextWindow}</div>

              </div>
            ))}
          </>
          ) : (  <>
            <div className={styles.tableHeader}>
              <div className={styles.headerItem}># NFT</div>
              <div className={styles.headerItem}>Owner</div>
              <div className={styles.headerItem}>Collection</div>
              <div className={styles.headerItem}>Model</div>
              <div className={styles.headerItem}>Number of Owners</div>

              
            </div>
            {currentNFTs.map((item, index) => (
              
              <div 
                key={item.id} 
                className={styles.tableRow} 
                onClick={() => handleRowClick(item.id, 'nft')}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>{item.owner}</div>

                <div className={styles.rowItem}>{item.collection}</div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{item.numberOfOwners}</div>

              </div>
            ))}
          </>
          )}
        </div>
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={classNames(styles.pageButton, { [styles.activePage]: currentPage === pageNumber })}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        {/* Content for All Collections or All NFTs would go here */}
        <Footer />
      </div>
    </div>
  );
}

export default MainComponent;
