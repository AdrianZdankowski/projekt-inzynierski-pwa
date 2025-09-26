import { createTheme } from "@mui/material/styles";

const AuthTheme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "600px !important",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "32px",
          marginTop: "64px", 
          backgroundColor: "#596275",
          color: "white",
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
          color: "white",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            color: "white",
            "&:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 1000px #596275 inset",
              WebkitTextFillColor: "white",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "white",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.7)",
            },
            "&:hover fieldset": {
              borderColor: "white",
            },
            "&.Mui-focused fieldset": {
              borderColor: "white",
            },
          },
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
          backgroundColor: "#06d07c9f",
          "&:hover": {
            backgroundColor: "#58B19F",
          },
        },
      },
    },
  },
});

export default AuthTheme;