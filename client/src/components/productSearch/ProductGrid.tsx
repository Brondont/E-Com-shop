// src/components/ProductSearch/ProductGrid.tsx
import React from "react";
import { Box, Pagination, CircularProgress } from "@mui/material";
import ProductCard from "./ProductCard";
import { BaseProductData } from "../admin/products/BaseProduct";
import { useNavigate } from "react-router-dom";

interface ProductGridProps {
  products: BaseProductData[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  loading,
}) => {
  const navigate = useNavigate();

  const handleProductClick = (productID: number) => {
    navigate(`product/${productID}`);
  };

  return (
    <Box>
      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Product Grid */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "flex-start",
          mb: 3,
        }}
      >
        {products.map((product) => (
          <Box
            key={product.ID}
            sx={{
              flex: "1 1 calc(25% - 24px)",
              minWidth: "250px",
              maxWidth: "25%",
            }}
          >
            <ProductCard
              onClick={handleProductClick}
              product={product}
              loading={loading}
            />
          </Box>
        ))}
      </Box>

      {/* Pagination */}
      {!loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductGrid;
