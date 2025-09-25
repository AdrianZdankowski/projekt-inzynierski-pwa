import { createTheme } from "@mui/material/styles";

const FileListTheme = createTheme({
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: 40,
          height: 40,
          borderRadius: '50%',
          '&.pagination-active': {
            backgroundColor: '#2e7d32',
            color: 'white',
            borderColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
              borderColor: '#2e7d32'
            }
          },
          '&.pagination-inactive': {
            backgroundColor: 'transparent',
            color: '#2e7d32',
            borderColor: '#2e7d32',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              borderColor: '#2e7d32'
            }
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.pagination-nav': {
            color: '#2e7d32',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.1)'
            },
            '&.disabled': {
              color: 'rgba(0, 0, 0, 0.26)',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '&.search-input': {
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
            },
          }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          '&.sort-menu': {
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: 'none',
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 8
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.sort-menu-item': {
            padding: '9.6px 16px',
            '&:hover': { 
              backgroundColor: '#f5f5f5' 
            },
            '&.active': {
              backgroundColor: '#e8f5e8'
            }
          }
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.sort-menu-text': {
            fontWeight: 400,
            color: '#333',
            fontSize: '0.9rem',
            lineHeight: 0.7,
            display: 'flex',
            alignItems: 'center',
            height: 20,
            '&.active': {
              fontWeight: 600,
              color: '#2e7d32'
            }
          }
        }
      }
    }
  }
});

export default FileListTheme;
