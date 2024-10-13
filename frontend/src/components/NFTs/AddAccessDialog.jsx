import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, TextField, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import styles from './styles/AddAccessDialog.module.css';

const AddAccessDialog = ({ isOpen, onClose, onAddAccess}) => {
  const [address, setAddress] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
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
      await onAddAccess(address, accessLevel);
      setAddress('');
      setAccessLevel('');
      onClose();
    } catch (error) {
      console.error('Error adding access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth  classes={{ paper: styles.dialogPaper }}>
      <DialogContent className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>Add Access</h2>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.input}
              InputProps={{
                className: styles.inputText,
              }}
              InputLabelProps={{
                className: styles.inputLabel,
              }}
            />
            <Select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              displayEmpty
              fullWidth
              className={styles.select}
              MenuProps={{
                classes: { paper: styles.menuPaper },
              }}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <span className={styles.placeholder}>Select Access Level</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                <span className={styles.placeholder}>Select Access Level</span>
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
              Add Access
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddAccessDialog;