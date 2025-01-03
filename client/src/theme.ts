import { createTheme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    borderColor: {
      primary: string;
    };
    background: {
      damp: string;
    };
  }
  // Allow configuration using `createTheme`
  interface ThemeOptions {
    borderColor?: {
      primary?: string;
    };
    background?: {
      damp?: string;
    };
  }
}

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: 14,
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded buttons
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: "4px",
        },
      },
    },
  },
};

const lightThemeOptions: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#673AB7", // Deep Purple
      contrastText: "#FFFFFF", // White text on primary
    },
    secondary: {
      main: "#D1C4E9", // Lavender
      contrastText: "#000", // Black text on secondary
    },
    background: {
      default: "#F5F5F5", // Light Gray for background
      paper: "#FFFFFF", // White for card/paper background
    },
    error: {
      main: "#D32F2F", // Red
      contrastText: "#FFFFFF", // White text on error
    },
    warning: {
      main: "#FFA000", // Amber
      contrastText: "#000000", // Black text on warning
    },
    info: {
      main: "#0288D1", // Light Blue
      contrastText: "#FFFFFF", // White text on info
    },
    success: {
      main: "#388E3C", // Green
      contrastText: "#FFFFFF", // White text on success
    },
  },
  background: {
    damp: "#F5F5F5", // Section background
  },
  borderColor: {
    primary: "#D1C4E9", // Lavender for borders
  },
};

const darkThemeOptions: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#7C4DFF", // Electric Violet
      contrastText: "#FFFFFF", // White text on primary
    },
    secondary: {
      main: "#9575CD", // Lilac
      contrastText: "#000000", // Black text on secondary
    },
    background: {
      default: "#303030", // Dark Gray for background
      paper: "#424242", // Slightly lighter for paper/cards
    },
    error: {
      main: "#D32F2F", // Red
      contrastText: "#FFFFFF", // White text on error
    },
    warning: {
      main: "#FFA000", // Amber
      contrastText: "#000000", // Black text on warning
    },
    info: {
      main: "#0288D1", // Light Blue
      contrastText: "#FFFFFF", // White text on info
    },
    success: {
      main: "#388E3C", // Green
      contrastText: "#FFFFFF", // White text on success
    },
  },
  background: {
    damp: "#303030", // Damp background for dark mode
  },
  borderColor: {
    primary: "#4F4F4F", // Neutral dark for borders
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
