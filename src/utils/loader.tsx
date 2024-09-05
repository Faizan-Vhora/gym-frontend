import React from 'react';
import { Box } from '@mui/material'; // Optional, for Material-UI styling

export const CustomLoader = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
        zIndex: 9999, // Make sure it appears above other content
      }}
    >
      <img
        src="/assets/loader5.gif" // Replace with your custom loader image path
        alt="Loading"
        style={{ width: '200px', height: '200px' }} // Customize size
      />
    </Box>
    // <Box display="flex" justifyContent="center" alignItems="center" height="100%">
    //   <img
    //     src="/assets/Jumpingball.gif" // Replace with your custom image path
    //     alt="Loading"
    //     style={{ width: '100px', height: '100px' }} // Customize size
    //   />
    // </Box>
  );
};
