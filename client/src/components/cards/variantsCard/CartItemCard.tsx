import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  SearchOffTwoTone,
} from "@mui/icons-material";
import { useFeedback } from "../../../FeedbackAlertContext";
import { formatPrice } from "../../../util/formatters";
import { CartItem } from "../../../pages/user/UserCartPage";

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemoveItem,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { showFeedback } = useFeedback();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.variant.inventory.quantity) {
      showFeedback("You've reached max quantity limit.", false);
      return;
    }
    onQuantityChange(item.ID, newQuantity);
  };

  return (
    <Card
      sx={{
        display: "flex",
        mb: 2,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 140, objectFit: "contain" }}
        image={apiUrl.split("/api")[0] + item.variant.images[0].imagePath}
        alt={item.variant.name}
      />
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="h6" component="div">
            {item.variant.name}
          </Typography>
          <IconButton
            onClick={() => onRemoveItem(item.ID)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Price: {formatPrice(item.variant.price)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <RemoveIcon />
          </IconButton>

          <TextField
            size="small"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
            sx={{ width: "50px" }}
          />

          <IconButton
            size="small"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.variant.inventory.quantity}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color:
              item.variant.inventory.quantity === 0
                ? "error.main"
                : "success.main",
            fontWeight: 600,
            mt: 2,
          }}
        >
          {item.variant.inventory.quantity === 0
            ? "Out of stock"
            : `In stock (${item.variant.inventory.quantity} units available)`}
        </Typography>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Subtotal:
          {formatPrice(item.variant.price * item.quantity)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CartItemCard;
