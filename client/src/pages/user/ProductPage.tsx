import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFeedback } from "../../FeedbackAlertContext";
import { BaseProductData } from "../../components/admin/products/BaseProduct";
import { VariantData } from "../../components/admin/products/VariantsTable";
import { formatPrice } from "../../util/formatters";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const ProductPage: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { productID } = useParams<{ productID: string }>();
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true); // Start with loading state
  const [product, setProduct] = useState<BaseProductData | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  const fetchProduct = useCallback(async () => {
    if (!productID) return;
    setLoadingProduct(true);

    try {
      const res = await fetch(`${apiUrl}/product/${productID}`);
      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setProduct(resData.product);
      if (resData.product.variants?.length > 0) {
        setSelectedVariant(resData.product.variants[0]);
      }
    } catch (err) {
      showFeedback(
        "Failed to load product details. Please try again later.",
        false
      );
      setProduct(null); // Ensure product is null if there's an error
    } finally {
      setLoadingProduct(false);
    }
  }, [apiUrl, productID]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === selectedVariant.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedVariant.images.length - 1 : prevIndex - 1
    );
  };

  // Loading State
  if (loadingProduct) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" color="error">
          This product does not exist.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100vh",
        p: 4,
        backgroundColor: "background.default", // Add a subtle background color
      }}
    >
      <Card
        sx={{
          maxWidth: "80vw",
          width: "100%",
        }}
      >
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {product.variants.length === 0 ? (
            <Box>
              <Typography variant="body1" color="text.secondary">
                Currently, there are no variants available. Please check back
                later.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                width: "100%",
              }}
            >
              {selectedVariant ? (
                <>
                  <Box
                    sx={{
                      width: { xs: "100%", md: "40%" },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundColor: "action.hover", // Placeholder background
                    }}
                  >
                    {selectedVariant.images.length > 0 ? (
                      <>
                        {/* Display Current Image */}
                        <Box
                          component="img"
                          src={
                            apiUrl.split("/api/")[0] +
                            selectedVariant.images[currentImageIndex].imagePath
                          }
                          alt={`Variant Image ${currentImageIndex + 1}`}
                          sx={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 2,
                          }}
                        />

                        {/* Navigation Buttons */}
                        {selectedVariant.images.length > 1 && (
                          <>
                            <IconButton
                              onClick={handlePreviousImage}
                              sx={{
                                position: "absolute",
                                left: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "background.paper",
                                color: "text.primary",
                                "&:hover": {
                                  backgroundColor: "action.selected",
                                },
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleNextImage}
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "background.paper",
                                color: "text.primary",
                                "&:hover": {
                                  backgroundColor: "action.selected",
                                },
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                          </>
                        )}
                      </>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No images available
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      width: { xs: "100%", md: "60%" },
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {selectedVariant.name}
                    </Typography>
                    <Divider />

                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                      >
                        {formatPrice(selectedVariant.price)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Availability:
                        </Typography>
                        <Typography
                          variant="body1"
                          color={
                            selectedVariant.inventory.quantity === 0
                              ? "error.main"
                              : "success.main"
                          }
                          fontWeight="bold"
                        >
                          {selectedVariant.inventory.quantity === 0
                            ? "Out of stock"
                            : `In stock (${selectedVariant.inventory.quantity} left)`}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />

                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        About this item
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedVariant.description}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductPage;
