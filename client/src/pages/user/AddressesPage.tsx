import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Divider,
  FormControl,
  keyframes,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingButton } from "@mui/lab";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import MyBreadcrumbs from "../../components/myBreadcrumbs/MyBreadcrumbs";
import { useFeedback } from "../../FeedbackAlertContext";
import { isRequired, isPostalCode } from "../../util/validators";

// Constants and Types
const INITIAL_FORM_STATE: AddressForm = {
  street1: {
    value: "",
    valid: true,
    validators: [isRequired],
    error: "",
  },
  street2: {
    value: "",
    valid: true,
    error: "",
  },
  country: {
    value: "",
    valid: true,
    validators: [isRequired],
    error: "",
  },
  state: {
    value: "",
    valid: true,
    validators: [isRequired],
    error: "",
  },
  city: {
    value: "",
    valid: true,
    validators: [isRequired],
    error: "",
  },
  postalCode: {
    value: "",
    valid: true,
    validators: [isPostalCode],
    error: "",
  },
};

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

type ValidatorFunction = (value: string) => boolean;
type ServerFormError = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

type AddressField = {
  value: string;
  valid: boolean;
  validators?: ValidatorFunction[];
  error: string;
};

type Address = {
  ID: number;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AddressForm = {
  [key: string]: AddressField;
};

const AddressesPage: React.FC = () => {
  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] =
    useState<AddressForm>(INITIAL_FORM_STATE);
  const [availableCountries, setAvailableCountries] = useState<
    Array<{ name: string; isoCode: string }>
  >([]);
  const [availableStates, setAvailableStates] = useState<
    Array<{ name: string; isoCode: string }>
  >([]);
  const [availableCities, setAvailableCities] = useState<
    Array<{ name: string }>
  >([]);

  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  // Utility functions
  const resetForm = () => {
    setAddressForm(INITIAL_FORM_STATE);
    setIsEditMode(false);
    setEditingAddressId(null);
    setAvailableStates([]);
    setAvailableCities([]);
  };

  const getErrorMessage = (fieldName: string): string => {
    const errorMessages: { [key: string]: string } = {
      street1: "Address line 1 is required.",
      country: "Country is required.",
      state: "State is required.",
      city: "City is required.",
      postalCode: "Invalid postal code format.",
    };
    return errorMessages[fieldName] || "Invalid input.";
  };

  const shakeFields = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  // Effects
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isLoadingAddresses) return;
      setIsLoadingAddresses(true);

      try {
        const response = await fetch(`${apiUrl}/getAddresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resData = await response.json();

        if (resData.error) throw resData.error;
        setAddresses(resData.addresses);
      } catch (error) {
        showFeedback(
          "Something went wrong with fetching your addresses, reload your page.",
          false
        );
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    const countries = Country.getAllCountries();
    setAvailableCountries(countries);
    fetchAddresses();
  }, [apiUrl, token, showFeedback]);

  // Handlers
  const handleInputChange = (value: string, name: string) => {
    setAddressForm((prevState: AddressForm) => {
      const fieldConfig = prevState[name];
      const isValid = fieldConfig.validators
        ? fieldConfig.validators.every((validator) => validator(value))
        : true;

      return {
        ...prevState,
        [name]: {
          ...prevState[name],
          valid: isValid,
          error: isValid ? "" : getErrorMessage(name),
          value: value,
        },
      };
    });
  };

  const handleCountryChange = (
    _: React.SyntheticEvent,
    value: { name: string; isoCode: string } | null
  ) => {
    if (!value) return;
    handleInputChange(value.name, "country");
    setAddressForm((prev) => ({
      ...prev,
      country: { ...prev.country, value: value.name },
      state: { ...INITIAL_FORM_STATE.state },
      city: { ...INITIAL_FORM_STATE.city },
    }));
    const states = State.getStatesOfCountry(value.isoCode);
    setAvailableStates(states);
    setAvailableCities([]);
  };

  const handleStateChange = (
    _: React.SyntheticEvent,
    value: { name: string; isoCode: string } | null
  ) => {
    if (!value) return;
    handleInputChange(value.name, "state");
    setAddressForm((prev) => ({
      ...prev,
      state: { ...prev.state, value: value.name },
      city: { ...INITIAL_FORM_STATE.city },
    }));

    const selectedCountry = availableCountries.find(
      (country) => country.name === addressForm.country.value
    );

    if (selectedCountry) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        value.isoCode
      );
      setAvailableCities(cities);
    }
  };

  const handleCityChange = (
    _: React.SyntheticEvent,
    value: { name: string } | null
  ) => {
    if (!value) return;
    handleInputChange(value.name, "city");
    setAddressForm((prev) => ({
      ...prev,
      city: { ...prev.city, value: value.name },
    }));
  };

  const isValidInputs = (): boolean => {
    const updatedForm = { ...addressForm };
    const allValid = Object.keys(updatedForm).every((key) => {
      const field = updatedForm[key];
      if (key === "street2" || key === "postalCode") return true;
      if (availableStates.length === 0 && key === "state") return true;
      if (availableCities.length === 0 && key === "city") return true;

      if (field.value === "") {
        field.error = getErrorMessage(key);
        field.valid = false;
      }
      return field.valid;
    });

    if (!allValid) {
      shakeFields();
      setAddressForm(updatedForm);
    }
    return allValid;
  };

  const handleAddressSubmit = async () => {
    if (!isValidInputs() || isSending) return;
    setIsSending(true);

    const newAddress: Address = {
      ID: editingAddressId,
      street1: addressForm.street1.value,
      street2: addressForm.street2.value,
      city: addressForm.city.value,
      state: addressForm.state.value,
      postalCode: addressForm.postalCode.value,
      country: addressForm.country.value,
    };

    const requestMethod = isEditMode ? "PUT" : "POST";
    const requestUrl = `${apiUrl}/${isEditMode ? "putAddress" : "postAddress"}`;

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        body: JSON.stringify(newAddress),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const resData = await response.json();

      if (resData.error) {
        if (response.status === 422 || response.status === 409) {
          handleValidationErrors(resData.error);
          return;
        }
        throw resData.error;
      }

      showFeedback("Your address has been updated!", true);
      setAddresses((prevAddresses) =>
        isEditMode
          ? prevAddresses.map((addr) =>
              addr.ID === editingAddressId ? newAddress : addr
            )
          : [...prevAddresses, newAddress]
      );
      handleClose();
    } catch (error) {
      showFeedback(
        "Something went wrong. Please try again in a moment.",
        false
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleValidationErrors = (errors: ServerFormError[]) => {
    const updatedForm = { ...addressForm };
    errors.forEach((err: ServerFormError) => {
      if (updatedForm[err.path]) {
        updatedForm[err.path].error = err.msg;
        updatedForm[err.path].valid = false;
      }
    });
    shakeFields();
    setAddressForm(updatedForm);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const openEdit = (address: Address) => {
    const selectedCountry = availableCountries.find(
      (country) => country.name === address.country
    );
    if (!selectedCountry) return;

    const states = State.getStatesOfCountry(selectedCountry.isoCode);
    setAvailableStates(states);

    const selectedState = states.find((state) => state.name === address.state);
    if (selectedState) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setAvailableCities(cities);
    }

    setAddressForm({
      street1: { ...INITIAL_FORM_STATE.street1, value: address.street1 },
      street2: { ...INITIAL_FORM_STATE.street2, value: address.street2 || "" },
      country: { ...INITIAL_FORM_STATE.country, value: address.country },
      state: { ...INITIAL_FORM_STATE.state, value: address.state },
      city: { ...INITIAL_FORM_STATE.city, value: address.city },
      postalCode: {
        ...INITIAL_FORM_STATE.postalCode,
        value: address.postalCode,
      },
    });

    setIsEditMode(true);
    setEditingAddressId(address.ID);
    handleOpen();
  };

  return (
    <>
      <MyBreadcrumbs />
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card sx={{ maxHeight: "70vh", overflowY: "scroll" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>
              Your Addresses
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
              {isLoadingAddresses ? (
                <>
                  <CircularProgress />
                </>
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No addresses added yet.
                    </Typography>
                  ) : (
                    <>
                      <List>
                        {addresses.map((address, index) => (
                          <ListItem
                            key={index}
                            divider
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => {
                                  openEdit(address);
                                  handleOpen();
                                }}
                              >
                                <EditNoteIcon color="primary" />
                              </IconButton>
                            }
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography variant="h6">
                              {address.country}
                            </Typography>
                            <Typography>
                              {address.street1}
                              {address.street2 && ` ${address.street2}`}
                            </Typography>
                            <Typography>
                              {address.state && `${address.state}`}
                              {address.city && ` ${address.city}`}
                            </Typography>
                            <Typography>
                              {address.postalCode && `${address.postalCode}`}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </>
              )}
            </Box>
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="md"
              fullWidth
              sx={{ p: 2 }}
            >
              <DialogTitle sx={{ color: "primary.main" }}>
                Add a New Address
              </DialogTitle>
              <Divider />
              <DialogContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Address Line 1"
                    value={addressForm.street1.value}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "street1")
                    }
                    error={!addressForm.street1.valid}
                    helperText={addressForm.street1.error}
                    sx={{
                      ...(isShake && !addressForm.street1.valid
                        ? { animation: `${shakeAnimation} 0.35s` }
                        : {}),
                    }}
                  />
                </FormControl>

                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  value={addressForm.street2.value}
                  onChange={(e) => handleInputChange(e.target.value, "street2")}
                  sx={{ mb: 2 }}
                />

                <Autocomplete
                  fullWidth
                  options={availableCountries}
                  value={{ name: addressForm.country.value, isoCode: "" }}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      error={!addressForm.country.valid}
                      helperText={addressForm.country.error}
                      sx={{
                        ...(isShake && !addressForm.country.valid
                          ? { animation: `${shakeAnimation} 0.35s` }
                          : {}),
                      }}
                    />
                  )}
                  onChange={handleCountryChange}
                  sx={{ mb: 2 }}
                />

                {availableStates.length > 0 && (
                  <Autocomplete
                    fullWidth
                    value={{ name: addressForm.state.value, isoCode: "" }}
                    options={availableStates}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State/Province"
                        error={!addressForm.state.valid}
                        helperText={addressForm.state.error}
                        sx={{
                          ...(isShake && !addressForm.state.valid
                            ? { animation: `${shakeAnimation} 0.35s` }
                            : {}),
                        }}
                      />
                    )}
                    onChange={handleStateChange}
                    sx={{ mb: 2 }}
                  />
                )}

                {availableCities.length > 0 && (
                  <Autocomplete
                    fullWidth
                    value={{ name: addressForm.city.value }}
                    options={availableCities}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City"
                        error={!addressForm.city.valid}
                        helperText={addressForm.city.error}
                        sx={{
                          ...(isShake && !addressForm.city.valid
                            ? { animation: `${shakeAnimation} 0.35s` }
                            : {}),
                        }}
                      />
                    )}
                    onChange={handleCityChange}
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Postal Code"
                  value={addressForm.postalCode.value}
                  onChange={(e) =>
                    handleInputChange(e.target.value, "postalCode")
                  }
                  error={!addressForm.postalCode.valid}
                  helperText={addressForm.postalCode.error}
                  sx={{
                    mb: 2,
                    ...(isShake && !addressForm.postalCode.valid
                      ? { animation: `${shakeAnimation} 0.35s` }
                      : {}),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                  Cancel
                </Button>
                <LoadingButton
                  loading={isSending}
                  onClick={handleAddressSubmit}
                  variant="contained"
                >
                  {isEditMode ? "Update Address" : "Add Address"}
                </LoadingButton>
              </DialogActions>
            </Dialog>
            <Box sx={{ display: "flex", gap: "10px" }}>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add New Address
              </Button>
              <Button component={Link} to="/account" variant="outlined">
                Back to Profile
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default AddressesPage;
