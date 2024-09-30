import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, TextField, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import styles from './styles/AddAccessDialog.module.css';

const AddAccessDialog = ({ isOpen, onClose, onAddAccess }) => {
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
              <MenuItem value="Level 1">Level 1 - Viewer</MenuItem>
              <MenuItem value="Level 2">Level 2 - Commenter</MenuItem>
              <MenuItem value="Level 3">Level 3 - Editor</MenuItem>
              <MenuItem value="Level 4">Level 4 - Admin</MenuItem>
              <MenuItem value="Level 5">Level 5 - Owner</MenuItem>
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