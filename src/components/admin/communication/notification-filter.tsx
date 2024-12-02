import * as React from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface NotificationFiltersProps {
  onSearchChange: (searchTerm: string) => void;
}

export function CommunicationFilters({ onSearchChange }: NotificationFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Create a debounced version of the search handler
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300), // Adjust the debounce delay as needed
    [onSearchChange] // Dependency array
  );

  // Clean up the debounce function on component unmount
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <TextField
      fullWidth
      label="Search by title"
      variant="outlined"
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton onClick={handleSearchClear} edge="end">
              <XIcon size={15} /> {/* Adjust size as needed */}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
