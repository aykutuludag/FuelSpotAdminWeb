import React from "react";

function CompanyCard(props) {
    return (
        <div className="card">
            <div className="card-body">
                <p className="card-text">{props.id}</p>
                <p className="card-text">{props.username}</p>
                <p className="card-text">{props.stationID}</p>
                <p className="card-text">{props.report}</p>
                <p className="card-text">{props.details}</p>
                <p className="card-text">{props.prices}</p>
                <p className="card-text">{props.reportTime}</p>
                <img className="card-img-top" src={props.photo}/>
            </div>
        </div>
    )
}

export default CompanyCard