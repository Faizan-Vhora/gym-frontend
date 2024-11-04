const tableCss = {
  tableCell: {
    padding: '8px 30px',
    fontSize: '14px',
    color: '#555',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #eaeaea',
    textAlign: 'center',
    // whiteSpace: 'nowrap !important', // Prevent wrapping
    // overflow: 'hidden !important', // Hide overflowed text
    // textOverflow: 'ellipsis !important', // Show ellipsis for overflowed text
    // maxWidth: '55px !important',
  },

  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    padding: '16px 30px',
    backgroundColor: '#f9fafb !important', // Dark blue background for header
    color: '#667085 !important', // White text color
    borderBottom: '2px solid #ddd', // Light border at the bottom of the header
    // textAlign: 'center',
  },
  tableRow: {
    backgroundColor: '#fff !important',

    borderRadius: '8px', // Round the corners
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Shadow for a card-like appearance
    marginBottom: '10px', // Space between rows
    overflow: 'hidden', // Ensure round corners appear well
    '&:hover': {
      backgroundColor: '#f0f8ff !important', // Light blue on hover
    },
  },
};

export default tableCss;
