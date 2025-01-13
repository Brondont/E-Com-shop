import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  styled,
  alpha,
} from "@mui/material";
import { VariantData } from "../admin/products/VariantsTable";
import { formatPrice } from "../../util/formatters";

interface VariantSelectorProps {
  variants: VariantData[];
  selectedVariant: VariantData;
  onVariantChange: (variant: VariantData) => void;
}

const VariantOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: "pointer",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${
    selected ? theme.palette.primary.main : theme.palette.divider
  }`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.04)
    : "transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Available Options
      </Typography>

      <RadioGroup
        value={selectedVariant.ID}
        onChange={(e) => {
          const variant = variants.find((v) => v.ID === Number(e.target.value));
          if (variant) onVariantChange(variant);
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "200px",
            overflow: "auto",
            gap: 1.5,
          }}
        >
          {variants.map((variant) => (
            <VariantOption
              key={variant.ID}
              selected={selectedVariant.ID === variant.ID}
              onClick={() => onVariantChange(variant)}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  value={variant.ID}
                  control={<Radio />}
                  label=""
                  sx={{ m: 0 }}
                />

                {variant.images[0] && (
                  <Box
                    component="img"
                    src={apiUrl.split("/api/")[0] + variant.images[0].imagePath}
                    alt={variant.name}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{ color: "text.primary" }}
                    >
                      {variant.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="primary.main"
                      fontWeight={600}
                    >
                      {formatPrice(variant.price)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor:
                          variant.inventory.quantity > 0
                            ? "success.main"
                            : "error.main",
                      }}
                    />
                    <Typography
                      variant="body2"
                      color={
                        variant.inventory.quantity > 0
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      {variant.inventory.quantity > 0
                        ? `In Stock (${variant.inventory.quantity})`
                        : "Out of Stock"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </VariantOption>
          ))}
        </Box>
      </RadioGroup>
    </Box>
  );
};

export default VariantSelector;
