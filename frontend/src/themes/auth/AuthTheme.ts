import { createTheme, Theme } from "@mui/material/styles";
import { themeLightOptions } from "../light/lightTheme";
import { themeDarkOptions } from "../dark/darkTheme";

export const createAuthTheme = (mode: "light" | "dark"): Theme => {
  const baseTheme = mode === "light" ? themeLightOptions : themeDarkOptions;

  return createTheme({
    ...baseTheme,
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: "600px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            padding: "32px",
            width: "100%",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          filled: {
            marginTop: "8px",
            marginBottom: "24px",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          h5: {
            textAlign: "center",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            marginTop: "16px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          },
        },
      },
    },
  });
};