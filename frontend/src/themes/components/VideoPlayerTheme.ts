// theme.js
import { createTheme } from "@mui/material/styles";

const VideoPlayerTheme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginTop: '1rem',
          width: '9rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'white',
          fontSize: '1.5rem',
          '&.Mui-focused': {
            color: 'white',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        filled: {
          color: 'white',
          backgroundColor: '#747d8c',
          '& .MuiSelect-icon': {
            color: 'white',
          },
          '&:hover': {
            backgroundColor: '#2f3542',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#a4b0be',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'white',
          backgroundColor: '#a4b0be',
          '&.Mui-selected': {
            backgroundColor: '#2f3542',
          },
          '&:hover': {
            backgroundColor: '#747d8c',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#2f3542',
          },
        },
      },
    },
  },
});

export default VideoPlayerTheme;
