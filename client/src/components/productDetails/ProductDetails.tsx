import React from "react";
import { Box, Divider, Typography, Chip, Stack } from "@mui/material";
import { VariantData } from "../admin/products/VariantsTable";
import { formatDate, formatPrice } from "../../util/formatters";
import { LocalShipping, AccessTime } from "@mui/icons-material";

interface ProductDetailsProps {
  variant: VariantData;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ variant }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: { xs: 2, md: 3 },
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          {variant.name}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography
          variant="h4"
          color="primary"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {formatPrice(variant.price)}
          {variant.inventory.quantity <= 5 &&
            variant.inventory.quantity > 0 && (
              <Chip
                label="Low Stock"
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  variant.inventory.quantity === 0
                    ? "error.main"
                    : "success.main",
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color:
                  variant.inventory.quantity === 0
                    ? "error.main"
                    : "success.main",
                fontWeight: 600,
              }}
            >
              {variant.inventory.quantity === 0
                ? "Out of stock"
                : `In stock (${variant.inventory.quantity} units available)`}
            </Typography>
          </Box>

          {variant.inventory.quantity > 0 && (
            <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShipping sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Free Delivery
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTime sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Fast Dispatch
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Product Description */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "text.primary",
          }}
        >
          About this item
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
            letterSpacing: "0.015em",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: variant.description }}></div>
        </Typography>
      </Box>

      <Divider />

      {/* Additional Details */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "text.primary",
          }}
        >
          Product Details
        </Typography>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(variant.UpdatedAt)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Product Added
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(variant.CreatedAt)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Product Reference
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              #{variant.productID}-{variant.ID}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProductDetails;
