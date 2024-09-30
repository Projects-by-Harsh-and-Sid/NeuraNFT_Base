import React from 'react';
import { Dialog, DialogContent, CircularProgress } from '@mui/material';
import styles from './styles/apidialog.module.css';

const APIDialog = ({ isOpen, onClose, apiKey, apiEndpoint, isLoading }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogContent className={styles.apiDialogContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className={styles.apiItem}>
              <span className={styles.apiLabel}>API Key:</span>
              <div className={styles.apiValueContainer}>
                <span className={styles.apiValue}>{apiKey}</span>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(apiKey)}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className={styles.apiItem}>
              <span className={styles.apiLabel}>API Endpoint:</span>
              <div className={styles.apiValueContainer}>
                <span className={styles.apiValue}>{apiEndpoint}</span>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(apiEndpoint)}
                >
                  Copy
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default APIDialog;