import ReportCard from "../components/ReportCard";
import React, {Component} from "react";
import _ from "lodash";
import {AUTH_KEY, ButtonContainer} from "../App";
import StationCard from "../components/StationCard";

let REPORTS = {};

const filterReports = () => {
    REPORTS.all = this.state.reports;

    //Filter Stations
    REPORTS.active = _.filter(REPORTS.all, {status: "1"});
    REPORTS.passive = _.filter(REPORTS.all, {status: "0"});
};

const getReports = () => {
    document.body.classList.add("loading");
    let url = 'https://fuelspot.com.tr/api/admin/bulk-report-fetch.php';
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
                document.body.classList.remove("loading");
                console.log("Raporlar çekildi.", result);
                this.setState({isLoaded: true});
                filterReports()
            },
            (error) => {
                document.body.classList.remove("loading");
                console.log("Raporlar çekilemedi", error);
                this.setState({isLoaded: true});
            }
        );
};

class ReportsPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
        }
    }

    componentWillMount() {
        getReports();
    }

    render() {
        const {isLoaded} = this.state;
        if (!isLoaded) {
            return (
                <div className="panel panel-wide">
                    <ButtonContainer
                        name="Aktif raporlar"
                        list={REPORTS.active}
                        size={_.size(REPORTS.active)}
                        menu={<ListView list={REPORTS.active}/>}
                        class="btn btn-block btn-primary"
                    />
                    <ButtonContainer
                        name="Pasif raporlar"
                        list={REPORTS.passive}
                        size={_.size(REPORTS.passive)}
                        menu={<ListView list={REPORTS.passive}/>}
                        class="btn btn-block btn-primary"
                    />
                </div>
            );
        }
    }
}

class ListView extends React.Component {
    showPreviousPage = () => {
        if (this.state.page > 0) {
            this.setState(state => ({
                // limit the page number to no less than 0
                page: state.page - 1
            }))
        }
    };

    showNextPage = () => {
        if (this.state.page < this.state.maximum) {

            this.setState(state => ({
                // limit the page number to no greater than 2
                page: state.page + 1
            }))

        }
    };

    constructor(props) {
        super(props);
        this.state = {
            list: props.list,
            itemsToDisplay: 25,
            page: 0
        };

        if (this.props.list.length > this.state.itemsToDisplay) {
            const maxPage = props.list.length / 25;
            const max = maxPage.toFixed(1);
            this.state.pagination = true;
            this.state.pagination_dom = this.Pagination();
            this.state.maximum = max;
        }
    }

    Pagination() {
        return (
            <div className="btn-group btn-group-lg" role="group">
                <button className="btn btn-outline-dark" onClick={this.showPreviousPage}>Önceki Sayfa</button>
                <button className="btn btn-outline-dark" onClick={this.showNextPage}>Sonraki Sayfa</button>
            </div>
        )
    };


    render() {
        const startIndex = this.state.page * this.state.itemsToDisplay;
        const visibleItems = this.state.list.slice(startIndex, startIndex + this.state.itemsToDisplay);

        return (
            <div className="panel panel-b-wide d-flex">
                <React.Fragment>{this.state.pagination_dom}</React.Fragment>
                {
                    visibleItems.map((report, index) => {
                            if (report.length === undefined || report.length === null) {
                                return <ReportCard id={report.id} username={report.username} stationID={report.stationID}
                                                   report={report.report}
                                                   details={report.details}
                                                   photo={report.photo}
                                                   prices={report.prices}
                                                   reportTime={report.reportTime}
                                />
                            } else {
                                const duplicatedGroup = report.map((report_deep, subindex) => <StationCard
                                    key={report_deep.id} station={report_deep}/>);
                                return <div className="duplicate d-flex flex-row" key={index}>{duplicatedGroup}</div>;
                            }

                        }
                    )

                }
                <React.Fragment>{this.state.pagination_dom}</React.Fragment>
            </div>
        )
    }
}

export default ReportsPanel

