import React, { useEffect, useState, useRef } from "react";
import {
  Switch,
  AppBar,
  TextField,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  useMediaQuery,
  Fade,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CallIcon from "@mui/icons-material/Call";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserProps } from "../../pages/user/ProfilePage";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

// Keep your existing MaterialUISwitch styled component...
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles("dark", {
          backgroundColor: "#8796A5",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.primary.main,
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.primary.main,
    }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles("dark", {
      backgroundColor: "#8796A5",
    }),
  },
}));

const SearchDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: "100%",
    height: "auto",
    padding: theme.spacing(2),
  },
}));

type NavbarProps = {
  user: UserProps;
  isAuth: boolean;
  handleLogout: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
};

const Navbar: React.FC<NavbarProps> = ({
  user,
  isAuth,
  handleLogout,
  toggleDarkMode,
  isDarkMode,
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0); // State to store cart item count
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  // Fetch cart item count
  useEffect(() => {
    if (!token || !apiUrl) return;
    const fetchCartItemCount = async () => {
      try {
        const res = await fetch(`${apiUrl}/cart`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const resData = await res.json();

        if (resData.error) {
          throw resData.error;
        }

        setCartItemCount(resData.cartItems.length);
      } catch (error) {
        console.error("Error fetching cart item count:", error);
      }
    };

    fetchCartItemCount();
  }, [apiUrl, token, location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentNavHeight = navbarRef.current?.offsetHeight || 0;

      if (window.scrollY > currentNavHeight) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }

      if (window.scrollY > lastScrollY && window.scrollY > currentNavHeight) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(window.scrollY);
    };

    setNavbarHeight(navbarRef.current?.offsetHeight || 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your search logic here
    setSearchDrawerOpen(false);
  };

  const handleCartClick = () => {
    navigate("/cart"); // Redirect to the cart page
  };

  const renderDesktopTopBar = () => (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        justifyContent: "space-between",
        px: { md: 4, lg: 20 },
      }}
    >
      <Box sx={{ display: "flex", gap: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <CallIcon fontSize="small" />
          <Typography>+213731355019</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <EmailIcon fontSize="small" />
          <Typography>byteforgesupport@gmail.com</Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isAuth ? (
          <>
            <Button
              startIcon={<PersonIcon />}
              href="/account"
              variant="text"
              sx={{ color: "white" }}
            >
              {user.email}
            </Button>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              variant="text"
              sx={{ color: "white" }}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button
              href="/login"
              startIcon={<LoginIcon />}
              variant="text"
              sx={{ color: "white" }}
            >
              Login
            </Button>
            <Button
              href="/signup"
              startIcon={<AssignmentIcon />}
              variant="text"
              sx={{ color: "white" }}
            >
              Signup
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "320px",
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            <span>Byte</span>
            <span style={{ color: theme.palette.primary.main }}>Forge</span>
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
      </Box>

      <List>
        {isAuth ? (
          <>
            <ListItemButton href="/account">
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={user.email}
                secondary="My Account"
                primaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton href="/login">
              <ListItemIcon>
                <LoginIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton href="/signup">
              <ListItemIcon>
                <AssignmentIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Sign up" />
            </ListItemButton>
          </>
        )}
        <Divider sx={{ my: 2 }} />
        <ListItem>
          <ListItemIcon>
            <CallIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Contact Us" secondary="+213731355019" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EmailIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Email Support"
            secondary="byteforgesupport@gmail.com"
            secondaryTypographyProps={{ noWrap: true }}
          />
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <ListItem>
          <ListItemText primary="Dark Mode" secondary="Toggle theme" />
          <MaterialUISwitch checked={isDarkMode} onChange={toggleDarkMode} />
        </ListItem>
      </List>
    </Drawer>
  );

  const renderSearchDrawer = () => (
    <SearchDrawer
      anchor="top"
      open={searchDrawerOpen}
      onClose={() => setSearchDrawerOpen(false)}
    >
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
            <Button
              variant="contained"
              type="submit"
              sx={{ minWidth: "100px" }}
            >
              Search
            </Button>
            <IconButton size="small" onClick={() => setSearchDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </form>
      </Box>
    </SearchDrawer>
  );

  const renderDesktopNavbar = () => (
    <Toolbar
      sx={{
        display: { xs: "none", md: "flex" },
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.default,
        p: "6px",
        px: { md: 4, lg: 20 },
      }}
    >
      <Box
        sx={{
          textAlign: "left",
          color: isDarkMode ? theme.palette.primary.contrastText : "black",
        }}
        component={Link}
        href="/"
        underline="none"
      >
        <Box display="flex">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Byte
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "primary.main", fontWeight: "bold" }}
          >
            Forge
          </Typography>
        </Box>
        <Typography>For Techies, By Techies</Typography>
      </Box>

      <Box sx={{ display: "flex", width: "50%" }}>
        <TextField
          size="small"
          label="Type here"
          variant="outlined"
          fullWidth
        />
        <Button href="/search" variant="contained">
          Search
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={handleCartClick}>
          <Badge badgeContent={cartItemCount} color="error">
            <ShoppingCartIcon color="primary" />
          </Badge>
        </IconButton>
        <MaterialUISwitch
          sx={{ m: 1 }}
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
      </Box>
    </Toolbar>
  );

  return (
    <>
      {isFixed && <Box sx={{ height: navbarHeight }} />}
      <Box
        ref={navbarRef}
        sx={{
          width: "100%",
          zIndex: 1200,
          transition: "transform 0.3s ease",
          transform:
            isFixed && isHidden ? "translateY(-100%)" : "translateY(0)",
          position: isFixed ? "fixed" : "relative",
          top: 0,
        }}
      >
        <AppBar position="static" elevation={1}>
          {renderDesktopTopBar()}
          {isMobile ? (
            <Toolbar
              sx={{
                justifyContent: "space-between",
                background: theme.palette.background.default,
                color: isDarkMode
                  ? theme.palette.primary.contrastText
                  : "black",
                minHeight: { xs: 56, sm: 64 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>

                <Link href="/" underline="none" color="inherit">
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    <span>Byte</span>
                    <span style={{ color: theme.palette.primary.main }}>
                      Forge
                    </span>
                  </Typography>
                </Link>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={() => setSearchDrawerOpen(true)}
                >
                  <SearchIcon />
                </IconButton>

                <IconButton color="inherit" onClick={handleCartClick}>
                  <Badge badgeContent={cartItemCount} color="error">
                    <ShoppingCartIcon color="primary" />
                  </Badge>
                </IconButton>
              </Box>
            </Toolbar>
          ) : (
            renderDesktopNavbar()
          )}
        </AppBar>
      </Box>

      {renderMobileDrawer()}
      {renderSearchDrawer()}
    </>
  );
};

export default Navbar;
