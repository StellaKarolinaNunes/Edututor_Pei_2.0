import React from 'react';
import styles from './Logo.module.css';
import logoImg from '@/assets/images/logotipo_Horizontal.svg';

export const Logo: React.FC = () => {
  return (
    <div className={styles.container}>
      <img
        src={logoImg}
        alt="Vinculo PEI Logo"
        className="h-20 sm:h-24 w-auto object-contain"
      />
    </div>
  );
};