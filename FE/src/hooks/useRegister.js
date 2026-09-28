import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRegisterFaqs } from "../data/registerRepository";

// Application layer: encapsulates Register page state, side effects and data wiring.
export function useRegister() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const faqs = getRegisterFaqs();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  return {
    accountType,
    setAccountType,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    faqs,
    handleSubmit,
  };
}
