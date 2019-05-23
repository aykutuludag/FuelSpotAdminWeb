import React from "react";
import {AUTH_KEY, ButtonContainer, STATIONS} from "../App";
import StationCard from "../components/StationCard";
import _ from 'lodash';

function StationsPanel() {
    return (
        <div className="panel panel-wide">
            <ButtonContainer
                url="https://fuelspot.com.tr/api/v1.0/admin/bulk-station-fetch.php"
                param={'country=TR&' + AUTH_KEY}
                name="Türkiye"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuelspot.com.tr/api/v1.0/admin/bulk-station-fetch.php"
                param={'country=US&' + AUTH_KEY}
                name="Amerika"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuelspot.com.tr/api/v1.0/admin/bulk-station-fetch.php"
                param={'country=DE&' + AUTH_KEY}
                name="Almanya"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuelspot.com.tr/api/v1.0/admin/bulk-station-fetch.php"
                param={'country=AZ&' + AUTH_KEY}
                name="Azerbeycan"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuelspot.com.tr/api/v1.0/admin/bulk-station-fetch.php"
                param={'country=RU&' + AUTH_KEY}
                name="Rusya"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
        </div>
    );
}

class StationFilter extends React.Component {
    render() {
        return (
            <div className="panel panel-wide">
                <ButtonContainer
                    name="İstasyon Ara"
                    menu={<IdView key="id-view"/>}
                    class="btn btn-block btn-outline-primary"
                />
                <ButtonContainer
                    name="Aktif İstasyonlar"
                    list={STATIONS.active}
                    size={_.size(STATIONS.active)}
                    menu={<ActiveFilter key="active"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Pasif İstasyonlar"
                    list={STATIONS.passive}
                    size={_.size(STATIONS.passive)}
                    menu={<PassiveFilter key="passive"/>}
                    class="btn btn-block btn-primary"
                />
            </div>
        );
    }
}

class IdView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            station: null
        };
        this.change = this.change.bind(this);
    }

    change(event) {
        let getStation = _.filter(STATIONS.all, {id: event.target.value});

        if (getStation.length) {
            this.setState({station: getStation[0]});
        } else {
            this.setState({station: null});
        }
    }

    render() {

        return (
            <div className="panel panel-b-wide">
                <div className="form-group row panel-id">
                    <label className="col-12 col-form-label">İSTASYON ID</label>
                    <div className="col-12">
                        <input name="stationID" type="number" className="form-control form-control-lg" min="0" step="1"
                               onChange={this.change} defaultValue="0"/>
                    </div>
                </div>
                {this.state.station ? <StationCard station={this.state.station} key={this.state.station.id}/> : null}

            </div>
        );
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
                    visibleItems.map((station, index) => {
                            if (station.length === undefined || station.length === null) {
                                return <StationCard key={station.id} station={station}/>

                            } else {
                                const duplicatedGroup = station.map((station_deep, subindex) => <StationCard
                                    key={station_deep.id} station={station_deep}/>);
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

class ActiveFilter extends React.Component {

    render() {

        return (
            <div className="panel panel-wide">
                <ButtonContainer
                    name="Tümü"
                    list={STATIONS.active}
                    size={_.size(STATIONS.active)}
                    menu={<ListView list={STATIONS.active} key="allStations"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Onay Bekleyenler"
                    list={STATIONS.waitingApproval}
                    size={_.size(STATIONS.waitingApproval)}
                    menu={<ListView list={STATIONS.waitingApproval} key="waitingApproval"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Onaylılar"
                    list={STATIONS.isVerified}
                    size={_.size(STATIONS.isVerified)}
                    menu={<ListView list={STATIONS.isVerified} key="isVerified"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Logosuzlar"
                    list={STATIONS.isNoLogo}
                    size={_.size(STATIONS.isNoLogo)}
                    menu={<ListView list={STATIONS.isNoLogo} key="isNoLogo"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Kopya İstasyonlar"
                    list={STATIONS.duplicated_activeStationsSortByLocation}
                    size={_.size(STATIONS.duplicated_activeStationsSortByLocation)}
                    menu={<ListView list={STATIONS.duplicated_activeStationsSortByLocation}
                                    key="duplicated_activeStationsSortByLocation"/>}
                    class="btn btn-block btn-primary"
                />
            </div>

        );

    }

}

class PassiveFilter extends React.Component {

    render() {

        return (
            <div className="panel panel-wide">
                <ButtonContainer
                    name="Tümü"
                    list={STATIONS.passive}
                    size={_.size(STATIONS.passive)}
                    menu={<ListView list={STATIONS.passive} key="passive"/>}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Kopya İstasyonlar"
                    list={STATIONS.duplicated_allStationsSortByLocation}
                    size={_.size(STATIONS.duplicated_allStationsSortByLocation)}
                    menu={<ListView list={STATIONS.duplicated_allStationsSortByLocation}
                                    key="duplicated_allStationsSortByLocation"/>}
                    class="btn btn-block btn-primary"
                />
            </div>
        );
    }
}

export default StationsPanel