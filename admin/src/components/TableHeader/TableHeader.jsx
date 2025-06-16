import React from "react";
import "./TableHeader.scss";

// const TableHeader = () => {
//     return (
//         <div className="table-header-container">
//             <p className="table-header column-poster poster-video" role="columnheader">Poster</p>
//             <p className="table-header column-detail detail-video" role="columnheader">Detail</p>
//             <p className="table-header column-rating rating-video" role="columnheader">Rating</p>
//             <p className="table-header column-view view-video" role="columnheader">View</p>
//             <p className="table-header column-status status-video" role="columnheader">Status</p>
//             <p className="table-header column-actions actions-video" role="columnheader">Actions</p>
//         </div>
//     )
// }


const TableHeader = ({fields}) => {
    return (
        <div className="table-header-container">
            {fields.map((field, index) => (
                <p className={`table-header tbh-column-${index}`} role="columnheader" key={index}>{field}</p>
            ))}
        </div>
    )
}

export default TableHeader;
