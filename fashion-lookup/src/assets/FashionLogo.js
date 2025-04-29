import React from 'react';
import logoImage from './logoR.png'; // You'll need to add your logo image to the assets folder

function FashionLogo() {
  return (
    <img 
      src={logoImage} 
      alt="Fashion Lookup Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
}

export default FashionLogo;