import * as React from 'react';
import type { SxProps } from '@mui/material/styles';
import { display } from '@mui/system';
import { Stack, Typography } from '@mui/material';


export interface NoDataPlaceholderProps {
  sx?: SxProps;
  title?: string;
  description?: string;
  image?: string;
}

export function NoDataPlaceholder({ title, description, image, sx }: NoDataPlaceholderProps): React.JSX.Element {



    const placeholderTitle = ()=>{
        return  title || 'No Data Found'; 
    };

    const placeholderDescription = ()=>{
        return  description || 'Default description'; 
    };

    const placeholderImage = ()=>{
        return  image || '/assets/no-data.jpg'; 
        
    };

  return (
    <>
    <Stack sx={{display:'flex', alignItems:'center',justifyContent:'center',marginTop:'10%' }}>
      
      {/* <p> {placeholderDescription()}</p> */}
      <img 
        src={placeholderImage()} 
        alt={title || 'Placeholder Image'} 
        style={{ maxWidth: '100%', height: '150px' }} 
      />
    <Typography sx={{marginTop:'30px', fontFamily: '"Audiowide", sans-serif',fontWeight:"500"}}  > {placeholderTitle()}</Typography>
    </Stack>
    </>
  );
}
