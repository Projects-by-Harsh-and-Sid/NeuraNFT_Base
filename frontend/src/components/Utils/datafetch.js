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
    collection => collection.creator === address
  );
  const myNFTs = nftsData.nfts.filter(
    nft => nft.owner === address
  );
  
  return { myCollections, myNFTs };
};

export const collection_nft = (collection_address) => {
    // const myCollections = collectionsData.collections.filter(
    //     collection => collection.creator === collection_address
    // );
    const myNFTs = nftsData.nfts.filter(
        nft => nft.collectionaddress === collection_address
    );
    
    return { myNFTs };
    };
export const collection_from_id = (collection_id) => {
    const myCollections = collectionsData.collections.filter(
        collection => collection.id === collection_id
    );
    return { myCollections };
    }

export const fetchData = (type, address = null) => {
  switch (type) {
    case 'allCollections':
      return fetchAllCollections();
    case 'allNFTs':
      return fetchAllNFTs();
    case 'myData':
      if (!address) throw new Error('Address is required for myData fetch');
      return fetchMyData(address);
    case 'collection_nft':
        if (!address) throw new Error('Address is required for myData fetch');
        return collection_nft(address);
    case 'collection_from_id':
        if (!address) throw new Error('Address is required for myData fetch');
        return collection_from_id(address);
    default:
      throw new Error('Invalid fetch type');
  }
};