import { createTheme } from "@mui/material/styles";

const UploadFileTheme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: 24,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Roboto', sans-serif",
        },
        h5: {
          fontSize: 24,
          fontWeight: 600,
          color: "#333",
        },
        body1: {
          color: "#666",
          fontSize: "1rem",
          marginTop: "12px",
        },
        body2: {
          color: "#777",
          fontSize: "0.95rem",
          marginTop: "12px",
        },
        h3: {
          fontSize: "2.5rem",
          textAlign: "center",
          mb: 16,
          transition: "color 0.2s ease-in-out",
       
          "&.selectedFile": {
            color: "#999",
            opacity: 0.8,
          },
          "&.dragOver": {
            color: "#1976d2",
            transform: "scale(1.05)",
          },
          "&.defaultState": {
            color: "#666",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          marginBottom: "8px", 
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          height: "50px"
        },
        message: {
          fontSize: "0.95rem", 
        },
        action: {
          marginLeft: "auto",  
        },
        icon: {
          marginRight: "8px", 
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.05)",
          },
        },
      },
    },  
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          minWidth: "130px",
          fontSize: "1rem",
          padding: "10px 20px",
        },
        contained: {
          backgroundColor: "#06d07c9f",
          "&:hover": {
            backgroundColor: "#58B19F",
          },
        },
        outlined: {
          borderColor: "#ccc",
          "&:hover": {
            borderColor: "#1976d2",
            backgroundColor: "#f8f9fa",
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          marginTop: "auto",
          marginBottom: 16,
          justifyContent: "center",
        },
      },
    },
  },
});

export default UploadFileTheme;