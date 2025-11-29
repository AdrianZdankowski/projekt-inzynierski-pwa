import { ThemeOptions } from "@mui/material/styles";

export const themeDarkOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: {
        main: '#4caf50',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#819ca9',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      error: {
        main: '#ef5350',
      },
      divider: 'rgba(0,0,0,0.12)',
      text: {
        primary: '#e0e0e0',
      },
      warning: {
        main: '#ff9800',
      },
      info: {
        main: '#26a69a',
      },
      success: {
        main: '#4caf50',
      },
    },
    shape: {
      borderRadius: 16,
    },
  };