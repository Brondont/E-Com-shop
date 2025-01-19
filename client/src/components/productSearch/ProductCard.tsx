import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Skeleton,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { BaseProductData } from "../admin/products/BaseProduct";

interface ProductCardProps {
  product?: BaseProductData;
  onClick?: (productID: number) => void;
  loading?: boolean;
  imageHeight?: number;
  showCategory?: boolean;
  showBrand?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  loading = false,
  imageHeight = 200,
  showCategory = true,
  showBrand = true,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [imageError, setImageError] = useState(false);

  // Handle truncation of description
  const truncateDescription = (text: string, maxLength: number = 100) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const strippedText = tempDiv.textContent || tempDiv.innerText || "";
    if (strippedText.length <= maxLength) return text;
    return strippedText.slice(0, maxLength).trim() + "...";
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(product.ID);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="rectangular" height={imageHeight} animation="wave" />
        <CardContent>
          <Skeleton variant="text" width="80%" height={32} />
          <Stack direction="row" spacing={1} sx={{ my: 1 }}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={100} height={24} />
          </Stack>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => onClick?.(product.ID)}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[4],
        },
        "&:focus-visible": {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: "2px",
        },
      }}
    >
      <Box sx={{ position: "relative", backgroundColor: "grey.100" }}>
        {imageError ? (
          <Box
            sx={{
              height: imageHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "grey.100",
            }}
          >
            <BrokenImageIcon sx={{ fontSize: 48, color: "grey.500" }} />
          </Box>
        ) : (
          <CardMedia
            component="img"
            height={imageHeight}
            image={`${apiUrl.split("/api/")[0]}${product.image.imagePath}`}
            alt={product.name}
            onError={handleImageError}
            sx={{
              objectFit: "cover",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.2,
              minHeight: "2.4em",
            }}
          >
            {product.name}
          </Typography>

          {(showCategory || showBrand) && (
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {showCategory && product.category && (
                <Chip
                  label={product.category.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {showBrand && product.brand && (
                <Chip
                  label={product.brand.name}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          <Box sx={{ position: "relative" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.5,
                minHeight: "4.5em",
              }}
            >
              {truncateDescription(product.description)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
