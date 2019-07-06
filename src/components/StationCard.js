import React from "react";
import _ from 'lodash';
import {COMPANIES, STATIONS, token} from './../App';
import CheckBox from './CheckBox'
import IconWC from "../img/bathroom.png";
import IconMarket from "../img/shopping-basket.png";
import IconCarWash from "../img/gas-station.png";
import IconMechanic from "../img/wrench.png";
import IconRestaurant from "../img/restaurant.png";
import IconTireRepair from "../img/tirerepair.png";
import IconParkSpot from "../img/parking-sign.png";
import IconATM from "../img/atm.png"
import IconMotel from "../img/motel.png"

const ICONS = {
    WC: IconWC,
    Market: IconMarket,
    CarWash: IconCarWash,
    Mechanic: IconMechanic,
    Restaurant: IconRestaurant,
    TireRepair: IconTireRepair,
    ParkSpot: IconParkSpot,
    ATM: IconATM,
    Motel: IconMotel,
};

export const buildStationsObject = (result) => {
    filterStations(result);
    filterDuplicatedStations(STATIONS.allStationsSortByLocation, STATIONS.duplicated_allStationsSortByLocation);
    filterDuplicatedStations(STATIONS.activeStationsSortByLocation, STATIONS.duplicated_activeStationsSortByLocation);
};

const filterStations = (stations) => {
    STATIONS.all = stations;

    //Filter Stations
    STATIONS.active = _.filter(STATIONS.all, {isActive: "1"});
    STATIONS.passive = _.filter(STATIONS.all, {isActive: "0"});
    STATIONS.isVerified = _.filter(STATIONS.active, {isVerified: "1"});
    STATIONS.waitingApproval = _.filter(STATIONS.active, station => (station.licenceNo !== '' && station.isVerified === '0') && station.owner !== '');
    STATIONS.isNoLogo = _.filter(STATIONS.active, {logoURL: "https://fuelspot.com.tr/default_icons/station.png"});

    //Stations Sort By Location
    STATIONS.allStationsSortByLocation = _.orderBy(STATIONS.all, "location");
    STATIONS.activeStationsSortByLocation = _.orderBy(STATIONS.active, "location");

    //Duplicated Stations
    STATIONS.duplicated_allStationsSortByLocation = [];
    STATIONS.duplicated_activeStationsSortByLocation = [];
};

const filterDuplicatedStations = (stations, hedef_array) => {
    let row = false;

    for (let i = 0; i < stations.length; i++) {
        let station_1 = stations[i]["location"].split(";");

        if (stations[i + 1]) {
            let station_2 = stations[i + 1]["location"].split(";");
            if (getDistanceFromLatLonInKm(station_1[0], station_1[1], station_2[0], station_2[1]) < 100) {
                if (!row) {
                    row = true;
                    hedef_array.push([stations[i], stations[i + 1]]);
                } else {
                    hedef_array[hedef_array.length - 1].push(stations[i + 1]);
                }
            } else {
                row = false;
            }
        }
    }
};

class StationCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            station: this.props.station,
            editmode: false,
            facilities: JSON.parse(this.props.station.facilities)[0]
        };
        this.onOffEdit = this.onOffEdit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleFacilities = this.handleFacilities.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        console.log(JSON.parse(this.props.station.facilities)[0]);
    }


    handleSubmit(e) {
        e.preventDefault();

        if (window.confirm('ID-' + this.props.station.id + '- istasyonunu değiştirmek istediğinize emin misiniz?')) {

            document.body.classList.add("loading");

            let paramMendatory = 'stationID=' + this.state.station.id;
            let paramsChange = '&stationName=' + this.state.station.name + '&stationVicinity=' + this.state.station.vicinity + '&country=' + this.state.station.country + '&location=' + this.state.station.location + '&facilities=' + this.state.station.facilities + '&stationLogo=' + this.state.station.logoURL + '&gasolinePrice=' + this.state.station.gasolinePrice + '&dieselPrice=' + this.state.station.dieselPrice + '&lpgPrice=' + this.state.station.lpgPrice + '&electricityPrice=' + this.state.station.electricityPrice + '&licenseNo=' + this.state.station.licenseNo + '&owner=' + this.state.station.owner + '&isVerified=' + this.state.station.isVerified + '&mobilePayment=' + this.state.station.isMobilePaymentAvailable + '&fuelDelivery=' + this.state.station.isDeliveryAvailable + '&isActive=' + this.state.station.isActive;

            let url = 'https://fuelspot.com.tr/api/v1.0/admin/station-update.php';
            let params = {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    Authorization: "Bearer " + token,
                },
                body: paramMendatory + paramsChange,
                method: "POST"
            };


            fetch(url, params)
                .then(
                    () => {

                        // GLOBAL STATIONS OBJECT UPDATE
                        //
                        const _root = this;
                        const stations = _.map(STATIONS.all, function (a) {
                            return a.id === _root.state.station.id ? _root.state.station : a;
                        });

                        buildStationsObject(stations);
                        console.log(STATIONS);


                        alert("Kaydedildi");
                        document.body.classList.remove("loading");
                    },
                    (error) => {
                        alert("Kayıt başarısız!");
                        console.log(error);
                    }
                );

        } else {

            return false;
        }

    }


    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState(prevState => ({
            station: {
                ...prevState.station,
                [name]: value
            }
        }));

        if (target.name === 'name') {

            const company = _.filter(COMPANIES, {companyName: target.value});

            this.setState(prevState => ({
                station: {
                    ...prevState.station,
                    logoURL: company[0].companyLogo
                }
            }));
        }


    }


    onOffEdit() {
        this.setState({editmode: !this.state.editmode});
    }


    handleFacilities(event) {

        const target = event.target;
        const value = target.checked;
        const name = target.name;

        const number = value === false ? "0" : "1";

        this.setState(
            prevState => ({
                facilities: {
                    ...prevState.facilities,
                    [name]: number
                }
            }),
            () => {

                this.state.station.facilities = "[" + JSON.stringify(this.state.facilities) + "]";
            }
        );


    }


    render() {
        if (this.state.editmode) {


            let _root = this;

            return (
                <form onSubmit={this.handleSubmit}>
                    <div className="card" key={this.state.station.id}>
                        <button className="btn btn-warning" onClick={() => this.onOffEdit()}>X</button>

                        <div className="card-body">
                            <div className="form-group row">
                                <div className="col-sm-3"/>
                                <div className="col-sm-9">
                                    <img className="card-img-top" src={this.state.station.logoURL}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Firma</label>
                                <div className="col-sm-9">
                                    <select name="name" className="form-control" onChange={this.handleInputChange}
                                            value={this.state.station.name}>
                                        {
                                            COMPANIES.map((item, i) => (
                                                <option key={i} value={item.companyName}>
                                                    {item.companyName}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Adres</label>
                                <div className="col-sm-9">
                                    <input name="vicinity" type="text" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.vicinity}/>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Benzin Fiyatı</label>
                                <div className="col-sm-9">
                                    <input name="gasolinePrice" type="number" className="form-control" step=".01"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.gasolinePrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Dizel Fiyatı</label>
                                <div className="col-sm-9">
                                    <input name="dieselPrice" type="number" className="form-control" step=".01"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.dieselPrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">LPG Fiyatı</label>
                                <div className="col-sm-9">
                                    <input name="lpgPrice" type="number" className="form-control" step=".01"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.lpgPrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Elektrik Fiyatı</label>
                                <div className="col-sm-9">
                                    <input name="electricityPrice" type="number" className="form-control" step=".01"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.electricityPrice}/>
                                </div>
                            </div>


                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Tesisler</label>
                                <div className="col-sm-9">
                                    {
                                        Object.keys(this.state.facilities).map(function (data, key) {
                                            return (
                                                <div className="form-check form-check-inline" key={key}>
                                                    <label className="checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="on_off"
                                                            name={data}
                                                            checked={_root.state.facilities[data] === 1}
                                                            onChange={_root.handleFacilities}
                                                        />
                                                        <img className="btn" src={ICONS[data]}/>
                                                        <p className="text-center">{data}</p>
                                                    </label>
                                                </div>
                                            );
                                        })

                                    }

                                    <input name="facilities" type="text" className="form-control"
                                           key={this.state.station.id}
                                           value={JSON.stringify(this.state.facilities)}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Kayıtlı Yetkili</label>
                                <div className="col-sm-9">
                                    <input name="owner" type="text" className="form-control"
                                           onChange={this.handleInputChange} defaultValue={this.state.station.owner}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Lokasyon</label>
                                <div className="col-sm-9">
                                    <input name="location" type="text" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.location}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Lisans Numarası</label>
                                <div className="col-sm-9">
                                    <input name="licenseNo" type="text" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.licenseNo}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Alo Yakıt</label>
                                <div className="col-sm-9">
                                    <input name="isDeliveryAvailable" type="number" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.isDeliveryAvailable}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">Mobil Ödeme</label>
                                <div className="col-sm-9">
                                    <input name="isMobilePaymentAvailable" type="number" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.isMobilePaymentAvailable}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">İstasyonu onayla?</label>
                                <div className="col-sm-9">
                                    <input name="isVerified" type="number" className="form-control"
                                           onChange={this.handleInputChange}
                                           defaultValue={this.state.station.isVerified}/>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-warning" type="submit" value="Submit">Kaydet</button>
                    </div>
                </form>

            )
        } else {
            let location = this.state.station.location.split(";");
            let mapHref = 'https://www.google.com/maps/place/' + location[0] + ',' + location[1] + '';

            return (
                <div className="card" id={this.state.station.id}>
                    <div className="card-body">
                        <img className="card-img-top" src={this.state.station.logoURL}/>

                        <ul className="list-group list-group-flush">
                            <li className="list-group-item"><h5 className="card-title">{this.state.station.name}</h5>
                            </li>
                            <li className="list-group-item"><p className="card-text">{this.state.station.vicinity}</p>
                            </li>
                            <li className="list-group-item"><a className="btn-link" href={mapHref}
                                                           target="_blank">{this.state.station.location}</a></li>
                        </ul>


                        <table className="table table-striped">
                            <tbody>
                            <tr>
                                <th scope="col">Benzin</th>
                                <th scope="col">Dizel</th>
                                <th scope="col">LPG</th>
                                <th scope="col">Elektrik</th>
                            </tr>
                            </tbody>
                            <tbody>
                            <tr>
                                <td>{this.state.station.gasolinePrice}</td>
                                <td>{this.state.station.dieselPrice}</td>
                                <td>{this.state.station.lpgPrice}</td>
                                <td>{this.state.station.electricityPrice}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer text-muted">
                        <CheckBox station={this.state.station}/>
                        <h4>ID: {this.state.station.id}</h4>
                        <button className="btn btn-primary" onClick={() => this.onOffEdit()}>Düzenle</button>
                    </div>
                </div>
            )
        }
    }
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
};

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    let R = 6371000;
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default StationCard;