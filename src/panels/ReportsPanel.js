import ReportCard from "../components/ReportCard";
import React from "react";
import _ from "lodash";
import {AUTH_KEY, REPORTS} from "../App";


const filterReports = () => {
    REPORTS.all = REPORTS;

    //Filter Stations
    REPORTS.active = _.filter(REPORTS.all, {status: "1"});
    REPORTS.passive = _.filter(REPORTS.all, {status: "0"});
};

const getReports = () => {
    let url = 'https://fuel-spot.com/api/admin/bulk-report-fetch.php';
    let params = {
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: AUTH_KEY,
        method: "POST"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
                console.log("Raporlar çekildi.", result);
                REPORTS = result;
                filterReports()
            },
            (error) => {
                console.log("Raporlar çekilemedi", error);
            }
        );
};

function ShowReports() {
    return (
        <div className="panel">
            {
                REPORTS.map((item) => (
                    <ReportCard
                        id={item.id}
                        username={item.username}
                        stationID={item.stationID}
                        report={item.report}
                        details={item.details}
                        photo={item.photo}
                        prices={item.prices}
                        reportTime={item.reportTime}
                    />
                ))
            }
        </div>
    );
}

function ReportsPanel() {
    return (
        <div className="panel panel-wide">
            {getReports()}
            <button type="button" className="btn btn-block btn-primary" onClick={ShowReports}>Aktif
                raporlar
            </button>
            <button type="button" className="btn btn-block btn-primary" onClick={ShowReports}>Onay
                bekleyenler}
            </button>
        </div>
    );
}

export default ReportsPanel

