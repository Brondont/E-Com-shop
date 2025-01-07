// src/components/ProductSearch/ProductCard.tsx
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { BaseProductData } from "../admin/products/BaseProduct";

interface ProductCardProps {
  product: BaseProductData;
  onClick?: (productID: number) => void; // Callback when the card is clicked
  loading?: boolean; // Optional loading state
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  loading = false,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  return (
    <Card
      onClick={() => {
        onClick(product.ID);
      }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={
          loading ? "" : apiUrl.split("/api/")[0] + product.image.imagePath
        }
        alt={product.name}
        sx={{ objectFit: "cover" }}
      />

      {/* Product Details */}
      <CardContent>
        {loading ? (
          <>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="40%" height={20} />
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
          </>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={36} />
        ) : (
          <Button
            size="small"
            color="secondary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event from firing
            }}
            sx={{ width: "100%" }}
          >
            View Details
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ProductCard;
