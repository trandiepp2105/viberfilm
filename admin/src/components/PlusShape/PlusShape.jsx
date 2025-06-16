import React from "react";
import "./PlusShape.scss";

const PlusShape = ({isVisible}) => {
    return (
        <div className="plus-block" hidden={isVisible}></div>
    )
}

export default PlusShape;