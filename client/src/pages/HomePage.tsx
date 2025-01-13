import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Typography, useTheme, Container } from "@mui/material";
import CategoryCard from "../components/cards/categoriesCard/CategoriesCard";
import ManufacturerCard from "../components/cards/manufacturersCard/ManufacturersCard";
import {
  Category,
  Manufacturer,
} from "../components/admin/products/BaseProductCreation";
import CardGrid from "../components/cards/cardGrid/CardGrid";
import Scene from "../components/modelViewer/ModelViewer";

const HomePage: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/categories?count=5`);
      const resData = await res.json();
      if (resData.error) {
        throw resData.error;
      }
      setCategories(resData.categories);
    } catch (error) {
    } finally {
      setLoadingCategories(false);
    }
  }, [apiUrl]);

  const fetchManufacturers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/manufacturers?count=5`);
      const resData = await res.json();
      if (resData.error) {
        throw resData.error;
      }
      setManufacturers(resData.manufacturers);
    } catch (error) {
      console.error("Failed to fetch manufacturers:", error);
    } finally {
      setLoadingManufacturers(false);
    }
  }, [apiUrl]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, [apiUrl, fetchCategories, fetchManufacturers]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Hero Section */}
      <Box
        id="Hero"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "70vh",
          width: "100%",
          px: { xs: 2, md: 8 },
          bgcolor: theme.palette.primary.main,
          color: "white",
        }}
      >
        {/* Hero Text */}
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "40%" }, // Adjust width for text
            display: "flex",
            flexDirection: "column",
            gap: 3,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Innovative Electronics for the Modern World
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Explore top-quality computers, accessories, and IT equipment at
            unbeatable prices. Shop now and experience the future of technology!
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ px: 4, py: 2 }}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              sx={{ px: 4, py: 2 }}
            >
              Learn More
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            mt: { xs: 4, md: 0 },
          }}
        >
          <Scene showLoading={false} modelPath="/models/Computer.glb" />
        </Box>
      </Box>

      <Box
        id="Categories"
        sx={{
          width: "100%",
          p: 8,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: theme.palette.text.primary,
            mb: 4,
          }}
        >
          Popular Categories
        </Typography>
        <CardGrid
          items={loadingCategories ? undefined : categories}
          renderCard={(category) => <CategoryCard category={category} />}
        />
      </Box>

      <Box
        id="Manufacturers"
        sx={{
          width: "100%",
          p: 8,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: theme.palette.text.primary,
            mb: 4,
          }}
        >
          Popular Manufacturers
        </Typography>
        <CardGrid
          items={loadingManufacturers ? undefined : manufacturers}
          renderCard={(manufacturer) => (
            <ManufacturerCard manufacturer={manufacturer} />
          )}
        />
      </Box>
    </Box>
  );
};

export default HomePage;
