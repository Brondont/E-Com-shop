import {
  Box,
  Card,
  CircularProgress,
  CardContent,
  MenuItem,
  Select,
  useTheme,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  SelectChangeEvent,
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
} from "@mui/material";
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEventHandler,
} from "react";
import { useFeedback } from "../../../FeedbackAlertContext";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import VariantCreationDialog, {
  DialogProductVariantProps,
} from "./VariantCreationDialog";
import { LoadingButton } from "@mui/lab";

interface Manufacturer {
  ID: number;
  name: string;
  image?: string;
}

interface Category {
  ID: number;
  name: string;
}

interface BaseProductData {
  ID: number;
  name: string;
  description: string;
  imagePath: string;
  category: Category | undefined;
  manufacturer: Manufacturer | undefined;
}

interface VariantData {
  ID: number;
  name: string;
  description: string;
  imagePaths: string[];
  price: number;
  Inventory: number; // need to define this more in a bit
  UpdatedAt: string;
  CreatedAt: string;
  productID: number;
}

interface BaseProductCreationData {
  name: string;
  description: string;
  image: File | null;
  categoryID: number;
  manufacturerID: number;
}

interface SelectAddDialogProps {
  isOpen: boolean;
  type: string;
  name: string;
  description: string;
  image: File | null;
}

const BaseProductCreation: React.FC = () => {
  const theme = useTheme();
  const [baseProducts, setBaseProducts] = useState<BaseProductData[]>([]);
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<
    BaseProductData | undefined
  >(undefined);
  const [loadingBaseProducts, setLoadingBaseProducts] =
    useState<boolean>(false);
  const [variantDialogData, setVariantDialogData] =
    useState<DialogProductVariantProps>({
      isOpen: false,
      name: "",
      description: "",
      price: undefined,
      quantity: undefined,
      categoryID: undefined,
      manufacturerID: undefined,
      images: [],
      model: null,
    });
  const [submittingVariant, setSubmittingVariant] = useState<boolean>(false);
  const [submittingDialog, setSubmittingDialog] = useState<boolean>(false);
  const [selectAddDialogData, setSelectAddDialogData] =
    useState<SelectAddDialogProps>({
      isOpen: false,
      name: "",
      type: "",
      description: "",
      image: null,
    });
  const [submittingSelectAddDialog, setSubmittingSelectAddDialog] =
    useState<boolean>(false);
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingManufacturers, setLoadingManufacturers] =
    useState<boolean>(false);
  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleNewBaseProductInput = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setNewBaseProduct((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleNewBaseProductImageUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBaseProduct((prev) => {
        return {
          ...prev,
          image: file,
        };
      });
    }
  };

  const handleAddSelectInput = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAddSelectImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectAddDialogData((prev) => {
        return {
          ...prev,
          image: file,
        };
      });
    }
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

  const handleOpenAddSelectDialog = (type: string) => {
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        isOpen: true,
        type,
      };
    });
  };

  const handleCloseAddSelectDialog = () => {
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        isOpen: false,
      };
    });
  };

  const validateSubmitAddSelectDialogForm = (): string => {
    if (selectAddDialogData.name === "") {
      return "Name is required";
    }
    if (selectAddDialogData.description === "") {
      return "Description is required";
    }
    if (!selectAddDialogData.image) {
      return "Logo is required";
    }
    return "";
  };

  const handleSubmitAddSelectDialog = async () => {
    const err = validateSubmitAddSelectDialogForm();
    if (err !== "") {
      showFeedback(err, false);
      return;
    }
    if (submittingSelectAddDialog) return;
    setSubmittingSelectAddDialog(true);

    const formData = new FormData();

    formData.append("name", selectAddDialogData.name);
    formData.append("description", selectAddDialogData.description);
    if (selectAddDialogData.image) {
      formData.append("image", selectAddDialogData.image);
    }

    try {
      const res = await fetch(
        `${apiUrl}/${selectAddDialogData.type.toLocaleLowerCase()}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      if (selectAddDialogData.type === "Category") {
        setCategories((prev) => [...prev, resData.category]);
      } else {
        setManufacturers((prev) => [...prev, resData.manufacturer]);
      }
      showFeedback(`${selectAddDialogData.type} created successfully!`, true);
      handleCloseAddSelectDialog();
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          `Something went wrong with adding ${selectAddDialogData.type}`,
          false
        );
    } finally {
      setSubmittingSelectAddDialog(false);
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

  const fetchCategories = useCallback(async () => {
    if (loadingCategories) return;
    setLoadingCategories(true);
    try {
      const res = await fetch(`${apiUrl}/categories`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCategories(resData.categories);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong fetching the categories, reset the page.",
          false
        );
    } finally {
      setLoadingCategories(false);
    }
  }, [apiUrl]);

  const fetchManufacturers = useCallback(async () => {
    if (loadingManufacturers) return;
    setLoadingManufacturers(true);

    try {
      const res = await fetch(`${apiUrl}/manufacturers`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setManufacturers(resData.manufacturers);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong fetching the manufacturers, reset the page.",
          false
        );
    } finally {
      setLoadingManufacturers(false);
    }
  }, [apiUrl]);

  const fetchVariants = async (selectedProductID: number) => {
    if (loadingVariants) return;
    setLoadingVariants(true);

    try {
      const res = await fetch(`${apiUrl}/variants/${selectedProductID}`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setVariants(resData.variants);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong fetching the manufacturers, reset the page.",
          false
        );
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    fetchBaseProducts();
    fetchCategories();
    fetchManufacturers();
  }, [apiUrl, fetchCategories, fetchBaseProducts, fetchManufacturers]);

  const validateVariantForm = (): string => {
    if (variantDialogData.name === "") return "Name is required";
    if (variantDialogData.description === "") return "Description is required";
    if (variantDialogData.images.length === 0)
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
    variantDialogData.images.forEach((image) => {
      formData.append("images", image);
    });

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

      console.log(resData);
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

  const submitNewBaseProduct = async () => {
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
      const res = await fetch(`${apiUrl}/baseProduct`, {
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

  const clearNewBaseProduct = () => {
    setNewBaseProduct({
      name: "",
      description: "",
      categoryID: undefined,
      manufacturerID: undefined,
      image: null,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        flexWrap: "wrap",
      }}
    >
      <Card
        sx={{
          minWidth: "40%",
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
          <Box>
            <FormControl fullWidth>
              <InputLabel>Base Product</InputLabel>
              <Select
                name="baseProduct"
                label="Base Product"
                value={selectedBaseProduct?.ID || ""}
                onChange={(e) => {
                  const prodID = +e.target.value;
                  const baseProduct = baseProducts.find(
                    (baseProduct) => baseProduct.ID === prodID
                  );
                  setSelectedBaseProduct(baseProduct);
                  fetchVariants(prodID);
                }}
              >
                {loadingBaseProducts ? (
                  <MenuItem>
                    <CircularProgress />
                  </MenuItem>
                ) : baseProducts.length > 0 ? (
                  baseProducts.map((baseProduct) => {
                    return (
                      <MenuItem key={baseProduct.ID} value={baseProduct.ID}>
                        {baseProduct.name}
                      </MenuItem>
                    );
                  })
                ) : (
                  <Typography sx={{ width: "100%", textAlign: "center", p: 2 }}>
                    No products available.
                  </Typography>
                )}
              </Select>
            </FormControl>
          </Box>
          <Button variant="contained" onClick={handleOpenDialog}>
            Create Product Variant
          </Button>
          <Divider />
          <Box>
            <Typography variant="h6">Create A Base Product:</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormControl>
              <TextField
                sx={{ mt: 2 }}
                autoFocus
                name="name"
                label={"Name"}
                onChange={handleNewBaseProductInput}
                fullWidth
                value={newBaseProduct.name}
              />
            </FormControl>
            <FormControl>
              <TextField
                autoFocus
                label="Description"
                name="description"
                onChange={handleNewBaseProductInput}
                fullWidth
                multiline
                rows={4}
                value={newBaseProduct.description}
              />
            </FormControl>
            <FormControl>
              <InputLabel>Manufacturer</InputLabel>
              <Select
                name="manufacturerID"
                label="Manufacturer"
                onChange={handleNewBaseProductInput}
                value={newBaseProduct.manufacturerID?.toString() || ""}
              >
                {loadingManufacturers ? (
                  <MenuItem>
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  manufacturers.length > 0 &&
                  manufacturers.map((manufacturer) => {
                    return (
                      <MenuItem key={manufacturer.ID} value={manufacturer.ID}>
                        {manufacturer.name}
                      </MenuItem>
                    );
                  })
                )}
                <Button
                  onClick={() => {
                    handleOpenAddSelectDialog("Manufacturer");
                  }}
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add New Manufacturer
                </Button>
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryID"
                label="Category"
                onChange={handleNewBaseProductInput}
                value={newBaseProduct.categoryID?.toString() || ""}
              >
                {loadingCategories ? (
                  <MenuItem>
                    <CircularProgress />
                  </MenuItem>
                ) : (
                  categories.length > 0 &&
                  categories.map((category) => {
                    return (
                      <MenuItem key={category.ID} value={category.ID}>
                        {category.name}
                      </MenuItem>
                    );
                  })
                )}
                <Button
                  onClick={() => {
                    handleOpenAddSelectDialog("Category");
                  }}
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add New Category
                </Button>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Button
              component="label"
              variant="contained"
              sx={{ mt: 2 }}
              startIcon={<FileUploadIcon />}
            >
              Upload Base Product Image
              <input
                type="file"
                onChange={handleNewBaseProductImageUpload}
                hidden
                accept="image/*"
              />
            </Button>
            {newBaseProduct.image && (
              <Box>
                <Typography variant="h6">Image Preview:</Typography>
                <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
                  <img
                    src={URL.createObjectURL(newBaseProduct.image)}
                    alt="Preview"
                    loading="lazy"
                    style={{
                      height: 150,
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      setNewBaseProduct((prev) => {
                        return { ...prev, image: null };
                      })
                    }
                    sx={{
                      position: "absolute",
                      right: 4,
                      top: 4,
                      bgcolor: theme.palette.background.paper,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                    size="small"
                  >
                    <DeleteIcon
                      sx={{
                        color: theme.palette.error.main,
                        fontSize: 20,
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              width: "100%",
              gap: 2,
            }}
          >
            <Button
              onClick={clearNewBaseProduct}
              variant="outlined"
              color="error"
            >
              Clear
            </Button>
            <LoadingButton
              loading={submittingNewBaseProduct}
              onClick={submitNewBaseProduct}
              variant="contained"
            >
              Submit
            </LoadingButton>
          </Box>
        </CardContent>
      </Card>
      <Card
        sx={{
          minWidth: "40%",
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
          <Typography variant="h5">Base Product's Variants</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!selectedBaseProduct ? (
              <Typography variant="h5" color="textDisabled">
                Select a base product first to see its variants.
              </Typography>
            ) : loadingVariants ? (
              <CircularProgress />
            ) : variants.length > 0 ? (
              <TableContainer>
                <Table
                  sx={{ minWidth: 650 }}
                  aria-label="product information table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Field
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {variants.map((variant) => {
                      return (
                        <>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              ID
                            </TableCell>
                            <TableCell>{variant.ID}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Name
                            </TableCell>
                            <TableCell>{variant.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Description
                            </TableCell>
                            <TableCell>{variant.description}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Price
                            </TableCell>
                            <TableCell>{formatPrice(variant.price)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Created At
                            </TableCell>
                            <TableCell>
                              {formatDate(variant.CreatedAt)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Updated At
                            </TableCell>
                            <TableCell>
                              {formatDate(variant.UpdatedAt)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Product ID
                            </TableCell>
                            <TableCell>{variant.productID}</TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="h5" color="textDisabled">
                This product doesn't have any variants yet.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      <Dialog
        open={selectAddDialogData.isOpen}
        onClose={handleCloseAddSelectDialog}
      >
        <DialogTitle>Add New {selectAddDialogData.type}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormControl>
              <TextField
                sx={{ mt: 2 }}
                autoFocus
                name="name"
                label="Name"
                fullWidth
                onChange={handleAddSelectInput}
                value={selectAddDialogData.name}
              />
            </FormControl>
            <FormControl>
              <TextField
                autoFocus
                label="Description"
                name="description"
                fullWidth
                multiline
                onChange={handleAddSelectInput}
                rows={4}
                value={selectAddDialogData.description}
              />
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Button
              component="label"
              variant="contained"
              sx={{ mt: 2 }}
              startIcon={<FileUploadIcon />}
            >
              Upload {selectAddDialogData.type} Logo
              <input
                type="file"
                hidden
                onChange={handleAddSelectImageUpload}
                accept="image/*"
              />
            </Button>
            {selectAddDialogData.image && (
              <Box>
                <Typography variant="h6">Logo Preview:</Typography>
                <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
                  <img
                    src={URL.createObjectURL(selectAddDialogData.image)}
                    alt="Preview"
                    loading="lazy"
                    style={{
                      height: 150,
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      setSelectAddDialogData((prev) => {
                        return { ...prev, image: null };
                      })
                    }
                    sx={{
                      position: "absolute",
                      right: 4,
                      top: 4,
                      bgcolor: theme.palette.background.paper,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                    size="small"
                  >
                    <DeleteIcon
                      sx={{
                        color: theme.palette.error.main,
                        fontSize: 20,
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
          <Divider />
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              gap: 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleCloseAddSelectDialog}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={submittingSelectAddDialog}
              variant="contained"
              onClick={handleSubmitAddSelectDialog}
            >
              Submit
            </LoadingButton>
          </Box>
        </DialogActions>
      </Dialog>
      <VariantCreationDialog
        variantDialogData={variantDialogData}
        setVariantDialogData={setVariantDialogData}
        handleSubmit={handleSubmitVariantForm}
      />
    </Box>
  );
};

export default BaseProductCreation;
