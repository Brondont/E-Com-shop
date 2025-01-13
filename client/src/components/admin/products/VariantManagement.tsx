import { Box, Card, CardContent, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import VariantsTable, { VariantData } from "./VariantsTable";
import BaseProductSearch from "./BaseProductSearch";
import { BaseProductData } from "./BaseProduct";
import { useFeedback } from "../../../FeedbackAlertContext";
import BaseProductPreview from "./BaseProductPreview";

const VariantManagement: React.FC = () => {
  const [baseProducts, setBaseProducts] = useState<BaseProductData[]>([]);
  const [loadingBaseProducts, setLoadingBaseProducts] =
    useState<boolean>(false);
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<
    BaseProductData | undefined
  >(undefined);
  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleUpdateSelectedBaseProduct = (baseProduct: BaseProductData) => {
    setSelectedBaseProduct(baseProduct);
    fetchVariants(baseProduct.ID);
  };

  const fetchVariants = async (baseProductID: number) => {
    if (loadingVariants) return;
    setLoadingVariants(true);
    try {
      const res = await fetch(`${apiUrl}/variants/${baseProductID}`);
      const resData = await res.json();
      if (resData.error) {
        throw resData.error;
      }
      setVariants(resData.variants);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with fetching the variants try again",
          false
        );
      console.log(err);
    } finally {
      setLoadingVariants(false);
    }
  };

  const fetchBaseProducts = useCallback(async () => {
    if (loadingBaseProducts) return;
    setLoadingBaseProducts(true);
    try {
      const res = await fetch(`${apiUrl}/products`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setBaseProducts(resData.products);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong fetching the products, reset the page.",
          false
        );
    } finally {
      setLoadingBaseProducts(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchBaseProducts();
  }, [fetchBaseProducts]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Card
        sx={{
          flex: "1 1 80%",
          maxWidth: "80%",
          width: "100%",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            p: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: "100%",
            }}
          >
            <Box>
              <Typography variant="h4">Variants</Typography>
            </Box>
            <BaseProductSearch
              baseProducts={baseProducts}
              loadingBaseProducts={loadingBaseProducts}
              handleUpdateSelectedBaseProduct={handleUpdateSelectedBaseProduct}
              selectedBaseProduct={selectedBaseProduct}
            />
            <BaseProductPreview product={selectedBaseProduct} />
          </Box>
          <Box>
            {!selectedBaseProduct ? (
              <Typography>Select A Base Product.</Typography>
            ) : variants.length > 0 ? (
              <VariantsTable
                isEdit
                variants={variants}
                baseProduct={selectedBaseProduct}
                loadingVariants={loadingVariants}
                setVariants={setVariants}
              />
            ) : (
              <Typography>
                This Base Product doesn't have any variants
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VariantManagement;
