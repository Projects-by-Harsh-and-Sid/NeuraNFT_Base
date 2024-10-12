import React from 'react';
import styles from './styles/ProgressBar.module.css'; // We'll create a separate CSS module for the progress bar

const ProgressBar = ({ currentStep }) => {
    const steps = ['NFT Details', 'Create NFT', 'Tokanize Data', 'Complete'];
  
    return (
      <div className={styles.progress}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`${styles.circle} ${
                index < currentStep ? styles.done : ''
              } ${index === currentStep ? styles.active : ''}`}
            >
              <span className={styles.label}>{index + 1}</span>
              <span className={styles.title}>{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`${styles.bar} ${
                  index < currentStep ? styles.done : ''
                } ${index === currentStep ? styles.active : ''}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };



export default ProgressBar;