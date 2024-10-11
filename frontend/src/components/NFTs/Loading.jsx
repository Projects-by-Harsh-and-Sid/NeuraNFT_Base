import React from 'react';

const Loading = () => (
  <div className="loading-container">
    <div className="loading-text">
      Loading<span className="loading-dots">...</span>
    </div>
  </div>
);

const styles = `
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: black;
  }

  .loading-text {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }

  .loading-dots {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;

export default () => (
  <>
    <style>{styles}</style>
    <Loading />
  </>
);