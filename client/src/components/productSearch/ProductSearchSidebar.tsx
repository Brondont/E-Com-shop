// src/components/ProductSearch/ProductSearchSidebar.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Checkbox,
  Collapse,
  IconButton,
  Button,
} from "@mui/material";
import { Filters } from "./types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Category } from "../admin/products/BaseProductCreation";

interface ProductSearchSidebarProps {
  filters: Filters;
  categories: Category[];
}

export const ProductSearchSidebar: React.FC<ProductSearchSidebarProps> = ({
  filters,
  categories,
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [priceRangeExpanded, setPriceRangeExpanded] = useState(true);

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "300px" },
        padding: 2,
        borderRight: { xs: "none", md: "1px solid #e0e0e0" },
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
        >
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <IconButton size="small">
            {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={categoriesExpanded}></Collapse>
      </Box>
    </Box>
  );
};

export default ProductSearchSidebar;
