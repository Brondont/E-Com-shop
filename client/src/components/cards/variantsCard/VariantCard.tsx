import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { VariantData } from "../../admin/products/VariantsTable";

interface VariantCardProps {
  variant: VariantData;
  isSelected: boolean;
  onClick?: () => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  isSelected,
  onClick,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        border: (theme) =>
          isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", height: 140 }}>
        <CardMedia
          component="img"
          sx={{ width: 140 }}
          image={apiUrl.split("/api")[0] + variant.images[0].imagePath}
          alt={variant.name}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="body1" noWrap>
            {variant.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ${variant.price.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stock: {variant.inventory.quantity}
            </Typography>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default VariantCard;
