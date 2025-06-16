import React from "react";  
import "./PageNavi.scss";

const PageNavi = ({currentPage, maxSize, pageSize}) => {
    return (
        <div className="page-navi">
            <p className="number-of-page">
                {pageSize} from {maxSize} TV Series
            </p>
            <ul className="switch-page-list">
                <li className="switch-page-pre switch-page-icon disabled">{"<"}</li>
                <li className="switch-page-num switch-page-icon page-current">1</li>
                <li className="switch-page-num switch-page-icon">2</li>
                <li className="switch-page-num switch-page-icon">3</li>
                <li className="switch-page-num switch-page-icon">4</li>
                <li className="switch-page-num switch-page-icon">5</li>
                <li className="switch-page-next switch-page-icon">{">"}</li>
            </ul>
        </div>
    )
}

export default PageNavi;