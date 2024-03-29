import React from "react";

function CompanyCard(props) {
    return (
        <div className="card">
            <div className="card-body">
                <img className="card-img-top" src={props.companyLogo}/>
                <li className="list-group-item"><h5 className="card-title">{props.companyName}</h5></li>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><p><b>Onaylı:</b></p><p
                        className="card-text">{props.numOfVerifieds}</p></li>
                    <li className="list-group-item"><p><b>Toplam:</b></p><p
                        className="card-text">{props.numOfStations}</p></li>
                    <li className="list-group-item" style={{display: !props.companyWebsite && "none"}}><a
                        href={props.companyWebsite} target="_blank">{props.companyWebsite}</a></li>
                    <li className="list-group-item"><p><b>Son güncelleme:</b></p><p
                        className="card-text">{props.lastUpdated}</p></li>
                </ul>
            </div>
        </div>
    )
}

export default CompanyCard