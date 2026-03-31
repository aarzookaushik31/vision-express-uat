import React, { useEffect } from "react";
import Login from "@gofynd/theme-template/pages/login/login";
import { useFPI } from "fdk-core/utils";
import "@gofynd/theme-template/pages/login/login.css";
import useLogin from "../page-layouts/login/useLogin";
import AuthContainer from "../page-layouts/auth/auth-container/auth-container";
import { getConfigFromProps } from "../helper/utils";

function Component({ props }) {
  const fpi = useFPI();
  const loginProps = useLogin({ fpi });
  const pageConfig = getConfigFromProps(props);

  useEffect(() => {
    const interval = setInterval(() => {
      // 🔍 Target the submit button (update selector if needed)
      const button = document.querySelector('button[type="submit"]');

      if (button && !document.getElementById("tnc-checkbox")) {
        // Create wrapper
        const wrapper = document.createElement("div");
      wrapper.className = "tnc-wrapper";

        wrapper.innerHTML = `
          <input type="checkbox" id="tnc-checkbox" />
          <label for="tnc-checkbox" style="margin-left:8px;">
            I agree to  <a href="/terms-and-conditions" target="_blank">Terms of Service</a>
      &nbsp;&amp;&nbsp;
      <a href="/privacy-policy" target="_blank">Privacy Policy</a>
          </label>
        `;

        // Insert BEFORE button
        button.parentNode.insertBefore(wrapper, button);

        const checkbox = document.getElementById("tnc-checkbox");

        // Disable button initially
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";

        // Enable/disable on change
        checkbox.addEventListener("change", () => {
          button.disabled = !checkbox.checked;
          button.style.opacity = checkbox.checked ? "1" : "0.5";
          button.style.cursor = checkbox.checked ? "pointer" : "not-allowed";
        });

        // Extra safety: block click
        button.addEventListener("click", (e) => {
          if (!checkbox.checked) {
            e.preventDefault();
            e.stopPropagation();
            alert("Please accept Terms & Conditions");
          }
        });

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-auth-container">
      <AuthContainer
        bannerImage={pageConfig?.image_banner}
        bannerAlignment={pageConfig?.image_layout}
      >
        <Login {...loginProps} pageConfig={pageConfig} />
      </AuthContainer>
    </div>
  );
}

export default Component;