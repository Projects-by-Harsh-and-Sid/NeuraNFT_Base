import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import styles from './styles/UpdateAccessDialog.module.css';

const UpdateAccessDialog = ({ isOpen, onClose, onUpdateAccess, accessList }) => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdateAccess(selectedAddress, newAccessLevel);
      setSelectedAddress('');
      setNewAccessLevel('');
      onClose();
    } catch (error) {
      console.error('Error updating access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth  classes={{ paper: styles.dialogPaper }}>
      <DialogContent className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>Update Access</h2>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <Select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              displayEmpty
              fullWidth
              className={styles.select}
              MenuProps={{
                classes: { paper: styles.menuPaper },
              }}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <span className={styles.placeholder}>Select Address</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                <span className={styles.placeholder}>Select Address</span>
              </MenuItem>
              {accessList.map((item, index) => (
                <MenuItem key={index} value={item.user}>{item.user}</MenuItem>
              ))}
            </Select>
            <Select
              value={newAccessLevel}
              onChange={(e) => setNewAccessLevel(e.target.value)}
              displayEmpty
              fullWidth
              className={styles.select}
              MenuProps={{
                classes: { paper: styles.menuPaper },
              }}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <span className={styles.placeholder}>Select New Access Level</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                <span className={styles.placeholder}>Select New Access Level</span>
              </MenuItem>
              <MenuItem value={1}>Level 1 - UseModel</MenuItem>
              <MenuItem value={2}>Level 2 - Resale</MenuItem>
              <MenuItem value={3}>Level 3 - CreateReplica</MenuItem>
              <MenuItem value={4}>Level 4 - ViewAndDownload</MenuItem>
              <MenuItem value={5}>Level 5 - EditData</MenuItem>
              <MenuItem value={6}>Level 6 - AbsoluteOwnership</MenuItem>
            </Select>
            <Button 
              onClick={handleSubmit} 
              className={styles.submitButton}
            >
              Update Access
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAccessDialog;