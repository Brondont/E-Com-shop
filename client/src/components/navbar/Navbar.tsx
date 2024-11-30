import React, { useEffect, useState, useRef } from "react";
import { Switch, AppBar, TextField, Box, Toolbar, Typography, Button, IconButton } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useTheme } from "@mui/material";
import { styled } from '@mui/material/styles';


const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.primary.main,
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.primary.main,
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

type NavbarProps = {
  isAuth: boolean
  handleLogout: () => void
  toggleDarkMode: () => void
  isDarkMode: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isAuth, handleLogout, toggleDarkMode, isDarkMode }) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = navbarRef.current?.offsetHeight || 0;

      if (scrollY > navbarHeight) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }


      if (window.scrollY > lastScrollY) {
        setIsHidden(true);
        console.log("set hidden to true");
      }
      else {
        setIsHidden(false);
      }
      setLastScrollY(window.scrollY);
    }

    setNavbarHeight(navbarRef.current?.offsetHeight || 0);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  })

  return (
    <>
      {isFixed && <Box sx={{ height: navbarHeight }}></Box>}
      <Box
        ref={navbarRef}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          transition: "transform 0.3s ease",
          transform: isFixed && isHidden ? "translateY(-100%)" : "translateY(0)",
          position: isFixed ? "fixed" : "relative",
          top: isFixed && isHidden ? `-${navbarHeight}px` : "0",
        }}>
        <AppBar sx={{ position: "static" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", pl: 20, pr: 20 }} >
            <Box sx={{ display: "flex", gap: "20px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <CallIcon fontSize="small" />
                <Typography>
                  +213731355019
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <EmailIcon fontSize="small" />
                <Typography>
                  byteforgesupport@gmail.com
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isAuth ?
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Button variant="text" sx={{ color: "white" }}>kadi.steam@gmail.com</Button>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Button onClick={handleLogout} startIcon={<LogoutIcon />} variant="text" sx={{ color: "white" }}>Log out</Button>
                  </Box>
                </> :
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Button href="/login" startIcon={<LoginIcon />} variant="text" sx={{ color: "white" }}>Login</Button>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Button href="/signup" startIcon={<AssignmentIcon />} variant="text" sx={{ color: "white" }}>Signup</Button>
                  </Box>
                </>}
            </Box>

          </Box>
        </AppBar >
        <AppBar sx={{ position: "static", bgcolor: theme.background.damp }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", p: "6px" }}>
            <Box sx={{ textAlign: "center", color: "black" }}>
              <Box display="flex" justifyContent="center">
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Byte
                </Typography>
                <Typography variant="h5" sx={{ color: "primary.main", fontWeight: "bold" }}>Forge</Typography>
              </Box>
              <Typography>
                For Techies, By Techies
              </Typography>
            </Box>
            <Box sx={{ display: "flex", width: "50%" }}>
              <TextField size="small" label="Type here" variant="outlined" fullWidth />
              <Button variant="contained">Search</Button>
            </Box>
            <Box>
              <IconButton><ShoppingCartIcon color="primary" /></IconButton>
              <MaterialUISwitch sx={{ m: 1 }} checked={isDarkMode} onChange={toggleDarkMode} />
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  )
}

export default Navbar;
