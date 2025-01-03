import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import React from "react";

const Footer: React.FC = () => {
  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <Box
      sx={{
        minHeight: "30vh",
        flexDirection: "column",
        bgcolor: "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "primary.contrastText",
          gap: "30px",
          p: 4,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Sign up for our news letter !
        </Typography>
        <Box
          sx={{
            display: "flex",
            minWidth: "350px",
            flexGrow: 1,
            maxWidth: "40%",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            label="Your e-mail"
            variant="filled"
            fullWidth
            color="secondary"
          />
          <Button variant="contained" size="small" color="secondary">
            Sign up
          </Button>
        </Box>
        <Button color="secondary" size="large" onClick={scrollUp}>
          Back to the top <ArrowUpwardIcon sx={{ ml: 1 }} />
        </Button>
      </Box>
      <Divider />
      <Box
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-around",
          flexWrap: "wrap",
          padding: "20px",
          color: "primary.contrastText",
          p: 4,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Information
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="/about-us" color="inherit" underline="hover">
              About Us
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="/privacy-policy" color="inherit" underline="hover">
              Privacy Policy
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link
              href="/terms-and-conditions"
              color="inherit"
              underline="hover"
            >
              Terms & Conditions
            </Link>
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Customer Service
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="/faq" color="inherit" underline="hover">
              FAQs
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="/returns" color="inherit" underline="hover">
              Returns & Refunds
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link href="/shipping" color="inherit" underline="hover">
              Shipping Information
            </Link>
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Contact Us
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: "5px", mb: 1 }}
          >
            <EmailIcon />
            <Typography variant="body2">
              Email: byteforgesupport@gmail.com
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: "5px", mb: 1 }}
          >
            <CallIcon />
            <Typography variant="body2">Phone: +(213)731355019</Typography>
          </Box>
          <Typography variant="body2">
            Address: 123 Main Street, City, Country
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Follow Us
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link
              href="https://www.facebook.com"
              target="_blank"
              color="inherit"
              underline="hover"
            >
              Facebook
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link
              href="https://www.twitter.com"
              target="_blank"
              color="inherit"
              underline="hover"
            >
              Twitter
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link
              href="https://www.instagram.com"
              target="_blank"
              color="inherit"
              underline="hover"
            >
              Instagram
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
