import React from 'react';
import { Dialog, DialogContent, CircularProgress } from '@mui/material';
import styles from './styles/apitestdialog.module.css';

const TestAPIDialog = ({ isOpen, onClose, testResult, isLoading }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      classes={{ paper: styles.testApiDialogPaper }}
    >
      <DialogContent className={styles.testApiDialogContent}>
        <h3 className={styles.testApiDialogTitle}>API Test Result</h3>
        {isLoading ? (
          <div className={styles.testApiLoadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <pre className={styles.testApiResultPre} dangerouslySetInnerHTML={{ __html: testResult }}></pre>
        )}
        <button className={styles.dialogClose} onClick={onClose}>
          ×
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default TestAPIDialog;