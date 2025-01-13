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
import { Category, Manufacturer } from "../admin/products/BaseProductCreation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ProductSearchSidebarProps {
  filters: Filters;
  categories: Category[];
  manufacturers: Manufacturer[];
  onFilterChange: (newFilters: Filters) => void;
}

export const ProductSearchSidebar: React.FC<ProductSearchSidebarProps> = ({
  filters,
  categories,
  manufacturers,
  onFilterChange,
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [manufacturersExpanded, setManufacturersExpanded] = useState(true);

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

  // Handle manufacturer checkbox change
  const handleManufacturerChange = (manufacturerId: number) => {
    const newSelectedManufacturers = filters.selectedManufacturers.includes(
      manufacturerId
    )
      ? filters.selectedManufacturers.filter((id) => id !== manufacturerId)
      : [...filters.selectedManufacturers, manufacturerId];

    onFilterChange({
      ...filters,
      selectedManufacturers: newSelectedManufacturers,
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
            <List>
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

        {/* Manufacturers Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Manufacturers</Typography>
            <IconButton
              size="small"
              onClick={() => setManufacturersExpanded(!manufacturersExpanded)}
            >
              {manufacturersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={manufacturersExpanded}>
            <List>
              {manufacturers.map((manufacturer) => (
                <ListItem key={manufacturer.ID} sx={{ py: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.selectedManufacturers.includes(
                          manufacturer.ID
                        )}
                        onChange={() =>
                          handleManufacturerChange(manufacturer.ID)
                        }
                      />
                    }
                    label={manufacturer.name}
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
