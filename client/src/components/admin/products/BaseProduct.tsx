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
import VariantsTable, { VariantData } from "./VariantsTable";
import { Image } from "../../types/types";
import { Brand } from "../productGroup/GroupBrand";
import { Category } from "../productGroup/GroupCategory";
import BaseProductSearch from "./BaseProductSearch";
import BaseProductCreation, {
  BaseProductCreationData,
} from "./BaseProductCreation";

export interface BaseProductData {
  ID: number;
  name: string;
  description: string;
  image: Image;
  category: Category | undefined;
  brand: Brand | undefined;
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
  const [isEditingBaseProduct, setIsEditingBaseProduct] =
    useState<boolean>(false);

  const [newBaseProduct, setNewBaseProduct] = useState<BaseProductCreationData>(
    {
      name: "",
      description: "",
      newImage: null,
      oldImage: null,
      categoryID: undefined,
      brandID: undefined,
    }
  );
  const [submittingNewBaseProduct, setSubmittingNewBaseProduct] =
    useState<boolean>(false);

  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleStartEditing = () => {
    if (!selectedBaseProduct) {
      showFeedback("Select a base product first to edit it.", false);
      return;
    }
    setNewBaseProduct({
      name: selectedBaseProduct.name,
      description: selectedBaseProduct.description,
      newImage: null,
      oldImage: selectedBaseProduct.image,
      categoryID: selectedBaseProduct.category?.ID,
      brandID: selectedBaseProduct.brand?.ID,
    });
    setIsEditingBaseProduct(true);
  };

  const handleCancelEditing = () => {
    setIsEditingBaseProduct(false);
    setNewBaseProduct({
      name: "",
      description: "",
      newImage: null,
      oldImage: null,
      categoryID: undefined,
      brandID: undefined,
    });
  };

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
    if (!newBaseProduct.brandID) return "Brand is required";
    if (!newBaseProduct.oldImage && !newBaseProduct.newImage)
      return "Image is required";
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

    if (isEditingBaseProduct) {
      formData.append("productID", selectedBaseProduct.ID.toString());
    }
    formData.append("name", newBaseProduct.name);
    formData.append("description", newBaseProduct.description);
    formData.append("categoryID", newBaseProduct.categoryID.toString());
    formData.append("brandID", newBaseProduct.brandID.toString());
    formData.append("existingImage", newBaseProduct.oldImage.ID.toString());
    formData.append("image", newBaseProduct.newImage);

    try {
      const res = await fetch(`${apiUrl}/product`, {
        method: isEditingBaseProduct ? "PUT" : "POST",
        body: formData,
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      if (isEditingBaseProduct) {
        setBaseProducts((prev) =>
          prev.map((baseProduct) => {
            return baseProduct.ID === resData.product.ID
              ? resData.product
              : baseProduct;
          })
        );
      } else setBaseProducts((prev) => [...prev, resData.product]);

      setNewBaseProduct({
        name: "",
        description: "",
        newImage: null,
        oldImage: null,
        categoryID: undefined,
        brandID: undefined,
      });
      showFeedback(
        isEditingBaseProduct
          ? "Base product updated successfully!"
          : "Base product created successfully",
        true
      );
      setSelectedBaseProduct(null);
      setIsEditingBaseProduct(false);
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
    setIsEditingBaseProduct(false);
    setNewBaseProduct({
      name: "",
      description: "",
      newImage: null,
      oldImage: null,
      categoryID: undefined,
      brandID: undefined,
    });
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
          <Typography variant="h4">Base Product</Typography>
          <BaseProductSearch
            baseProducts={baseProducts}
            loadingBaseProducts={loadingBaseProducts}
            handleUpdateSelectedBaseProduct={handleUpdateSelectedBaseProduct}
            selectedBaseProduct={selectedBaseProduct}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={handleOpenDialog}>
              Create Product Variant
            </Button>
            {selectedBaseProduct && !isEditingBaseProduct && (
              <Button variant="outlined" onClick={handleStartEditing}>
                Edit Base Product
              </Button>
            )}
          </Box>
          <Divider />
          <BaseProductCreation
            newBaseProduct={newBaseProduct}
            setNewBaseProduct={setNewBaseProduct}
            submittingNewBaseProduct={submittingNewBaseProduct}
            handleSubmitNewBaseProduct={handleSubmittingNewBaseProduct}
            isEditingBaseProduct={isEditingBaseProduct}
            handleCancelEditing={handleCancelEditing}
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
