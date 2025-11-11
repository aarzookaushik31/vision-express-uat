import React, { useId, useState } from "react";
import ForgetPassword from "@gofynd/theme-template/pages/forgot-password/forget-password";
import "@gofynd/theme-template/pages/forgot-password/forget-password.css";
import styles from "./forget-password-page.less";
import AuthContainer from "../auth/auth-container/auth-container";
import useForgetPassword from "./useForgetPassword";

function ForgetPasswordPage({ fpi }) {
  const forgotPasswordProps = useForgetPassword({ fpi });
  return (
     <div className="forget-password-container">
    <AuthContainer>
      <ForgetPassword {...forgotPasswordProps} />
    </AuthContainer>
    </div>
  );
}

export default ForgetPasswordPage;
