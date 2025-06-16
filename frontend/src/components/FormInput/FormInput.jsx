import React from "react";
import "./FormInput.scss";
const FormInput = ({
  placeholder = "name@gmail.com",
  type = "text",
  name = "",
  required = false,
}) => {
  return (
    <div className="form-input">
      <input
        type={type}
        placeholder={placeholder}
        id={name}
        name={name}
        required={required}
      />
    </div>
  );
};

export default FormInput;
