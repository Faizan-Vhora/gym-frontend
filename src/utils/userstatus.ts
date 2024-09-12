export enum UserStatus {
  Active = 1,
  Inactive = 2
}

export enum UserStatusString {
  Active = 'active',
  Inactive = 'inactive'
}

export const getStatusStringText = (status: UserStatusString): string => {
  switch (status) {
    case UserStatusString.Active:
      return 'Active';
    case UserStatusString.Inactive:
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

// Explicitly specify the return type as string
export const getStatusText = (status: UserStatus): string => {
  switch (status) {
      case UserStatus.Active:
          return 'Active';
      case UserStatus.Inactive:
          return 'Inactive';
      default:
          return 'Unknown';
  }
};

export const statusOptions = [
  { value: UserStatus.Active, label: 'Active' },
  { value: UserStatus.Inactive, label: 'Inactive' },
];
