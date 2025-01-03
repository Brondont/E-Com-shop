import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ModelContainer from "../components/computerModel/ComputerModelContainer";
import CategoriesCard from "../components/categoriesCard/CategoriesCard";

import { useTheme } from "@mui/material";

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", bgcolor: "primary.main" }}
    >
      <Box
        id="Hero"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          minHeight: "70vh",
          width: "100vw",
          color: "white",
        }}
      >
        <Box
          sx={{ p: 5, display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
            Innovative Electronics for the Modern World
          </Typography>
          <Typography>
            Explore top-quality computers, accessories, and IT equipment at
            unbeatable prices. Shop now and experience the future of technology!
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              "@media (max-width: 600px)": {
                // Adjust for mobile devices
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          >
            <Button variant="contained" color="secondary">
              Shop Now
            </Button>
            <Button variant="contained" color="secondary">
              Learn More
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            minWidth: "40%",
            height: "700px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ModelContainer />
        </Box>
      </Box>
      <Box
        id="Categories"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "30px",
          minHeight: "90vh",
          width: "100vw",
          bgcolor: theme.background.damp,
          pt: 4,
          pb: 4,
        }}
      >
        <Typography variant="h3" sx={{ color: theme.palette.primary.main }}>
          Popular Categories
        </Typography>
        <Box
          sx={{
            width: "100%",
            pl: "4px",
            pr: "4px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
        </Box>
      </Box>
      <Box
        id="Companies"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "30px",
          height: "90vh",
          width: "100vw",
          pt: 4,
          pb: 4,
        }}
      >
        <Typography variant="h3" sx={{ color: "white" }}>
          Popular Brands
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
          <CategoriesCard title="" imageUrl="" />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
