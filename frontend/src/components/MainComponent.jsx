import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/maincomponent.css';
import { useNavigate } from 'react-router-dom';

function MainComponent() {
  const [tronWebState, setTronWebState] = useState({
    installed: false,
    loggedIn: false,
  });
  const [address, setAddress] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [connectInitiated, setConnectInitiated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (connectInitiated) {
      const timer = setInterval(async () => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(timer);
          setTronWebState({
            installed: true,
            loggedIn: true,
          });
          const userAddress = window.tronWeb.defaultAddress.base58;
          setAddress(userAddress);
        } else if (window.tronWeb) {
          setTronWebState({
            installed: true,
            loggedIn: false,
          });
        } else {
          setTronWebState({
            installed: false,
            loggedIn: false,
          });
        }
      }, 500);

      return () => clearInterval(timer);
    }
  }, [connectInitiated]);

  const connectWallet = () => {
    if (window.tronWeb) {
      setConnectInitiated(true);
    } else {
      alert('Please install TronLink wallet extension.');
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const logout = () => {
    setTronWebState({
      installed: false,
      loggedIn: false,
    });
    setAddress(null);
    setConnectInitiated(false);
    setDropdownOpen(false);
  };

  const createCollection = () => {
    navigate('/create_collection');
  };

  const viewCollection = () => {
    navigate('/view_collection');
  };

  return (
    <div className='main-container'>
      <nav className="navbar">
        <div className="navbar-brand">NeuraNFT</div>
        <div className="navbar-menu">
          {!tronWebState.loggedIn ? (
            <button className="connect-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <div>
              <button className="dropdown-button" onClick={toggleDropdown}>
                {address.slice(0, 6) + '...' + address.slice(-4)}
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={createCollection} className="dropdown-item">Create </button>
                  <button onClick={viewCollection} className="dropdown-item">View </button>
                  <button onClick={logout} className="dropdown-item">Disconnect</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Rest of your application content */}
    </div>
  );
}

export default MainComponent;