import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Typography, useTheme, Container } from "@mui/material";
import CategoryCard from "../components/cards/categoriesCard/CategoriesCard";
import BrandCard from "../components/cards/brandCard/BrandCard"; // Updated import
import { Category } from "../components/admin/productGroup/GroupCategory";
import { Brand } from "../components/admin/productGroup/GroupBrand";
import CardGrid from "../components/cards/cardGrid/CardGrid";
import Scene from "../components/modelViewer/ModelViewer";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // Updated state
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true); // Updated state
  const navigate = useNavigate();

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
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, [apiUrl]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/brands?count=5`); // Updated endpoint
      const resData = await res.json();
      if (resData.error) {
        throw resData.error;
      }
      setBrands(resData.brands); // Updated state
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoadingBrands(false); // Updated state
    }
  }, [apiUrl]);

  // Fetch categories and brands
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [apiUrl, fetchCategories, fetchBrands]);

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
            maxWidth: { xs: "100%", md: "60%" },

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
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: "100%", md: "40%" },
            mt: { xs: 4, md: 0 },
          }}
        >
          <Scene showLoading={false} modelPath="/models/Computer.glb" />
        </Box>
      </Box>

      {/* Categories Section */}
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
          renderCard={(category) => (
            <CategoryCard
              onClick={() => {
                navigate(`/search?categories=${category.ID}`);
              }}
              category={category}
            />
          )}
        />
      </Box>

      {/* Brands Section */}
      <Box
        id="Brands"
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
          Popular Brands
        </Typography>
        <CardGrid
          items={loadingBrands ? undefined : brands} // Updated state
          renderCard={(brand) => (
            <BrandCard // Updated component
              brand={brand} // Updated prop
              onClick={() => {
                navigate(`/search?brands=${brand.ID}`); // Updated query param
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default HomePage;
