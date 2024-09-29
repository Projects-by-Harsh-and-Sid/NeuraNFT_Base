import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainComponent from './components/MainComponent';
// import CreateCollection from './components/CreateCollection';
// import ViewCollection from './components/ViewCollection';
import Profile from './components/ProfilePage';
import { AppProvider } from './AppContext';
import CreateNFTCollection from './components/CreateCollections';

function App() {
  return (
    <AppProvider>
    <Routes>
      <Route path="/" element={<MainComponent />} />
      {/* <Route path="/create_collection" element={<CreateCollection />} />
      <Route path="/view_collection" element={<ViewCollection />} /> */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/create_collection" element={<CreateNFTCollection />} />
    </Routes>
    </AppProvider>
  );
}

export default App;