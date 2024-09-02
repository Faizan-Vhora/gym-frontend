const tableCss = {
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#555',
    borderBottom: '1px solid #eaeaea',
    whiteSpace: 'nowrap !important', // Prevent wrapping
    overflow: 'hidden !important', // Hide overflowed text
    textOverflow: 'ellipsis !important', // Show ellipsis for overflowed text
    maxWidth: '55px !important',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '12px 16px',
    backgroundColor: '#1a2a3a !important', // Dark blue background for header
    color: '#fff !important', // White text color
    borderBottom: '2px solid #ddd', // Light border at the bottom of the header
  },
  tableRow: {
    backgroundColor: '#fff',
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
