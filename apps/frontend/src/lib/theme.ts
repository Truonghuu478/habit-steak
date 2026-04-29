import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1c1812",
      light: "#2a2117",
      contrastText: "#fff8e8"
    },
    secondary: {
      main: "#2d6b45",
      contrastText: "#fff8e8"
    },
    error: {
      main: "#b04a2c",
      contrastText: "#fff8e8"
    },
    warning: {
      main: "#ffd2ba",
      contrastText: "#1c1812"
    },
    background: {
      default: "#f8f0df",
      paper: "#fffaf0"
    },
    text: {
      primary: "#1c1812",
      secondary: "#2a2117"
    }
  },
  typography: {
    fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
    h1: {
      fontSize: "clamp(2.6rem, 8vw, 6.5rem)",
      fontWeight: 700,
      lineHeight: 0.88,
      letterSpacing: "-0.07em"
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700
    },
    overline: {
      fontSize: "0.85rem",
      fontWeight: 900,
      letterSpacing: "0.18em",
      textTransform: "uppercase" as const,
      lineHeight: 1.5
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.55
    },
    body2: {
      fontSize: "1.2rem",
      lineHeight: 1.55
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          textTransform: "none" as const,
          fontWeight: 800,
          padding: "0.7rem 1.2rem"
        }
      },
      defaultProps: {
        disableElevation: true
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "2rem",
          border: "2px solid #2a2117",
          boxShadow: "10px 10px 0 #2a2117",
          backgroundColor: "rgba(255, 250, 240, 0.82)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "2rem",
          border: "2px solid #2a2117",
          boxShadow: "10px 10px 0 #2a2117",
          backgroundColor: "rgba(255, 250, 240, 0.82)"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined" as const,
        fullWidth: true,
        size: "medium" as const
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "1rem",
            backgroundColor: "#fffaf0",
            "& fieldset": {
              borderWidth: 2,
              borderColor: "#2a2117"
            },
            "&:hover fieldset": {
              borderColor: "#1c1812"
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2d6b45"
            }
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "2rem",
          border: "2px solid #2a2117",
          boxShadow: "10px 10px 0 #2a2117",
          backgroundColor: "rgba(255, 250, 240, 0.82)"
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "2rem",
          border: "2px solid #2a2117",
          fontWeight: 800,
          "&.MuiAlert-standardWarning": {
            backgroundColor: "#ffd2ba",
            color: "#1c1812"
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          border: "2px solid #2a2117",
          color: "#1c1812",
          fontWeight: 800,
          padding: "0.4rem 1rem",
          textTransform: "none" as const,
          "&.Mui-selected": {
            backgroundColor: "#1c1812",
            color: "#fff8e8",
            borderColor: "#1c1812",
            "&:hover": {
              backgroundColor: "#2a2117"
            }
          }
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: "0.5rem",
          "& .MuiToggleButton-root": {
            border: "2px solid #2a2117"
          }
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(28, 24, 18, 0.08)"
        }
      }
    }
  }
});

export default theme;
