import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainComponent from './components/MainComponent';
// import CreateCollection from './components/CreateCollection';
// import ViewCollection from './components/ViewCollection';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainComponent />} />
      {/* <Route path="/create_collection" element={<CreateCollection />} />
      <Route path="/view_collection" element={<ViewCollection />} /> */}
    </Routes>
  );
}

export default App;