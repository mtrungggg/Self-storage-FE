import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginFeatures } from "../data/loginRepository";

// Application layer: encapsulates Login page state, side effects and data wiring.
export function useLogin() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const features = getLoginFeatures();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/home");
    }, 1000);
  };

  return {
    accountType,
    setAccountType,
    showPassword,
    setShowPassword,
    loading,
    features,
    handleSubmit,
  };
}
