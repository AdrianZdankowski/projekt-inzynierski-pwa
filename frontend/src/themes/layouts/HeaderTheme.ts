import { createTheme } from "@mui/material/styles";

const HeaderTheme = createTheme({
  components: {
    MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#06d07c9f",
            color: "primary",
            position: "static"
          },
        },
      },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "70px",
          justifyContent: "space-between",
          "@media (min-width:600px)": {
            minHeight: "80px", 
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1.1rem", 
          padding: "8px 20px",
          color: "inherit",
          "&:hover": {
            backgroundColor: "#58B19F",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "1.1rem",
        },
        h6: {
          fontSize: "1.9rem", 
          textDecoration: "none",
          color: "inherit",
          fontWeight: 500,
        },
      },
    },
  },
});

export default HeaderTheme;