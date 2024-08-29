export enum USER_STATUS {
    ACTIVE = 1,
    INACTIVE = 2
  }
  
  export const getStatusText = (status: USER_STATUS) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return 'Active';
      case USER_STATUS.INACTIVE:
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };
  
  export const statusOptions = [
    { value: USER_STATUS.ACTIVE, label: 'Active' },
    { value: USER_STATUS.INACTIVE, label: 'Inactive' },
  ];