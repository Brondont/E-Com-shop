import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Button,
  CardContent,
  Card,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  ShoppingCart,
  AddLocationAlt,
  ArrowForward,
  Store,
} from "@mui/icons-material";
import { useFeedback } from "../../FeedbackAlertContext";
import { Address } from "./AddressesPage";
import { formatPrice } from "../../util/formatters";

interface CartItem {
  ID: string;
  quantity: number;
  variantID: string;
  variant: {
    name: string;
    price: number;
  };
}

const UserCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showFeedback } = useFeedback();

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const fetchCartItems = useCallback(async () => {
    if (!token || !apiUrl) return;
    try {
      const res = await fetch(`${apiUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCartItems(resData.cartItems);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else showFeedback("Failed to load cart items. Please try again.", false);
    }
  }, [apiUrl, token, showFeedback]);

  const fetchAddresses = useCallback(async () => {
    if (!token || !apiUrl) return;
    try {
      const res = await fetch(`${apiUrl}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setAddresses(resData.addresses);
      if (resData.addresses.length > 0) {
        setSelectedAddress(resData.addresses[0].ID);
      }
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else showFeedback("Failed to load addresses. Please try again.", false);
    }
  }, [apiUrl, token, showFeedback]);

  useEffect(() => {
    const initializeCheckout = async () => {
      setIsLoading(true);
      await Promise.all([fetchCartItems(), fetchAddresses()]);
      setIsLoading(false);
    };

    initializeCheckout();
  }, [fetchCartItems, fetchAddresses]);

  const calculateTotal = useCallback((): number => {
    return cartItems.reduce(
      (total, item) => total + item.variant.price * item.quantity,
      0
    );
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showFeedback("Please select a delivery address", false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          items: cartItems.map((item) => ({
            variantId: item.variantID,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      showFeedback("Order placed successfully!", true);
      navigate("/orders/confirmation");
    } catch (err) {
      showFeedback("Failed to place order. Please try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button variant="contained" endIcon={<Store />} href="/search">
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Checkout
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Delivery Address
            </Typography>
            {addresses.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 4,
                  gap: 2,
                }}
              >
                <AddLocationAlt
                  sx={{ fontSize: 48, color: "text.secondary" }}
                />
                <Typography color="text.secondary">
                  No saved addresses found
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  href="/account/addresses"
                >
                  Add New Addresses
                </Button>
              </Box>
            ) : (
              <RadioGroup
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                {addresses.map((address) => (
                  <FormControlLabel
                    key={address.ID}
                    value={address.ID}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography>{address.street1}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.city}, {address.country} {address.postalCode}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment Method
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="credit_card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label="PayPal"
              />
              <FormControlLabel
                value="bank_transfer"
                control={<Radio />}
                label="Bank Transfer"
              />
            </RadioGroup>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <List disablePadding>
              {cartItems.map((item) => (
                <ListItem
                  key={item.ID}
                  sx={{
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemText
                    primary={item.variant.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography>
                    {formatPrice(item.variant.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
                pt: 2,
                borderTop: "2px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">
                {formatPrice(calculateTotal())}
              </Typography>
            </Box>
          </Box>

          {addresses.length > 0 && (
            <LoadingButton
              loading={isSubmitting}
              variant="contained"
              size="large"
              fullWidth
              onClick={handlePlaceOrder}
              loadingPosition="end"
              endIcon={<ArrowForward />}
            >
              Place Order
            </LoadingButton>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserCheckoutPage;
