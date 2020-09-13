import React from "react";
import {COMPANIES} from "../App";
import CompanyCard from "../components/CompanyCard";

function DistributorsPanel() {
    return (
        <div className="panel panel-wide">
            {
                COMPANIES.map((item) => (
                    <CompanyCard
                        companyID={item.id}
                        companyName={item.companyName}
                        companyLogo={item.companyLogo}
                        numOfVerifieds={item.numOfVerifieds}
                        numOfStations={item.numOfStations}
                        companyWebsite={item.companyWebsite}
                        lastUpdated={item.lastUpdated}
                    />
                ))
            }
        </div>
    );
}

export default DistributorsPanel