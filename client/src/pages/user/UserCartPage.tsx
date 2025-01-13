import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, CircularProgress, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { ShoppingCart, Store, ArrowForward } from "@mui/icons-material";
import { useFeedback } from "../../FeedbackAlertContext";
import CartItemCard from "../../components/cards/variantsCard/CartItemCard";
import { formatPrice } from "../../util/formatters";

export interface CartItem {
  ID: number;
  variant: {
    name: string;
    price: number;
    images: { imagePath: string }[];
    inventory: { quantity: number };
  };
  quantity: number;
}

const UserCartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);
  const { showFeedback } = useFeedback();

  const token = localStorage.getItem("token");
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchCartItems = useCallback(async () => {
    if (!token || !apiUrl) return;

    try {
      const res = await fetch(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCartItems(resData.cartItems);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else showFeedback("Error loading your cart. Please try again.", false);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token, showFeedback]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleDeleteCartItem = async (cartItemId: number) => {
    if (processingItemId) return;
    setProcessingItemId(cartItemId);

    try {
      const res = await fetch(`${apiUrl}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.ID !== cartItemId)
      );
      showFeedback("Item removed successfully", true);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else showFeedback("Failed to remove item. Please try again.", false);
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleQuantityUpdate = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    if (isUpdating || processingItemId) return;
    setIsUpdating(true);
    setProcessingItemId(cartItemId);

    try {
      const res = await fetch(`${apiUrl}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemID: cartItemId, newQuantity }),
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.ID === cartItemId ? resData.cartItem : item
        )
      );
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else showFeedback("Failed to update quantity. Please try again.", false);
    } finally {
      setIsUpdating(false);
      setProcessingItemId(null);
    }
  };

  const calculateTotal = useCallback((): number => {
    return cartItems.reduce(
      (total, item) => total + item.variant.price * item.quantity,
      0
    );
  }, [cartItems]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          gap: 3,
        }}
      >
        <ShoppingCart sx={{ fontSize: 64, color: "text.secondary" }} />
        <Typography variant="h5" color="text.secondary">
          Your cart is empty
        </Typography>
        <LoadingButton
          variant="contained"
          endIcon={<Store />}
          onClick={() => navigate("/search")}
        >
          Start Shopping
        </LoadingButton>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Shopping Cart
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: "1 1 auto", maxHeight: "100vh", overflow: "auto" }}>
          {cartItems.map((item) => (
            <CartItemCard
              key={item.ID}
              item={item}
              onQuantityChange={handleQuantityUpdate}
              onRemoveItem={handleDeleteCartItem}
            />
          ))}
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "300px" },
            alignSelf: "flex-start",
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ my: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>Subtotal</Typography>
                <Typography>{formatPrice(calculateTotal())}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>
            </Box>

            <LoadingButton
              variant="contained"
              fullWidth
              size="large"
              loading={isUpdating}
              endIcon={<ArrowForward />}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </LoadingButton>

            <LoadingButton
              variant="outlined"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              onClick={() => navigate("/search")}
            >
              Continue Shopping
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserCartPage;
