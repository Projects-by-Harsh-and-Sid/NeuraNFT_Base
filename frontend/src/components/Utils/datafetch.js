import collectionsData from '../HomePage/collections.json';
import nftsData from '../HomePage/nfts.json';

export const fetchAllCollections = () => {
  return collectionsData.collections;
};

export const fetchAllNFTs = () => {
  return nftsData.nfts;
};

export const fetchMyData = (address) => {
  const myCollections = collectionsData.collections.filter(
    collection => collection.owner === address
  );
  const myNFTs = nftsData.nfts.filter(
    nft => nft.owner === address
  );
  
  return { myCollections, myNFTs };
};

export const fetchData = (type, address = null) => {
  switch (type) {
    case 'allCollections':
      return fetchAllCollections();
    case 'allNFTs':
      return fetchAllNFTs();
    case 'myData':
      if (!address) throw new Error('Address is required for myData fetch');
      return fetchMyData(address);
    default:
      throw new Error('Invalid fetch type');
  }
};