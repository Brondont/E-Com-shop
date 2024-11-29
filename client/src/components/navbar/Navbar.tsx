import React from "react";
import { AppBar, TextField, Box, Toolbar, Typography, Button, IconButton } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useTheme } from "@mui/material";

type NavbarProps = {
  isAuth: boolean
  handleLogout: () => void
}

const Navbar: React.FC<NavbarProps> = ({ isAuth, handleLogout }) => {
  const theme = useTheme();

  return <Box sx={{ position: "fixed", width: "100%", display: "flex", flexDirection: "column" }}>
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
        </Box>
      </Toolbar>
    </AppBar>

  </Box >
}

export default Navbar;
