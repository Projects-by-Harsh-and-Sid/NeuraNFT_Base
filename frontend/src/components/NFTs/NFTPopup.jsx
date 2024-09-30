import React, { useState } from 'react';
import styles from './styles/NFTDetailPopup.module.css';
import { Dialog, DialogContent, CircularProgress } from '@mui/material';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import APIDialog from './ApiDialog';
import TestAPIDialog from './Apitestdialog';
import AddAccessDialog from './AddAccessDialog';
import UpdateAccessDialog from './UpdateAccessDialog';

const NFTDetailPopup = ({ nft, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [isAccessDetailExpanded, setIsAccessDetailExpanded] = useState(true);
   
    const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
    const [isTestApiDialogOpen, setIsTestApiDialogOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [testApiResult, setTestApiResult] = useState('');
    const [isTestApiLoading, setIsTestApiLoading] = useState(false);

    const [isAddAccessDialogOpen, setIsAddAccessDialogOpen] = useState(false);
    const [isUpdateAccessDialogOpen, setIsUpdateAccessDialogOpen] = useState(false);

    const navigate = useNavigate();

    const { tronWebState, address, balance, connectWallet, disconnectWallet } = useAppContext();

    const accessLevelDescriptions = {
        'Level 1': 'Viewer - Can view the NFT',
        'Level 2': 'Commenter - Can comment on the NFT',
        'Level 3': 'Editor - Can edit the NFT',
        'Level 4': 'Admin - Can manage access',
        'Level 5': 'Owner - Full control',
      };

      const handleApiClick = async () => {
        setIsApiDialogOpen(true);
        setIsApiLoading(true);
        
        // Simulating API call with dummy values
        setTimeout(() => {
            setApiKey('dummy_api_key_12345');
            setApiEndpoint('https://api.example.com/v1/nft-data');
            setIsApiLoading(false);
        }, 1000);
    };

    const handleTestApiClick = async () => {
        setIsTestApiLoading(true);
        setIsTestApiDialogOpen(true);

        // Simulating API test with dummy result
        setTimeout(() => {
            const dummyResult = "## Endpoint\n`GET /api/v1/nft/{id}`\n\n## Response\n```json\n{\n  \"id\": \"123\",\n  \"name\": \"Awesome NFT\",\n  \"description\": \"This is a test NFT\",\n  \"owner\": \"0x1234...5678\"\n}\n```";
            const sanitizedHtml = DOMPurify.sanitize(marked(dummyResult));
            const formattedHtml = `<div class="api-response">${sanitizedHtml}</div>`;
            setTestApiResult(formattedHtml);
            setIsTestApiLoading(false);
        }, 1500);
    };

    const handleAddAccess = (address, accessLevel) => {
      // Implement the logic to add access
      console.log(`Adding access for ${address} with level ${accessLevel}`);
  };

  const handleUpdateAccess = (address, newAccessLevel) => {
      // Implement the logic to update access
      console.log(`Updating access for ${address} to level ${newAccessLevel}`);
  };


    const openChat = () => {
        navigate(`/chat/${nft.collectionaddress}/${nft.id}`);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };




    const GotoAccess = () => {
        setActiveTab('access');
    };

    const GotoFullPage = (collectionid,nftid) => {
        navigate(`/collection/${collectionid}/nft/${nftid}`);
    }
    
    const formatAddress = (addr) => {
      if (addr && addr.length > 10) {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      }
      return addr || 'Address not available';
    };




    return (
      <div className={styles.overlay}>
        <div className={styles.popup}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{nft.name}</h2>
              <p className={styles.collection}>{nft.collection}</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.actionButton}>↻</button>
              <button onClick={() => GotoFullPage(nft.collectionaddress, nft.id)} className={styles.actionButton}>⇱</button>
              <button onClick={GotoAccess} className={styles.actionButton} >✎</button>
              <button onClick={onClose} className={styles.closeButton}>×</button>
            </div>
          </div>
          <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'access' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('access')}
          >
            Access
          </button>
        </div>
  
          <div className={styles.content}>
          <div className={styles.imageContainer}>
              <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            </div>
            <div className={styles.detailsContainer}>


  
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                  <div className={styles.overviewContent}>
                                <div className={styles.listingStatusSection}>
                            <h2 className={styles.listingStatus}>{nft.name}</h2>
                            <p className={styles.ownerInfo}>
                                Owned by: <span className={styles.ownerAddress}>{formatAddress(nft.owner)}</span>
                            </p>
                            {!tronWebState.loggedIn && (
                                <button className={styles.connectWalletButton} onClick={connectWallet}>
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    <div className={styles.descriptionSection}>
                      <h3>NFT Description</h3>
                      <p className={styles.description}>{nft.description}</p>
                    </div>
                    <h3>Attributes</h3>
                    <div className={styles.attributesGrid}>
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className={styles.attributeItem}>
                          <p className={styles.attributeType}>{attr.trait_type}</p>
                          <p className={styles.attributeValue}>{attr.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className={styles.detailsSection}>
                      <div className={styles.detailsHeader} onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
                        <h3>Details</h3>
                        <span className={isDetailsExpanded ? styles.expandedIcon : styles.collapsedIcon}>
                          {isDetailsExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                      {isDetailsExpanded && (
                        <div className={styles.detailsContent}>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Collection Address</span>
                            <span className={styles.detailValue}>{nft.collectionaddress}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Token ID</span>
                            <span className={styles.detailValue}>{nft.tokenId}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Token Standard</span>
                            <span className={styles.detailValue}>{nft.tokenStandard}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Owner</span>
                            <span className={styles.detailValue}>{nft.owner}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Chain</span>
                            <span className={styles.detailValue}>{nft.chain}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={styles.buttonContainer}>
                      <button className={styles.actionButton2}onClick={handleApiClick}>Get API</button>
                      <button className={styles.actionButton2}onClick={handleTestApiClick}>Test API</button>
                      <button className={styles.actionButton2} onClick={openChat}>Chat</button>
                    </div>
                  </div>
                )}
              {activeTab === 'access' && (
                <div className={styles.accessContent}>
                  <h3>Access Management</h3>
                  <div className={styles.accessDetailSection}>
                      <div className={styles.accessDetailHeader} onClick={() => setIsAccessDetailExpanded(!isAccessDetailExpanded)}>
                        <h3>Access Detail</h3>
                        {/* <span className={isAccessDetailExpanded ? styles.expandedIcon : styles.collapsedIcon}>
                          {isAccessDetailExpanded ? '▲' : '▼'}
                        </span> */}
                      </div>
    
                        <div className={styles.accessDetailContent}>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Creator Address</span>
                            <span className={styles.detailValue}>{formatAddress(nft.creatorAddress)}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Owner Address</span>
                            <span className={styles.detailValue}>{formatAddress(nft.ownerAddress)}</span>
                          </div>
                        </div>
          
                        </div>
                  <div className={styles.accessList}>
                    <div className={styles.accessListHeader}>
                      <div className={styles.accessListHeaderItem}>Address</div>
                      <div className={styles.accessListHeaderItem}>Access Level</div>
                    </div>
                    {nft.accessList.map((accessItem, index) => (
                      <div key={index} className={styles.accessListItem}>
                        <div className={styles.address}>{formatAddress(accessItem.address)}</div>
                        <div
                          className={styles.accessLevel}
                          title={accessLevelDescriptions[accessItem.accessLevel]}
                        >
                          {accessItem.accessLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                    {/* <div className={styles.accessDetailSection}>
                      <div className={styles.accessDetailHeader} onClick={() => setIsAccessDetailExpanded(!isAccessDetailExpanded)}>
                        <h3>Access Detail</h3>
                        <span className={isAccessDetailExpanded ? styles.expandedIcon : styles.collapsedIcon}>
                          {isAccessDetailExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    {isAccessDetailExpanded && (
                        <div className={styles.accessDetailContent}>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Creator Address</span>
                            <span className={styles.detailValue}>{nft.creatorAddress}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Owner Address</span>
                            <span className={styles.detailValue}>{nft.ownerAddress}</span>
                          </div>
                        </div>
                      )}
                        </div> */}
                        
                    <div className={styles.buttonContainer}>
                    <button className={styles.actionButton2} onClick={() => setIsAddAccessDialogOpen(true)}>Add Access</button>
                    <button className={styles.actionButton2} onClick={() => setIsUpdateAccessDialogOpen(true)}>Update Access</button>

                    </div>    
                  </div>
                  
                )}
              </div>
            </div>
          </div>
        </div>
              <APIDialog
                isOpen={isApiDialogOpen}
                onClose={() => setIsApiDialogOpen(false)}
                apiKey={apiKey}
                apiEndpoint={apiEndpoint}
                isLoading={isApiLoading}
            />
            
            <TestAPIDialog
                isOpen={isTestApiDialogOpen}
                onClose={() => setIsTestApiDialogOpen(false)}
                testResult={testApiResult}
                isLoading={isTestApiLoading}
            />
            <AddAccessDialog
                isOpen={isAddAccessDialogOpen}
                onClose={() => setIsAddAccessDialogOpen(false)}
                onAddAccess={handleAddAccess}
            />

            <UpdateAccessDialog
                isOpen={isUpdateAccessDialogOpen}
                onClose={() => setIsUpdateAccessDialogOpen(false)}
                onUpdateAccess={handleUpdateAccess}
                accessList={nft.accessList}
            />
      </div>

      
    );
  };
  
  export default NFTDetailPopup;