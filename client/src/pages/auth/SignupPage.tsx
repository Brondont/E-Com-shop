import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  OutlinedInput,
  FormHelperText,
  Typography,
  InputAdornment,
  keyframes,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFeedback } from "../../FeedbackAlertContext";

import {
  isEmail,
  isRequired,
  isLength,
  ValidatorFunction,
} from "../../util/validators";

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

type ServerFormError = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

type SignupForm = {
  [key: string]: {
    value: string;
    valid: boolean;
    validators?: ValidatorFunction[];
    error: string;
  };
};

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [signupForm, setSignupForm] = useState<SignupForm>({
    email: {
      value: "",
      valid: true,
      error: "",
      validators: [isRequired, isEmail],
    },
    username: {
      value: "",
      valid: true,
      error: "",
      validators: [isRequired, isLength({ min: 5, max: 30 })],
    },
    phone: {
      value: "",
      valid: true,
      error: "",
      validators: [isRequired],
    },
    password: {
      value: "",
      valid: true,
      error: "",
      validators: [isRequired, isLength({ min: 8 })],
    },
    confirmPassword: {
      value: "",
      valid: true,
      error: "",
    },
  });
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handlePhoneChange = (value: string) => {
    const isValid = matchIsValidTel(value);
    setSignupForm((prev) => ({
      ...prev,
      phone: {
        ...prev.phone,
        value,
        valid: isValid,
        error: isValid ? "" : "Please enter a valid phone number",
      },
    }));
  };

  const inputChangeHandler = (value: string, name: string) => {
    setSignupForm((prevState: SignupForm) => {
      const fieldConfig = prevState[name];
      let isValid = true;

      if (name !== "confirmPassword") {
        fieldConfig.validators!.map((validator) => {
          isValid = isValid && validator(value);
          return validator;
        });
        if (name === "password" && prevState.confirmPassword.value) {
          prevState.confirmPassword.valid =
            value === prevState.confirmPassword.value;
          prevState.confirmPassword.error =
            value !== prevState.confirmPassword.value
              ? "Password does not match the one used above."
              : "";
        }
      } else {
        isValid = value === prevState.password.value;
      }

      let errorMessage = "";
      if (!isValid)
        switch (name) {
          case "email":
            errorMessage = "E-mail invalid.";
            break;
          case "password":
            errorMessage = "Password must be 8 characters minimum.";
            break;
          case "confirmPassword":
            errorMessage = "Password does not match the one used above.";
            break;
          case "username":
            errorMessage = "User name must be between 5 to 30 characters.";
            break;
          default:
            errorMessage = "invalid.";
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

  const shakeFields = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  const isValidInputs = (): boolean => {
    // checks if all the valid fields and returns the AND of all of them basically
    const allValid = Object.values(signupForm).every((field) => {
      if (field.value === "") {
        field.error = "You must fill in this field.";
        field.valid = false;
      }
      return field.valid;
    });

    if (!allValid) {
      shakeFields();
    }
    return allValid;
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmitSignup = (event: React.FormEvent) => {
    event.preventDefault();

    if (isSending) return;
    setIsSending(true);

    if (!isValidInputs()) {
      setIsSending(false);
      return;
    }

    const formData = {
      email: signupForm.email.value,
      username: signupForm.username.value,
      password: signupForm.password.value,
      phoneNumber: signupForm.phone.value.replaceAll(" ", ""),
      confirmPassword: signupForm.confirmPassword.value,
    };

    let statusCode: Number;

    fetch(`${apiUrl}/postSignup`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
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
            const updatedForm = { ...signupForm };

            // update error message for each form field if the error exists for that field
            error.forEach((err: ServerFormError) => {
              if (updatedForm[err.path]) {
                updatedForm[err.path].error = err.msg;
                updatedForm[err.path].valid = false;
              }
            });
            shakeFields();
            setSignupForm(updatedForm);
            setIsSending(false);
            return;
          }
          throw error;
        }

        setIsSending(false);
        showFeedback(
          "Your account has been created! Redirecting to the login page...",
          true
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch(() => {
        setIsSending(false);
        showFeedback(
          "Something went wrong. Please try again in a moment.",
          false
        );
      });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Create your account
        </Typography>
        <form onSubmit={handleSubmitSignup}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 350,
              gap: "30px",
            }}
          >
            <Typography>Create an account and get started shopping!</Typography>

            <FormControl fullWidth>
              <TextField
                label="E-mail"
                value={signupForm.email.value}
                onChange={(event) => {
                  inputChangeHandler(event.target.value, "email");
                }}
                error={!signupForm.email.valid}
                helperText={signupForm.email.error || ""}
                sx={{
                  ...(isShake && !signupForm.email.valid
                    ? { animation: `${shakeAnimation} 0.35s` }
                    : {}),
                }}
              />
            </FormControl>
            <FormControl fullWidth>
              <MuiTelInput
                label="Phone number"
                value={signupForm.phone.value}
                onChange={handlePhoneChange}
                error={!signupForm.phone.valid}
                helperText={signupForm.phone.error}
                sx={{
                  ...(isShake && !signupForm.phone.valid
                    ? { animation: `${shakeAnimation} 0.35s` }
                    : {}),
                }}
                defaultCountry="US"
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Username"
                value={signupForm.username.value}
                onChange={(event) => {
                  inputChangeHandler(event.target.value, "username");
                }}
                error={!signupForm.username.valid}
                helperText={signupForm.username.error || ""}
                sx={{
                  ...(isShake && !signupForm.username.valid
                    ? { animation: `${shakeAnimation} 0.35s` }
                    : {}),
                }}
              />
            </FormControl>
            <FormControl
              fullWidth
              sx={{
                ...(isShake && !signupForm.password.valid
                  ? { animation: `${shakeAnimation} 0.35s` }
                  : {}),
              }}
            >
              <InputLabel
                error={!signupForm.password.valid}
                htmlFor="standard-adornment-password"
              >
                Password
              </InputLabel>
              <OutlinedInput
                id="standard-adornment-password"
                type={showPassword ? "text" : "password"}
                value={signupForm.password.value}
                label="Password"
                error={!signupForm.password.valid}
                onChange={(event) => {
                  inputChangeHandler(event.target.value, "password");
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {!showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText error={!signupForm.password.valid}>
                {signupForm.password.error}
              </FormHelperText>
            </FormControl>
            <FormControl
              fullWidth
              sx={{
                ...(isShake && !signupForm.confirmPassword.valid
                  ? { animation: `${shakeAnimation} 0.35s` }
                  : {}),
              }}
            >
              <InputLabel
                error={!signupForm.confirmPassword.valid}
                htmlFor="standard-adornment-password"
              >
                Confirm Password
              </InputLabel>
              <OutlinedInput
                id="standard-adornment-password"
                type={showPassword ? "text" : "password"}
                value={signupForm.confirmPassword.value}
                error={!signupForm.confirmPassword.valid}
                label="Confirm Password"
                onChange={(event) => {
                  inputChangeHandler(event.target.value, "confirmPassword");
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {!showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText error={!signupForm.confirmPassword.valid}>
                {signupForm.confirmPassword.error}
              </FormHelperText>
            </FormControl>
            <LoadingButton
              loading={isSending}
              variant="contained"
              type="submit"
            >
              Signup
            </LoadingButton>
          </Box>
        </form>
        <Typography>
          Already have an account? <a href="/login">Click here</a> to login!
        </Typography>
      </Box>
    </Box>
  );
};

export default SignupPage;
