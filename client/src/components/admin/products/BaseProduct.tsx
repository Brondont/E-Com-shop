import {
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import React, { useState, useCallback, useEffect } from "react";
import { useFeedback } from "../../../FeedbackAlertContext";
import VariantCreationDialog, {
  DialogProductVariantProps,
} from "./VariantCreationDialog";
import VariantsTable, { Image, VariantData } from "./VariantsTable";
import BaseProductSearch from "./BaseProductSearch";
import BaseProductCreation, {
  BaseProductCreationData,
  Category,
  Manufacturer,
} from "./BaseProductCreation";

export interface BaseProductData {
  ID: number;
  name: string;
  description: string;
  image: Image;
  category: Category | undefined;
  manufacturer: Manufacturer | undefined;
  variants?: VariantData[];
}

const BaseProduct: React.FC = () => {
  const [baseProducts, setBaseProducts] = useState<BaseProductData[]>([]);
  const [loadingBaseProducts, setLoadingBaseProducts] =
    useState<boolean>(false);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<
    BaseProductData | undefined
  >(undefined);
  useState<boolean>(false);
  const [variantDialogData, setVariantDialogData] =
    useState<DialogProductVariantProps>({
      isOpen: false,
      name: "",
      description: "",
      price: undefined,
      quantity: undefined,
      newImages: [],
      existingImages: [],
      newModel: null,
      existingModel: "",
    });
  const [submittingVariant, setSubmittingVariant] = useState<boolean>(false);

  const [newBaseProduct, setNewBaseProduct] = useState<BaseProductCreationData>(
    {
      name: "",
      description: "",
      image: null,
      categoryID: undefined,
      manufacturerID: undefined,
    }
  );
  const [submittingNewBaseProduct, setSubmittingNewBaseProduct] =
    useState<boolean>(false);

  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleOpenDialog = () => {
    if (!selectedBaseProduct) {
      showFeedback(
        "Select a base product first to create variants for it.",
        false
      );
      return;
    }
    setVariantDialogData((prev) => {
      return {
        ...prev,
        isOpen: true,
      };
    });
  };

  const fetchVariants = useCallback(
    async (baseProductID: number) => {
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
            "Something went wrong fetching the variants, reset the page.",
            false
          );
      } finally {
        setLoadingVariants(false);
      }
    },
    [apiUrl, showFeedback]
  );

  const validateVariantForm = (): string => {
    if (variantDialogData.name === "") return "Name is required";
    if (variantDialogData.description === "") return "Description is required";
    if (variantDialogData.newImages.length === 0)
      return "You must upload at least one image for the variant";
    if (variantDialogData.price === undefined) return "Price is required";
    if (variantDialogData.quantity === undefined) return "Quantity is required";

    return "";
  };

  const handleSubmitVariantForm = async () => {
    const err = validateVariantForm();
    if (err !== "") {
      showFeedback(err, false);
      return;
    }

    if (!selectedBaseProduct) {
      showFeedback("Select a base product first.", false);
    }

    if (submittingVariant) return;
    setSubmittingVariant(true);

    const formData = new FormData();

    formData.append("name", variantDialogData.name);
    formData.append("description", variantDialogData.description);
    formData.append("price", variantDialogData.price.toString());
    formData.append("quantity", variantDialogData.quantity.toString());
    formData.append("productID", selectedBaseProduct.ID.toString());
    variantDialogData.newImages.forEach((image) => {
      formData.append("images", image);
    });
    if (variantDialogData.newModel) {
      formData.append("model", variantDialogData.newModel);
    }

    try {
      const res = await fetch(`${apiUrl}/variant`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      showFeedback("Variant created successfully", true);
      setVariants((prev) => [...prev, resData.variant]);
      setVariantDialogData((prev) => {
        return {
          ...prev,
          isOpen: false,
        };
      });
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with creating your product variant, try again",
          false
        );
    } finally {
      setSubmittingVariant(false);
    }
  };

  const validateNewBaseProductForm = (): string => {
    if (newBaseProduct.name === "") return "Name is required.";
    if (newBaseProduct.description === "") return "Description is required.";
    if (!newBaseProduct.categoryID) return "Category is required";
    if (!newBaseProduct.manufacturerID) return "Manufacturer is required";
    if (!newBaseProduct.image) return "Image is required";
    return "";
  };

  const handleSubmittingNewBaseProduct = async () => {
    const err = validateNewBaseProductForm();
    if (err !== "") {
      showFeedback(err, false);
      return;
    }

    if (submittingNewBaseProduct) return;
    setSubmittingNewBaseProduct(true);

    const formData = new FormData();

    formData.append("name", newBaseProduct.name);
    formData.append("description", newBaseProduct.description);
    formData.append("categoryID", newBaseProduct.categoryID.toString());
    formData.append("manufacturerID", newBaseProduct.manufacturerID.toString());
    formData.append("image", newBaseProduct.image);

    try {
      const res = await fetch(`${apiUrl}/product`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setBaseProducts((prev) => [...prev, resData.product]);
      showFeedback("Base product created successfully!", true);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with creating the base product, try again.",
          false
        );
    } finally {
      setSubmittingNewBaseProduct(false);
    }
  };

  const handleUpdateSelectedBaseProduct = (baseProduct: BaseProductData) => {
    setSelectedBaseProduct(baseProduct);
    fetchVariants(baseProduct.ID);
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
        gap: 4,
      }}
    >
      <Card
        sx={{
          minWidth: "40%",
          maxWidth: "50%",
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
          <Typography variant="h5">Base Product</Typography>
          <BaseProductSearch
            baseProducts={baseProducts}
            loadingBaseProducts={loadingBaseProducts}
            handleUpdateSelectedBaseProduct={handleUpdateSelectedBaseProduct}
            selectedBaseProduct={selectedBaseProduct}
          />
          <Button variant="contained" onClick={handleOpenDialog}>
            Create Product Variant
          </Button>
          <Divider />
          <BaseProductCreation
            newBaseProduct={newBaseProduct}
            setNewBaseProduct={setNewBaseProduct}
            submittingNewBaseProduct={submittingNewBaseProduct}
            handleSubmitNewBaseProduct={handleSubmittingNewBaseProduct}
          />
        </CardContent>
      </Card>
      <VariantsTable
        variants={variants}
        loadingVariants={loadingVariants}
        baseProduct={selectedBaseProduct}
        setVariants={setVariants}
      />
      <VariantCreationDialog
        variantDialogData={variantDialogData}
        setVariantDialogData={setVariantDialogData}
        handleSubmit={handleSubmitVariantForm}
      />
    </Box>
  );
};

export default BaseProduct;
