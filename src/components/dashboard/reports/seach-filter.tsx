import * as React from 'react';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react'; // Import XIcon from phosphor-react
import debounce from 'lodash/debounce';

interface SearchFilterProps {
  searchValue?: string;
  onSearchChange: (searchTerm: string) => void;
}

export function SearchFilter({ onSearchChange }: SearchFilterProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300), // Adjust the debounce delay as needed
    [onSearchChange]
  );

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (): void => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <TextField
      label="Search"
      value={searchTerm}
      onChange={handleSearchChange}
      variant="outlined"
      fullWidth
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
