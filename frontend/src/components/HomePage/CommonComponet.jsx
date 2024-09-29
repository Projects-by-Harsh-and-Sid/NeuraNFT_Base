import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useCommonLogic() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('allCollections');
  const allCollectionsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateCollection = () => {
    navigate('/create_collection');
  };

  return {
    navigate,
    activeTab,
    setActiveTab,
    allCollectionsRef,
    scrollToSection,
    handleCreateCollection,
  };
}