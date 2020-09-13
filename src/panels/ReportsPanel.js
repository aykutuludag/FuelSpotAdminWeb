import ReportCard from "../components/ReportCard";
import React from "react";
import _ from "lodash";
import {ButtonContainer, REPORTS} from "../App";

function ReportsPanel() {
    return (
        <div className="panel panel-wide">
            <ButtonContainer
                name="İnceleme bekliyor"
                list={REPORTS.waiting}
                size={_.size(REPORTS.waiting)}
                menu={<ListView list={REPORTS.waiting}/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Onaylanmış"
                list={REPORTS.approved}
                size={_.size(REPORTS.approved)}
                menu={<ListView list={REPORTS.approved}/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Reddedilmiş"
                list={REPORTS.rejected}
                size={_.size(REPORTS.rejected)}
                menu={<ListView list={REPORTS.rejected}/>}
                class="btn btn-block btn-primary"
            />
        </div>
    );
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
                                                   status={report.status}
                                />
                            } else {
                                const duplicatedGroup = report.map((report_deep, subindex) => <ReportCard
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

