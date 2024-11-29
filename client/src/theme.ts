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
  // allow configuration using `createTheme`
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
      main: "#4A148C", // Deep Purple
      dark: "#673AB7", // Royal Purple
    },
    secondary: {
      main: "#D1C4E9", // Lavender
    },
    background: {
      default: "#F5F5F5", // Light Gray for background
      paper: "#FFFFFF", // White for card/paper background
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
      dark: "#4A148C", // Deep Purple
    },
    secondary: {
      main: "#9575CD", // Lilac
    },
    background: {
      default: "#303030", // Dark Gray for background
      paper: "#424242", // Slightly lighter for paper/cards
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

