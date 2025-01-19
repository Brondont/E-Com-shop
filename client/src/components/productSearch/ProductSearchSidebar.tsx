import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Collapse,
  IconButton,
} from "@mui/material";
import { Filters } from "./types";
import { Category, Brand } from "../admin/products/BaseProductCreation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ProductSearchSidebarProps {
  filters: Filters;
  categories: Category[];
  brands: Brand[];
  onFilterChange: (newFilters: Filters) => void;
}

export const ProductSearchSidebar: React.FC<ProductSearchSidebarProps> = ({
  filters,
  categories,
  brands,
  onFilterChange,
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(true); // Updated state

  // Handle category checkbox change
  const handleCategoryChange = (categoryId: number) => {
    const newSelectedCategories = filters.selectedCategories.includes(
      categoryId
    )
      ? filters.selectedCategories.filter((id) => id !== categoryId)
      : [...filters.selectedCategories, categoryId];

    onFilterChange({
      ...filters,
      selectedCategories: newSelectedCategories,
    });
  };

  // Handle brand checkbox change
  const handleBrandChange = (brandId: number) => {
    const newSelectedBrands = filters.selectedBrands.includes(brandId)
      ? filters.selectedBrands.filter((id) => id !== brandId)
      : [...filters.selectedBrands, brandId];

    onFilterChange({
      ...filters,
      selectedBrands: newSelectedBrands,
    });
  };

  return (
    <Card sx={{ height: "100%", minWidth: "10vw" }}>
      <CardContent>
        {/* Categories Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Categories</Typography>
            <IconButton
              size="small"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            >
              {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={categoriesExpanded}>
            <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
              {categories.map((category) => (
                <ListItem key={category.ID} sx={{ py: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.selectedCategories.includes(
                          category.ID
                        )}
                        onChange={() => handleCategoryChange(category.ID)}
                      />
                    }
                    label={category.name}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>

        {/* Brands Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Brands</Typography>
            <IconButton
              size="small"
              onClick={() => setBrandsExpanded(!brandsExpanded)}
            >
              {brandsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={brandsExpanded}>
            <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
              {brands.map((brand) => (
                <ListItem key={brand.ID} sx={{ py: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.selectedBrands.includes(brand.ID)}
                        onChange={() => handleBrandChange(brand.ID)}
                      />
                    }
                    label={brand.name}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductSearchSidebar;
