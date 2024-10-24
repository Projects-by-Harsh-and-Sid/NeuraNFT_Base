import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainComponent from './components/HomePage/MainComponent';
// import CreateCollection from './components/CreateCollection';
// import ViewCollection from './components/ViewCollection';
import Profile from './components/Profile/ProfilePage';
import { AppProvider } from './WalletContext';
import CreateNFTCollection from './components/CreateForms/CreateCollections';
import ViewCollection from './components/ViewCollection';
import ViewNFTs from './components/NFTs/ViewNFTs';
import CreateNFT from './components/CreateForms/CreateNFT';
import Chat from './components/Chat/Chat';
import FullNFTPage from './components/NFTs/FullNFTPage';

function App() {
  return (
    <AppProvider>
    <Routes>
      <Route path="/" element={<MainComponent />} />
      {/* <Route path="/create_collection" element={<CreateCollection />} />
      <Route path="/view_collection" element={<ViewCollection />} /> */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/create_collection" element={<CreateNFTCollection />} />
      <Route path="/view_collection" element={<ViewCollection />} />
      <Route path="/collection/:collectionId" element={<ViewNFTs />} />
      <Route path="/create_nft" element={<CreateNFT />} />
      <Route path="/chat/:collectionId/:nftID" element={<Chat />} />
      <Route path="/collection/:collectionId/nft/:nftId" element={<FullNFTPage />} />
    </Routes>
    </AppProvider>
  );
}

export default App;