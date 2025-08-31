import { createTheme } from "@mui/material/styles";

const UserFilesTheme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          position: "relative",
          minHeight: "100vh",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          textAlign: "center",
          mt: 20,
          color: "white",
          fontSize: 24,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          position: "fixed",
          bottom: 48,
          right: 48,
          backgroundColor: "#06d07c9f",
          width: 72,
          height: 72,
          fontSize: 32,
          "&:hover": {
            backgroundColor: "#58B19F",
          },
        },
      },
    },
  },
});

export default UserFilesTheme;