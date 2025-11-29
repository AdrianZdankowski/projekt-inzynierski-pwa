import { ThemeOptions } from "@mui/material/styles";

export const themeLightOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#546e7a',
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb',
    },
    error: {
      main: '#d32f2f',
    },
    divider: 'rgba(0,0,0,0.12)',
    text: {
      primary: '#111827',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#00796b',
    },
    success: {
      main: '#388e3c',
    },
  },
  shape: {
    borderRadius: 16,
  },
};