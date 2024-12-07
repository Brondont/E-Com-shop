import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import MyBreadcrumbs from "../../components/myBreadcrumbs/MyBreadcrumbs";

import { useFeedback } from "../../FeedbackAlertContext";
import { isRequired, isPostalCode } from "../../util/validators";

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
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type AddressForm = {
  [key: string]: AddressField;
};

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const { showFeedback } = useFeedback();

  const [addressForm, setAddressForm] = useState<AddressForm>({
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
  });

  const [availableCountries, setAvailableCountries] = useState<{ name: string, isoCode: string }[]>([]);
  const [availableStates, setAvailableStates] = useState<{ name: string, isoCode: string }[]>([]);
  const [availableCities, setAvailableCities] = useState<{ name: string }[]>([]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const countries = Country.getAllCountries();
    setAvailableCountries(countries);
  }, []);

  const shakeFields = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  const inputChangeHandler = (value: string, name: string) => {
    setAddressForm((prevState: AddressForm) => {
      const fieldConfig = prevState[name];
      let isValid = true;

      if (fieldConfig.validators) {
        fieldConfig.validators.forEach((validator) => {
          isValid = isValid && validator(value);
        });
      }

      let errorMessage = "";
      if (!isValid) {
        switch (name) {
          case "street1":
            errorMessage = "Address line 1 is required.";
            break;
          case "country":
            errorMessage = "Country is required.";
            break;
          case "state":
            errorMessage = "State is required.";
            break;
          case "city":
            errorMessage = "City is required.";
            break;
          case "postalCode":
            errorMessage = "Invalid postal code format.";
            break;
          default:
            errorMessage = "Invalid input.";
        }
      }

      return {
        ...prevState,
        [name]: {
          ...prevState[name],
          valid: isValid,
          error: errorMessage,
          value: value,
        },
      };
    });
  };

  const isValidInputs = (): boolean => {
    const updatedForm = { ...addressForm };
    const allValid = Object.keys(updatedForm).every((key) => {
      const field = updatedForm[key];

      if (key === "street2") return true;
      if (key === "postalCode") return true;
      if (availableStates.length === 0 && key === "state") return true;
      if (availableCities.length === 0 && key === "city") return true;

      if (field.value === "") {
        field.error = "This field is required.";
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddAddress = () => {
    if (!isValidInputs()) return;

    if (isSending) return;
    setIsSending(true);

    const newAddress: Address = {
      street1: addressForm.street1.value,
      street2: addressForm.street2.value,
      city: addressForm.city.value,
      state: addressForm.state.value,
      postalCode: addressForm.postalCode.value,
      country: addressForm.country.value,
    };

    let statusCode: number;

    fetch(`${apiUrl}/postAddress`, {
      method: "POST",
      body: JSON.stringify(newAddress),
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        statusCode = res.status;
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          const error = resData.error;

          if (statusCode === 422 || statusCode === 409) {
            const updatedForm = { ...addressForm };

            // update error message for each form field if the error exists for that field
            error.forEach((err: ServerFormError) => {
              if (updatedForm[err.path]) {
                updatedForm[err.path].error = err.msg;
                updatedForm[err.path].valid = false;
              }
            });
            shakeFields();
            setAddressForm(updatedForm);
            setIsSending(false);
            handleClose();
            return;
          }
          throw error;
        }
        setIsSending(false);
        showFeedback(
          "Your address has been updated!",
          true
        );
        setAddresses([...addresses, newAddress]);
        handleClose();
      })
      .catch(() => {
        setIsSending(false);
        showFeedback(
          "Something went wrong. Please try again in a moment.",
          false
        );
      });

  };

  const handleCountryChange = (
    _event: React.SyntheticEvent,
    value: { name: string, isoCode: string } | null
  ) => {
    if (!value) return;

    inputChangeHandler(value.name, "country");
    setAddressForm(prev => ({
      ...prev,
      country: { ...prev.country, value: value.name },
      state: { value: "", valid: true, error: "" },
      city: { value: "", valid: true, error: "" },
    }));

    const states = State.getStatesOfCountry(value.isoCode);
    setAvailableStates(states);
    setAvailableCities([]);
  };

  const handleStateChange = (
    _event: React.SyntheticEvent,
    value: { name: string, isoCode: string } | null
  ) => {
    if (!value) return;

    inputChangeHandler(value.name, "state");
    setAddressForm(prev => ({
      ...prev,
      state: { ...prev.state, value: value.name },
      city: { value: "", valid: true, error: "" },
    }));

    const selectedCountry = Country.getAllCountries().find(
      country => country.name === addressForm.country.value
    );
    const cities = City.getCitiesOfState(selectedCountry.isoCode, value.isoCode);
    setAvailableCities(cities);
  };

  const handleCityChange = (
    _event: React.SyntheticEvent,
    value: { name: string } | null
  ) => {
    if (!value) return;

    inputChangeHandler(value.name, "city");
    setAddressForm(prev => ({
      ...prev,
      city: { ...prev.city, value: value.name },
    }));
  };

  return (
    <>
      <MyBreadcrumbs />
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>
              Your Addresses
            </Typography>
            <Box sx={{ mb: 2 }}>
              {addresses.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No addresses added yet.
                </Typography>
              )}
            </Box>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={{ p: 2 }}>
              <DialogTitle sx={{ color: "primary.main" }}>Add a New Address</DialogTitle>
              <Divider />
              <DialogContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Address Line 1"
                    value={addressForm.street1.value}
                    onChange={(e) => inputChangeHandler(e.target.value, "street1")}
                    error={!addressForm.street1.valid}
                    helperText={addressForm.street1.error}
                    sx={{
                      ...(isShake && !addressForm.street1.valid ? { animation: `${shakeAnimation} 0.35s` } : {}),
                    }}
                  />
                </FormControl>

                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  value={addressForm.street2.value}
                  onChange={(e) => inputChangeHandler(e.target.value, "street2")}
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
                        ...(isShake && !addressForm.country.valid ? { animation: `${shakeAnimation} 0.35s` } : {}),
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
                          ...(isShake && !addressForm.state.valid ? { animation: `${shakeAnimation} 0.35s` } : {}),
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
                          ...(isShake && !addressForm.city.valid ? { animation: `${shakeAnimation} 0.35s` } : {}),
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
                  onChange={(e) => inputChangeHandler(e.target.value, "postalCode")}
                  error={!addressForm.postalCode.valid}
                  helperText={addressForm.postalCode.error}
                  sx={{
                    mb: 2,
                    ...(isShake && !addressForm.postalCode.valid ? { animation: `${shakeAnimation} 0.35s` } : {}),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleAddAddress} variant="contained">
                  Add Address
                </Button>
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
