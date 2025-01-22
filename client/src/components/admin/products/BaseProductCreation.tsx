import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  useTheme,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFeedback } from "../../../FeedbackAlertContext"; // Adjust the path as needed
import { Image } from "../../types/types";
import { Brand } from "../productGroup/GroupBrand";
import { Category } from "../productGroup/GroupCategory";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill's CSS

export interface BaseProductCreationData {
  name: string;
  description: string;
  newImage: File | null;
  oldImage: Image;
  categoryID: number;
  brandID: number;
}

interface SelectAddDialogProps {
  isOpen: boolean;
  type: string;
  name: string;
  description: string;
  image: File | null;
}

interface BaseProductCreationProps {
  newBaseProduct: BaseProductCreationData;
  submittingNewBaseProduct: boolean;
  handleSubmitNewBaseProduct: () => {};
  setNewBaseProduct: React.Dispatch<
    React.SetStateAction<BaseProductCreationData>
  >;
  handleCancelEditing: () => void;
  isEditingBaseProduct: boolean;
}

const BaseProductCreation: React.FC<BaseProductCreationProps> = ({
  newBaseProduct,
  submittingNewBaseProduct,
  setNewBaseProduct,
  handleSubmitNewBaseProduct,
  isEditingBaseProduct,
  handleCancelEditing,
}) => {
  const theme = useTheme();
  const { showFeedback } = useFeedback();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
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
          newImage: file,
        };
      });
    }
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
        setBrands((prev) => [...prev, resData.brand]);
      }
      showFeedback(`${selectAddDialogData.type} created successfully!`, true);
      setSelectAddDialogData({
        isOpen: false,
        name: "",
        description: "",
        type: "",
        image: null,
      });
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

  const fetchBrands = useCallback(async () => {
    if (loadingBrands) return;
    setLoadingBrands(true);

    try {
      const res = await fetch(`${apiUrl}/brands`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setBrands(resData.brands);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong fetching the brands, reset the page.",
          false
        );
    } finally {
      setLoadingBrands(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [apiUrl, fetchCategories, fetchBrands]);

  const clearNewBaseProduct = () => {
    setNewBaseProduct({
      name: "",
      description: "",
      categoryID: undefined,
      brandID: undefined,
      oldImage: null,
      newImage: null,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Box>
        <Typography variant="h6">
          {isEditingBaseProduct ? "Update" : "Create"} A Base Product:
        </Typography>
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
        <FormControl sx={{ maxHeight: "700px" }}>
          <ReactQuill
            theme="snow"
            style={{ overflow: "auto" }}
            value={newBaseProduct.description}
            onChange={(value) =>
              setNewBaseProduct((prev) => ({
                ...prev,
                description: value,
              }))
            }
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "list",
              "bullet",
              "link",
              "image",
            ]}
            placeholder="Enter the product description..."
          />
        </FormControl>
        <FormControl>
          <InputLabel>Brand</InputLabel>
          <Select
            name="brandID"
            label="Brand"
            onChange={handleNewBaseProductInput}
            value={newBaseProduct.brandID?.toString() || ""}
          >
            {loadingBrands ? (
              <MenuItem>
                <CircularProgress />
              </MenuItem>
            ) : (
              brands.length > 0 &&
              brands.map((brand) => {
                return (
                  <MenuItem key={brand.ID} value={brand.ID}>
                    {brand.name}
                  </MenuItem>
                );
              })
            )}
            <Button
              onClick={() => {
                handleOpenAddSelectDialog("Brand");
              }}
              fullWidth
              startIcon={<AddIcon />}
            >
              Add New Brand
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
        {newBaseProduct.oldImage && (
          <Box>
            <Typography variant="h6">Old Image Preview:</Typography>
            <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
              <img
                src={
                  apiUrl.split("/api/")[0] + newBaseProduct.oldImage.imagePath
                }
                alt="Preview"
                loading="lazy"
                style={{
                  height: 150,
                  objectFit: "cover",
                }}
              />
            </Box>
          </Box>
        )}
        {newBaseProduct.newImage && (
          <Box>
            <Typography variant="h6">New Image Preview:</Typography>
            <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
              <img
                src={URL.createObjectURL(newBaseProduct.newImage)}
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
                    return { ...prev, newImage: null };
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
          onClick={
            isEditingBaseProduct ? handleCancelEditing : clearNewBaseProduct
          }
          variant="outlined"
          color="error"
        >
          {isEditingBaseProduct ? "Cancel" : "Clear"}
        </Button>
        <LoadingButton
          loading={submittingNewBaseProduct}
          onClick={handleSubmitNewBaseProduct}
          variant="contained"
        >
          Submit
        </LoadingButton>
      </Box>
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
    </Box>
  );
};

export default BaseProductCreation;
