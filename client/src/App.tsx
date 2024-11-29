import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { FeedbackProvider } from "./FeedbackAlertContext"; import FeedbackAlert from "./components/feedbackAlert/FeedbackAlert";
import { AuthContext } from "./authContext";

import HomePage from "./pages/HomePage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import LoadingPage from "./pages/user/LoadinPage";
import { lightTheme, darkTheme } from "./theme";
import Navbar from "./components/navbar/Navbar";

export type UserProps = {
}

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<UserProps>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const setClientUser = (newUser: UserProps) => {
    setUser(newUser);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem("theme", prev ? "Light" : "Dark"); // if dark true set it to light if false set it to dark
      return !prev;
    });
  };

  const handleLogout = () => {
    setIsAuth(false);
    setUser(undefined);
    localStorage.removeItem("token");
  };

  const handleLogin = useCallback((token: string) => {
    fetch(`${apiUrl}/getUser`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          throw new Error(resData.error);
        }
        setUser(resData.user);
        setIsAuth(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        handleLogout();
        setIsLoading(false);
      });
  }, [])

  useEffect(() => {
    const token: string | null = localStorage.getItem("token");
    const themeChoice = localStorage.getItem("theme") === "Dark";
    setIsDarkMode(themeChoice);

    if (!token) {
      setIsLoading(false);
      return;
    }

    handleLogin(token);

  }, [handleLogin]);


  const getRoutes = () => {
    return (
      <>
        <Route path="/" element={<HomePage />} />
        {!isAuth &&
          <>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
          </>}
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    );
  };

  return (
    <Box>
      <FeedbackProvider>
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <CssBaseline enableColorScheme />
          <AuthContext.Provider
            value={{
              clientUser: user,
              setClientUser: setClientUser,
              handleLogout: handleLogout,
              toggleDarkMode: toggleDarkMode,
            }}
          >
            <Navbar isAuth={isAuth} handleLogout={handleLogout} />
            <Box sx={{ position: "relative" }}>
              <FeedbackAlert />
              {isLoading ? (
                <LoadingPage />
              ) : (
                <Routes>
                  {getRoutes()}
                </Routes>
              )}
            </Box>
          </AuthContext.Provider>
        </ThemeProvider>
      </FeedbackProvider>
    </Box>
  );
};

export default App;
