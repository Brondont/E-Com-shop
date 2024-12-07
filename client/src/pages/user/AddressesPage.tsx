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
  TextField
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import MyBreadcrumbs from "../../components/myBreadcrumbs/MyBreadcrumbs";

type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  stateCode: string;
}

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [newAddress, setNewAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    countryCode: "",
    stateCode: "",
  });

  const [availableCountries, setAvailableCountries] = useState<{ name: string, isoCode: string }[]>([]);
  const [availableStates, setAvailableStates] = useState<{ name: string, isoCode: string }[]>([]);
  const [availableCities, setAvailableCities] = useState<{ name: string }[]>([]);

  useEffect(() => {
    // Populate countries on component mount
    const countries = Country.getAllCountries();
    setAvailableCountries(countries);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddAddress = () => {
    if (newAddress.line1.trim() && newAddress.city.trim() && newAddress.country.trim()) {
      setAddresses([...addresses, newAddress]);
      setNewAddress({
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        countryCode: "",
        stateCode: "",
      });
      setAvailableStates([]);
      setAvailableCities([]);
      handleClose();
    }
  };
  const handleCountryChange = (
    _event: React.SyntheticEvent,
    value: { name: string, isoCode: string } | null
  ) => {
    if (value) {
      // Update country and reset dependent fields
      setNewAddress(prev => ({
        ...prev,
        country: value.name,
        countryCode: value.isoCode,
        state: "",
        stateCode: "",
        city: ""
      }));

      // Populate states for selected country
      const states = State.getStatesOfCountry(value.isoCode);
      setAvailableStates(states);
      setAvailableCities([]);
    } else {
      // Reset all fields if no country selected
      setNewAddress(prev => ({
        ...prev,
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        city: ""
      }));
      setAvailableStates([]);
      setAvailableCities([]);
    }
  };

  const handleStateChange = (
    _event: React.SyntheticEvent,
    value: { name: string, isoCode: string } | null
  ) => {
    if (value) {
      // Update state and populate cities
      setNewAddress(prev => ({
        ...prev,
        state: value.name,
        stateCode: value.isoCode,
        city: ""
      }));

      // Populate cities for selected state
      const cities = City.getCitiesOfState(newAddress.countryCode, value.isoCode);
      setAvailableCities(cities);
    } else {
      // Reset state and city if no state selected
      setNewAddress(prev => ({
        ...prev,
        state: "",
        stateCode: "",
        city: ""
      }));
      setAvailableCities([]);
    }
  };

  const handleCityChange = (
    _event: React.SyntheticEvent,
    value: { name: string } | null
  ) => {
    if (value) {
      setNewAddress(prev => ({
        ...prev,
        city: value.name
      }));
    } else {
      setNewAddress(prev => ({
        ...prev,
        city: ""
      }));
    }
  };

  return (
    <>
      <MyBreadcrumbs />
      <Box sx={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>
              Your Addresses
            </Typography>
            <Box sx={{ mb: 2 }}>
              {addresses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No addresses added yet.
                </Typography>
              ) : (
                <></>
              )}
            </Box>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
              <DialogTitle>Add a New Address</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  variant="outlined"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  variant="outlined"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <Autocomplete
                  fullWidth
                  options={availableCountries}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}
                  onChange={handleCountryChange}
                  sx={{ mb: 2 }}
                />

                {availableStates.length > 0 && (
                  <Autocomplete
                    fullWidth
                    options={availableStates}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State/Province"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                    onChange={handleStateChange}
                    sx={{ mb: 2 }}
                  />
                )}

                {availableCities.length > 0 && (
                  <Autocomplete
                    fullWidth
                    options={availableCities}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                    onChange={handleCityChange}
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Postal Code"
                  variant="outlined"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="secondary">
                  Cancel
                </Button>
                <Button onClick={handleAddAddress} color="primary">
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
