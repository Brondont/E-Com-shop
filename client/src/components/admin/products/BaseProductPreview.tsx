import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FactoryIcon from "@mui/icons-material/Factory";
import ImageIcon from "@mui/icons-material/Image";
import { BaseProductData } from "./BaseProduct";

interface BaseProductPreviewProps {
  product?: BaseProductData;
}

const BaseProductPreview: React.FC<BaseProductPreviewProps> = ({ product }) => {
  const theme = useTheme();
  const apiUrl = process.env.REACT_APP_API_URL;

  if (!product) return null;

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          {/* Image Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: { xs: "100%", md: 200 },
            }}
          >
            {product.image.imagePath ? (
              <Avatar
                variant="rounded"
                src={`${apiUrl?.split("/api/")[0]}${product.image.imagePath}`}
                alt={product.name}
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: 2,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.primary.main,
                    0.12
                  )}`,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                }}
              >
                <ImageIcon
                  sx={{ fontSize: 48, color: theme.palette.grey[400] }}
                />
              </Box>
            )}
          </Paper>

          {/* Content Section */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Header */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.text.primary,
                }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                ID: {product.ID}
              </Typography>
            </Box>

            {/* Description */}
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                ></div>
              </Typography>
            </Box>

            {/* Tags */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<LocalOfferIcon />}
                label={product.category?.name || "Uncategorized"}
                variant="outlined"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  "& .MuiChip-icon": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Chip
                icon={<FactoryIcon />}
                label={product.brand?.name || "Unknown brand"}
                variant="outlined"
                sx={{
                  borderColor: alpha(theme.palette.secondary.main, 0.2),
                  "& .MuiChip-icon": {
                    color: theme.palette.secondary.main,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BaseProductPreview;
