import React from "react";
import "./Form.scss";
import { Link } from "react-router-dom";
const Form = ({
  width = 300,
  title = "Login",
  props,
  children,
  onSubmit,
  submitButtonText = "Login",
  description,
  linkButtonAction,
  forgetPasswordAction,
}) => {
  return (
    <form
      className="form"
      style={{
        minWidth: width,
      }}
      {...props}
      onSubmit={onSubmit}
    >
      <div
        className="form-title"
        style={{ marginBottom: description ? 5 : 40 }}
      >
        {title}
        <Link to={"/"} className="back-link">
          <svg
            width="25px"
            height="25px"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0" />

            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <g id="SVGRepo_iconCarrier">
              <path
                fill="#fff"
                d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
              />

              <path
                fill="#fff"
                d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
              />
            </g>
          </svg>
        </Link>
      </div>
      {description && (
        <p className="form-description" style={{ marginBottom: 40 }}>
          {description}
        </p>
      )}
      <div className="form-content">
        <div className="form-components">{children}</div>

        <button
          className="submit-btn"
          type="submit"
          style={{ marginBottom: title === "Login" ? 5 : 20 }}
        >
          {submitButtonText}
        </button>
        {title === "Login" && (
          <button
            className="forgot-password-btn"
            style={{ marginBottom: 10 }}
            onClick={forgetPasswordAction}
          >
            Forget Password
          </button>
        )}
        {title === "Login" && (
          <div className="remember-user">
            <input
              type="checkbox"
              name="remember-user-checkbox"
              id="remember-user-checkbox"
            />
            <label htmlFor="remember-user-checkbox">Remember me</label>
          </div>
        )}
      </div>
      <div className="form-footer">
        {title === "Login" && (
          <p>
            Welcom to netflix?{" "}
            <button
              className="link-btn"
              type="button"
              onClick={linkButtonAction}
            >
              Register now
            </button>
          </p>
        )}
        {title === "Register" && (
          <p>
            Already have an account?{" "}
            <button
              className="link-btn"
              type="button"
              onClick={linkButtonAction}
            >
              Login now
            </button>
          </p>
        )}
        {title === "Recover password" && (
          <p>
            Remember your password?{" "}
            <button className="link-btn" onClick={linkButtonAction}>
              Login now
            </button>
          </p>
        )}
      </div>
    </form>
  );
};

export default Form;
