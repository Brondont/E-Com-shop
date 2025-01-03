import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  Typography,
  keyframes,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useFeedback } from "../../FeedbackAlertContext";
import { useNavigate } from "react-router-dom";

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

type LoginForm = {
  [key: string]: {
    value: string;
    valid: boolean;
    error: string;
  };
};

type LoginPageProps = {
  handleLogin: (token: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
  const [signupForm, setSignupForm] = useState<LoginForm>({
    email: {
      value: "",
      valid: true,
      error: "",
    },
    password: {
      value: "",
      valid: true,
      error: "",
    },
  });
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const { showFeedback } = useFeedback();
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const inputChangeHandler = (value: string, name: string) => {
    setSignupForm((prevState: LoginForm) => {
      const updatedForm = {
        ...prevState,
        [name]: {
          ...prevState[name],
          value: value,
        },
      };
      return updatedForm;
    });
  };

  const shakeFields = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  const handleSubmitSignup = (event: React.FormEvent) => {
    event.preventDefault();

    if (isSending) return;
    setIsSending(true);

    const formData = {
      email: signupForm.email.value,
      password: signupForm.password.value,
    };

    let statusCode: number;

    fetch(`${apiUrl}/postLogin`, {
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
          if (
            statusCode === 422 ||
            statusCode === 409 ||
            statusCode === 404 ||
            statusCode === 401
          ) {
            const updatedForm = { ...signupForm };

            console.log(resData);

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
        localStorage.setItem("token", resData.token);
        const remainingMiliseconds = 60 * 60 * 12 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMiliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        setIsSending(false);
        showFeedback("You're logged in! redirecting you to home page...", true);
        setTimeout(() => {
          handleLogin(resData.token);
        }, 2500);
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
          Login
        </Typography>
        <form onSubmit={handleSubmitSignup}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: 350,
              flexDirection: "column",
              gap: "30px",
            }}
          >
            <Typography>Login and start shopping</Typography>
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
              <TextField
                type="password"
                value={signupForm.password.value}
                label="Password"
                error={!signupForm.password.valid}
                helperText={signupForm.password.error || ""}
                onChange={(event) => {
                  inputChangeHandler(event.target.value, "password");
                }}
                sx={{
                  ...(isShake && !signupForm.password.valid
                    ? { animation: `${shakeAnimation} 0.35s` }
                    : {}),
                }}
              />
            </FormControl>

            <LoadingButton
              loading={isSending}
              variant="contained"
              type="submit"
            >
              Login
            </LoadingButton>
          </Box>
        </form>
        <Typography>
          Don't have an account? <a href="/signup">Click here</a> to make one!
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
