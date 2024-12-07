import React from "react";
import { Card, CardContent, Box, Avatar, Typography, Button } from "@mui/material";
import MyBreadcrumbs from "../../components/myBreadcrumbs/MyBreadcrumbs";


const UserProfile: React.FC = () => {
  return (
    <>
      <MyBreadcrumbs />
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", bgcolor: "background.default" }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", mb: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                }}
              >
                U
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                John Doe
              </Typography>
              <Typography variant="body1" color="text.secondary">
                johndoe@example.com
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Profile Information
              </Typography>
              <Typography variant="body1">First Name: John</Typography>
              <Typography variant="body1">Last Name: Doe</Typography>
              <Typography variant="body1">Email: johndoe@example.com</Typography>
            </Box>

            <Box sx={{ mt: 4 }}>

              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Addresses
              </Typography>
              <Button href="/account/addresses" variant="outlined" color="primary">
                See Addresses
              </Button>
            </Box>
          </CardContent>
        </Card >
      </Box>
    </>
  );
};

export default UserProfile;

