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
          },
          '&.share-button': {
            fontSize: '0.75rem',
            padding: '4px 8px',
            minWidth: 'auto',
            borderColor: '#1976d2',
            color: '#1976d2',
            borderRadius: 12,
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(117, 117, 117, 0.1)'
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
          },
          '&.file-name': {
            fontWeight: 'bold',
            marginBottom: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.9rem',
            color: '#000000'
          },
          '&.file-size': {
            fontSize: '0.8rem',
            marginBottom: 0.2,
            color: 'rgba(0, 0, 0, 0.7)'
          },
          '&.file-date': {
            fontSize: '0.75rem',
            color: 'rgba(0, 0, 0, 0.7)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '&.file-card': {
            height: '280px',
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            background: '#ffffff',
            color: '#000000',
            position: 'relative',
            margin: '0 auto',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
              background: '#f0f0f0'
            },
            '&.even-row': {
              background: '#ffffff',
              '&:hover': {
                background: '#f0f0f0'
              }
            },
            '&.odd-row': {
              background: '#f8f9fa',
              '&:hover': {
                background: '#e8e8e8'
              }
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
          },
          '&.delete-button': {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.shared-chip': {
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            backgroundColor: '#4CAF50',
            color: 'white'
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&.file-card-content': {
            flexGrow: 1,
            textAlign: 'center',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }
        }
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          '&.file-card-actions': {
            justifyContent: 'center',
            padding: 10,
            paddingTop: 0,
            marginBottom: 6,
            minHeight: 'auto'
          }
        }
      }
    }
  }
});

export default FileListTheme;
