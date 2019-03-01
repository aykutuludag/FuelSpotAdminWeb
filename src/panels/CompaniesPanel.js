import React from "react";
import {COMPANIES} from "../App";
import CompanyCard from "../components/CompanyCard"

function CompaniesPanel() {
    return (
        <div className="panel panel-wide">
            {
                COMPANIES.map((item) => (
                    <CompanyCard
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

export default CompaniesPanel