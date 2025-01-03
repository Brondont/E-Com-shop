import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Divider,
  useTheme,
  Tooltip,
  ListSubheader,
  Button,
} from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const drawerWidth = 260;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : theme.spacing(7),
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      backgroundColor: theme.palette.background.default,
      overflowX: "hidden",
    },
  }),
  ...(!open && {
    "& .MuiDrawer-paper": {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      backgroundColor: theme.palette.background.default,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(8),
      },
    },
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  minHeight: 64,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const sections = [
  { name: "Dashboard", path: "dashboard", icon: <DashboardIcon /> },
  { name: "Products", path: "products", icon: <ShoppingCartIcon /> },
  { name: "Users", path: "users", icon: <PeopleIcon /> },
  { name: "Settings", path: "settings", icon: <SettingsIcon /> },
];

interface UserProps {
  email: string;
}

interface SidebarProps {
  onSelect: (section: string) => void;
  selectedSection: string;
  user: UserProps;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSelect,
  selectedSection,
  user,
  handleLogout,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton
          onClick={toggleDrawer}
          sx={{ color: theme.palette.text.primary }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </DrawerHeader>

      <List sx={{ px: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <Tooltip
            title={!open ? "Return to Home" : ""}
            placement="right"
            arrow
          >
            <StyledListItemButton
              onClick={handleHomeClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Return to Home"
                sx={{
                  opacity: open ? 1 : 0,
                  "& .MuiTypography-root": {
                    fontWeight: 500,
                  },
                }}
              />
            </StyledListItemButton>
          </Tooltip>
        </ListItem>
        <Divider sx={{ my: 1 }} />

        {sections.map((section) => (
          <>
            <ListItem key={section.path} disablePadding>
              <Tooltip
                title={!open ? section.name : ""}
                placement="right"
                arrow
              >
                <StyledListItemButton
                  selected={section.path === selectedSection}
                  onClick={() => onSelect(section.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.name}
                    sx={{
                      opacity: open ? 1 : 0,
                      "& .MuiTypography-root": {
                        fontWeight: 500,
                      },
                    }}
                  />
                </StyledListItemButton>
              </Tooltip>
            </ListItem>
            {section.name === "Dashboard" && open && (
              <ListSubheader
                sx={{
                  backgroundColor: "transparent",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  py: 1,
                }}
              >
                MANAGE
              </ListSubheader>
            )}
          </>
        ))}
      </List>

      {user && (
        <UserSection>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              {open && (
                <Box sx={{ overflow: "hidden" }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              )}
            </Box>
            {open && (
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                color="error"
                fullWidth
                size="small"
              >
                Logout
              </Button>
            )}
            {!open && (
              <Tooltip title="Logout" placement="right" arrow>
                <IconButton onClick={handleLogout} size="small">
                  <LogoutIcon color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </UserSection>
      )}
    </Drawer>
  );
};

export default Sidebar;
