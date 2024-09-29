import React, { useEffect, useState, useRef } from "react";
import { useCommonLogic } from "./CommonComponet";
import { fetchData } from "../Utils/datafetch";
import styles from './styles/maincomponent.module.css';
import classNames from 'classnames'; // Import classnames library

// Adjust the path as needed
function AllCollections({ activeTab, setActiveTab }) {
  useEffect(() => {
    const allCollectionsData = fetchData("allCollections");
    setCollectionsData(allCollectionsData);
    const allNFTsData = fetchData("allNFTs");
    setNftsData(allNFTsData);
  }, []);

  const {
    navigate,
    allCollectionsRef,
    scrollToSection,
    handleCreateCollection,
  } = useCommonLogic();
  

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [nftsData, setNftsData] = useState([]);
  const [collectionsData, setCollectionsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(
    (activeTab === "allCollections"
      ? collectionsData.length
      : nftsData.length) / itemsPerPage
  );
  const currentCollections = collectionsData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const currentNFTs = nftsData.slice(indexOfFirstItem, indexOfLastItem);

  const handleRowClick = (id, type) => {
    if (type === "collection") {
      navigate(`/collection/${id}`);
    } else if (type === "nft") {
      navigate(`/nft/${id}`);
    }
  };

  return (
    <div>
      <div>
        <button
          className={classNames(styles.tab, {
            [styles.activeTab]: activeTab === "allCollections",
          })}
          onClick={() => {
            setActiveTab("allCollections");
            setCurrentPage(1);
          }}
        >
          All Collections
        </button>
        <button
          className={classNames(styles.tab, {
            [styles.activeTab]: activeTab === "allNFTs",
          })}
          onClick={() => {
            setActiveTab("allNFTs");
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
        {activeTab === "allCollections" ? (
          <>
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
                onClick={() => handleRowClick(item.id, "collection")}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.rowItem}>{item.creator}</div>
                <div className={styles.rowItem}>{item.model}</div>
                <div className={styles.rowItem}>{item.noOfNFTs}</div>
                <div className={styles.rowItem}>{item.contextWindow}</div>
              </div>
            ))}
          </>
        ) : (
          <>
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
                onClick={() => handleRowClick(item.id, "nft")}
              >
                <div className={styles.rowItem}>
                  {/* <span className={styles.itemNumber}>{index + 1}</span> */}
                  <span className={styles.itemNumber}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={classNames(styles.pageButton, {
                [styles.activePage]: currentPage === pageNumber,
              })}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default AllCollections;