import React from 'react';
import ReactDOM from 'react-dom';

import {connect} from 'react-redux';
import {activateGeod} from './redux';

import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";


import _ from 'lodash';

import {getDistanceFromLatLonInKm} from './services/LocationProximity';
import {PostData} from './services/PostData';

import './App.css';


import logo from './user-image.svg';


import IconWC from './bathroom.svg';
import IconMarket from './shopping-basket.svg';
import IconCarWash from './gas-station.svg';
import IconMechanic from './wrench.svg';
import IconRestaurant from './restaurant.svg';
import IconTireRepair from './tirerepair.svg';
import IconParkSpot from './parking-sign.svg';


var ICONS = {
    WC: IconWC,
    Market: IconMarket,
    CarWash: IconCarWash,
    Mechanic: IconMechanic,
    Restaurant: IconRestaurant,
    TireRepair: IconTireRepair,
    ParkSpot: IconParkSpot
};









const STATIONS = {};
var COMPANIES = {};

const AUTH_KEY = "AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";







const getCompanies = () => {

    var url  = 'https://fuel-spot.com/api/other-company.php';
    var params ={
        headers: {
            "content-type" : "application/x-www-form-urlencoded"
        },
        body: AUTH_KEY,
        method: "POST"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
                console.log("Firmalar çekildi.", result);
                COMPANIES = result;
            },
            (error) => {
                console.log("Firmalar veritabanından çekilemedi.",error);
            }
        );
};


getCompanies();







const filterStations = (stations) => {

    STATIONS.all = stations;

    //Filter Stations
    STATIONS.active = _.filter( STATIONS.all, {isActive: "1"} );
    STATIONS.passive = _.filter( STATIONS.all, {isActive: "0"} );
    STATIONS.isVerified = _.filter( STATIONS.active, {isVerified: "1"} );
    STATIONS.waitingApproval = _.filter(STATIONS.active, station => (station.licenceNo !== '' && station.isVerified === '0') && station.owner !== '');
    STATIONS.isNoLogo = _.filter( STATIONS.active, {logoURL: "https://fuel-spot.com/default_icons/station.jpg"} );

    //Stations Sort By Location
    STATIONS.allStationsSortByLocation  = _.orderBy(STATIONS.all, "location");
    STATIONS.activeStationsSortByLocation  = _.orderBy(STATIONS.active, "location");

    //Duplicated Stations
    STATIONS.duplicated_allStationsSortByLocation  = [];
    STATIONS.duplicated_activeStationsSortByLocation  = [];
};













const filterDuplicatedStations = (stations, hedef_array) => {

    var row = false;

    for (var i = 0; i <  stations.length ; i++) {

        var station_1 = stations[i]["location"].split(";");

        if( stations[i+1] ) {

            var station_2 = stations[i+1]["location"].split(";");

            if ( getDistanceFromLatLonInKm(station_1[0],station_1[1],station_2[0],station_2[1]) < 50 ) {
                if ( !row ) {
                    row = true;
                    hedef_array.push([stations[i],stations[i+1] ]);
                } else {
                    hedef_array[hedef_array.length - 1].push(stations[i+1]);
                }
            } else {
                row = false;
            }
        }
    }
};




const buildStationsObject = (result) => {
    filterStations(result);
    filterDuplicatedStations(STATIONS.allStationsSortByLocation, STATIONS.duplicated_allStationsSortByLocation);
    filterDuplicatedStations(STATIONS.activeStationsSortByLocation, STATIONS.duplicated_activeStationsSortByLocation);
};















class Button extends React.Component {


    constructor (props) {
        super(props);
        this.state = {
            selected: false,
            error: null,
            isLoaded: false,
            items: []
        };
    }


    updatePanel(panel) {
        const view = [];
        const domPanel = ReactDOM.findDOMNode(this).closest(".panel");
        const buttonIndex = Array.from(domPanel.parentElement.children).indexOf(domPanel);

        for (var i = 0; i < buttonIndex + 1; i++) {
            view[i] = this.props.geod.title[i];
        }
        view.push(panel);
        this.props.activateGeod({
            title: view
        });
    }


    fetchUrl(props) {

        var url = props.url;
        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body: props.param,
            method: "POST"
        };

        document.body.classList.add("loading");

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });

                    buildStationsObject(result);

                    console.log(STATIONS);

                    document.body.classList.remove("loading");
                    this.updatePanel( this.props.menu );
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                    document.body.classList.remove("loading");
                    alert("Veritabanı çekilemedi." + error);
                }
            )
    }


    render () {


        if ( !this.props.menu ) {
            return (
                <button className={this.props.class}>{this.props.name}</button>
            )
        }


        if ( this.props.size ) {
            return (
                <button className={this.props.class} onClick={() => this.updatePanel( this.props.menu )}>
                    {this.props.name}
                    <span className="badge badge-light">{this.props.size}</span>
                </button>
            )
        } else {

            if ( !this.props.url ) {
                return (
                    <button className={this.props.class} onClick={() => this.updatePanel( this.props.menu )}>{this.props.name}</button>
                )
            } else {
                return (
                    <button className={this.props.class} onClick={() => this.fetchUrl(this.props)}>{this.props.name}</button>
                )
            }

        }




    }
}











class ListView extends React.Component {


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


    showPreviousPage = () => {

        if ( this.state.page > 0 ) {

            this.setState(state => ({
                // limit the page number to no less than 0
                page: state.page - 1
            }))

        }

    };


    showNextPage = () => {

        if ( this.state.page < this.state.maximum ) {

            this.setState(state => ({
                // limit the page number to no greater than 2
                page: state.page + 1
            }))

        }
    };



    Pagination() {


            return (
                <div className="btn-group btn-group-lg" role="group">
                    <button className="btn btn-outline-dark" onClick={this.showPreviousPage}>Önceki Sayfa</button>
                    <button className="btn btn-outline-dark" onClick={this.showNextPage}>Sonraki Sayfa</button>
                </div>
            )

    };




    render(){

        const startIndex = this.state.page * this.state.itemsToDisplay;
        const visibleItems = this.state.list.slice(startIndex, startIndex + this.state.itemsToDisplay);

        return (
            <div className="panel panel-b-wide d-flex">
                <React.Fragment>{this.state.pagination_dom}</React.Fragment>
                {
                    visibleItems.map((station,index) =>

                            {
                                 if( station.length === undefined || station.length === null ) {
                                    return <StationCard key={station.id} station={station}/>

                                } else {
                                    const duplicatedGroup = station.map((station_deep, subindex) => <StationCard key={station_deep.id} station={station_deep} /> );
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

























class StationCard extends React.Component {

    constructor (props) {
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
    }


    handleSubmit(e) {
        e.preventDefault();

        if (window.confirm('ID-'+ this.props.station.id +'- istasyonunu değiştirmek istediğinize emin misiniz?')) {

            document.body.classList.add("loading");

            var paramMendatory = AUTH_KEY + '&stationID='+ this.state.station.id;
            var paramsChange = '&stationName='+ this.state.station.name +'&stationVicinity='+ this.state.station.vicinity +'&country='+ this.state.station.country +'&location='+ this.state.station.location +'&facilities='+ this.state.station.facilities +'&stationLogo='+ this.state.station.logoURL +'&gasolinePrice='+ this.state.station.gasolinePrice +'&dieselPrice='+ this.state.station.dieselPrice +'&lpgPrice='+ this.state.station.lpgPrice +'&electricityPrice='+ this.state.station.electricityPrice +'&licenseNo='+ this.state.station.licenseNo + '&owner='+ this.state.station.owner + '&isVerified='+ this.state.station.isVerified +'&mobilePayment='+ this.state.station.isMobilePaymentAvailable + '&fuelDelivery='+ this.state.station.isDeliveryAvailable + '&isActive='+ this.state.station.isActive;

            var url  = 'https://fuel-spot.com/api/admin/station-update.php';
            var params ={
                headers: {
                    "content-type" : "application/x-www-form-urlencoded"
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
                        const stations = _.map(STATIONS.all, function(a) {
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

        if ( target.name === 'name' ) {

            const company = _.filter( COMPANIES, {companyName: target.value} );

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

        const number = value == false ? "0" : "1";

        this.setState(
            prevState => ({
                facilities: {
                    ...prevState.facilities,
                    [name]: number
                }
            }),
            () => {
                this.state.station.facilities =  "["+JSON.stringify(this.state.facilities)+"]";
            }
        );


    }








    render() {
        if (this.state.editmode) {


            var _root = this;

            return (
                <form onSubmit={this.handleSubmit}>
                    <div className="card" id={this.state.station.id}>
                        <button className="btn btn-warning" onClick={() => this.onOffEdit()}>X</button>

                        <div className="card-body">
                            <div className="form-group row">
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">
                                    <img className="card-img-top" src={this.state.station.logoURL}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Firma</label>
                                <div class="col-sm-9">
                                    <select name="name" className="form-control" onChange={this.handleInputChange} value={this.state.station.name}>
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
                                <label class="col-sm-3 col-form-label">Adres</label>
                                <div class="col-sm-9">
                                    <input name="vicinity" type="text" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.vicinity}/>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Benzin Fiyatı</label>
                                <div class="col-sm-9">
                                    <input name="gasolinePrice" type="number" className="form-control" step=".01" onChange={this.handleInputChange} defaultValue={this.state.station.gasolinePrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Dizel Fiyatı</label>
                                <div class="col-sm-9">
                                    <input name="dieselPrice" type="number" className="form-control" step=".01" onChange={this.handleInputChange} defaultValue={this.state.station.dieselPrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">LPG Fiyatı</label>
                                <div class="col-sm-9">
                                    <input name="lpgPrice" type="number" className="form-control" step=".01" onChange={this.handleInputChange} defaultValue={this.state.station.lpgPrice}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Elektrik Fiyatı</label>
                                <div class="col-sm-9">
                                    <input name="electricityPrice" type="number" className="form-control" step=".01" onChange={this.handleInputChange} defaultValue={this.state.station.electricityPrice}/>
                                </div>
                            </div>


                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">İmkanlar</label>
                                <div class="col-sm-9">
                                    {
                                        Object.keys(this.state.facilities).map(function(data, key){
                                            return (
                                                <div class="form-check form-check-inline">
                                                    <label className="checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="on_off"
                                                            name={data}
                                                            checked={_root.state.facilities[data] == "1"}
                                                            onChange={_root.handleFacilities}
                                                        />
                                                        <img className="btn" src={ICONS[data]}/>
                                                        <p className="text-center">{data}</p>
                                                    </label>
                                                </div>
                                            );
                                        })

                                    }

                                    <input name="facilities" type="text" className="form-control" value={JSON.stringify(this.state.facilities)}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Kayıtlı Yetkili</label>
                                <div class="col-sm-9">
                                    <input name="owner" type="text" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.owner}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Lokasyon</label>
                                <div class="col-sm-9">
                                    <input name="location" type="text" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.location}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Lisans Numarası</label>
                                <div class="col-sm-9">
                                    <input name="licenseNo" type="text" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.licenseNo}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Alo Yakıt</label>
                                <div class="col-sm-9">
                                    <input name="isDeliveryAvailable" type="number" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.isDeliveryAvailable}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">Mobil Ödeme</label>
                                <div class="col-sm-9">
                                    <input name="isMobilePaymentAvailable" type="number" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.isMobilePaymentAvailable}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label class="col-sm-3 col-form-label">İstasyon kayıtlı mı?</label>
                                <div class="col-sm-9">
                                    <input name="isVerified" type="number" className="form-control" onChange={this.handleInputChange} defaultValue={this.state.station.isVerified}/>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-warning" type="submit" value="Submit">Kaydet</button>
                    </div>
                </form>

            )
        } else {


            var location = this.state.station.location.split(";");
            var mapHref = 'https://www.google.com/maps/place/'+ location[0] +','+ location[1] +'';

            return (
                <div className="card" id={this.state.station.id}>
                    <div className="card-body">
                        <img className="card-img-top" src={this.state.station.logoURL}/>

                        <ul className="list-group list-group-flush">
                            <li class="list-group-item"><h5 className="card-title">{this.state.station.name}</h5></li>
                            <li class="list-group-item"><p className="card-text">{this.state.station.vicinity}</p></li>
                            <li class="list-group-item"><a className="btn-link" href={mapHref} target="_blank">{this.state.station.location}</a></li>
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
                        <Checkbox station={this.state.station}/>
                        <h4>ID: {this.state.station.id}</h4>
                        <button className="btn btn-primary" onClick={() => this.onOffEdit()}>Düzenle</button>
                    </div>
                </div>
            )
        }
    }
}





//
//
//
//
//class Dropdown extends React.Component {
//
//    constructor (props) {
//        super(props);
//        this.state = {
//            selected: this.props.selected,
//            list: this.props.list,
//            showOptions: false
//        };
//        this.openDropdown = this.openDropdown.bind(this);
//        this.selectDropdown = this.selectDropdown.bind(this);
//    }
//
//
//
//    openDropdown = () => {
//        this.setState({showOptions: !this.state.showOptions});
//    };
//
//
//    selectDropdown = (stationName) => {
//        console.log(stationName)
//    };
//
//
//    GetOtherOptions = (stations) => {
//        return stations.map((company, index) => <li onClick={this.selectDropdown(company.companyName)} key={index}>{company.companyName}</li> );
//    };
//
//
//    render() {
//
//        const divideStations = _.partition(this.state.list, ["companyName", this.state.selected]);
//        console.log(divideStations);
//
//
//        return (
//            <ul key={this.props.id}>
//                <li key="selected" onClick={this.openDropdown}>{this.state.selected}</li>
//                {this.state.showOptions ? this.GetOtherOptions(divideStations[1]) : null}
//            </ul>
//        );
//
//
//    }
//
//}
//


















class Checkbox extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            stationID: props.station.id,
            checked: props.station.isActive == 1
        };
        this.handleActiveChange = this.handleActiveChange.bind(this);
    }


    changeActive(isActive) {

        var _root = this;
        var paramMendatory = AUTH_KEY + '&stationID='+ this.state.stationID;
        var paramsChange = '&isActive='+ isActive;


        var url  = 'https://fuel-spot.com/api/admin/station-update.php';
        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body: paramMendatory + paramsChange,
            method: "POST"
        };

        fetch(url, params)
            .then(
                (result) => {
                    alert("Kaydedildi");
                    document.body.classList.remove("loading");
                    _root.setState({checked: !_root.state.checked});
                },
                (error) => {
                    alert("Kayıt başarısız!");
                    console.log(error,"Kayıt başarısız!");
                }
            );

    }



    handleActiveChange(event) {


        var isActive = this.state.checked ? 0 : 1;

        if ( !this.state.checked ) {

            if (window.confirm('ID-'+ this.props.station.id +'- İstasyonu aktife almak istediğinize emin misiniz?')) {
                // Save it!

                this.changeActive(isActive);

            } else {
                return false;
            }
        } else {
            if (window.confirm('ID-'+ this.props.station.id +'- İstasyonu pasife almak istediğinize emin misiniz?')) {

                this.changeActive(isActive);

            } else {
                return false;
            }

        }


    }



    render(){



        return (
            <label className="checkbox">
                <input
                    type="checkbox"
                    className="on_off"
                    checked={this.state.checked}
                    onChange={this.handleActiveChange}
                />
                <div className="square btn btn-danger"></div>
            </label>
        )
    }
}








class ActiveFilter extends React.Component {

    render(){

        return (
            <div className="panel panel-wide">
                <ButtonContainer
                    name="Tümü"
                    list={STATIONS.active}
                    size={_.size(STATIONS.active)}
                    menu={<ListView list={STATIONS.active} key="allStations" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Onay Bekleyenler"
                    list={STATIONS.waitingApproval}
                    size={_.size(STATIONS.waitingApproval)}
                    menu={<ListView list={STATIONS.waitingApproval} key="waitingApproval" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Onaylılar"
                    list={STATIONS.isVerified}
                    size={_.size(STATIONS.isVerified)}
                    menu={<ListView list={STATIONS.isVerified} key="isVerified" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Logosuzlar"
                    list={STATIONS.isNoLogo}
                    size={_.size(STATIONS.isNoLogo)}
                    menu={<ListView list={STATIONS.isNoLogo} key="isNoLogo" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Kopya İstasyonlar"
                    list={STATIONS.duplicated_activeStationsSortByLocation}
                    size={_.size(STATIONS.duplicated_activeStationsSortByLocation)}
                    menu={<ListView list={STATIONS.duplicated_activeStationsSortByLocation} key="duplicated_activeStationsSortByLocation" />}
                    class="btn btn-block btn-primary"
                />
            </div>

        );

    }

}







class PassiveFilter extends React.Component {

    render(){

        return (
            <div className="panel panel-wide">
                <ButtonContainer
                    name="Tümü"
                    list={STATIONS.passive}
                    size={_.size(STATIONS.passive)}
                    menu={<ListView list={STATIONS.passive} key="passive" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Kopya İstasyonlar"
                    list={STATIONS.duplicated_allStationsSortByLocation}
                    size={_.size(STATIONS.duplicated_allStationsSortByLocation)}
                    menu={<ListView list={STATIONS.duplicated_allStationsSortByLocation} key="duplicated_allStationsSortByLocation" />}
                    class="btn btn-block btn-primary"
                />
            </div>

        );

    }

}













class StationFilter extends React.Component {

    render(){

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
                    menu={<ActiveFilter key="active" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Pasif İstasyonlar"
                    list={STATIONS.passive}
                    size={_.size(STATIONS.passive)}
                    menu={<PassiveFilter key="passive" />}
                    class="btn btn-block btn-primary"
                />

            </div>

        );

    }

}























class IdView extends React.Component{

    constructor (props) {
        super(props);
        this.state = {
            station: null
        };
        this.change = this.change.bind(this);
    }

    change(event){
        var getStation =  _.filter( STATIONS.all, {id: event.target.value} );

        if ( getStation.length ) {
            this.setState({station: getStation[0]});
        } else {
            this.setState({station: null});
        }
    }

    render(){

            return(
                <div class="panel panel-b-wide">
                    <div className="form-group row panel-id">
                        <label class="col-12 col-form-label">İSTASYON ID</label>
                        <div class="col-12">
                            <input name="stationID" type="number" className="form-control form-control-lg" min="0" step="1" onChange={this.change} defaultValue="0"/>
                        </div>
                    </div>
                    { this.state.station ? <StationCard station={this.state.station} key={this.state.station.id}/> : null }

                </div>
            );
    }

}






function Stations() {
    return (
        <div className="panel panel-wide">
            <ButtonContainer
                url="https://fuel-spot.com/api/admin/station-fetch.php"
                param={'country=TR&' + AUTH_KEY}
                name="Türkiye"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuel-spot.com/api/admin/station-fetch.php"
                param={'country=US&' + AUTH_KEY }
                name="Amerika"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuel-spot.com/api/admin/station-fetch.php"
                param={'country=DE&' + AUTH_KEY }
                name="Almanya"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuel-spot.com/api/admin/station-fetch.php"
                param={'country=AZ&' + AUTH_KEY }
                name="Azerbeycan"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="https://fuel-spot.com/api/admin/station-fetch.php"
                param={'country=RU&' + AUTH_KEY }
                name="Rusya"
                class="btn btn-block btn-primary"
            />
        </div>

    );
}








function Companies() {

    return (
        <div className="panel panel-wide">
            {
                COMPANIES.map((item, i) => (

                    <div className="card">
                        <div className="card-body">
                            <img className="card-img-top" src={item.companyLogo}/>

                            <ul className="list-group list-group-flush">
                                <li class="list-group-item"><h5 className="card-title">{item.companyName}</h5></li>
                                <li class="list-group-item"><p className="card-text">{item.numOfVerifieds}</p></li>
                                <li class="list-group-item"><p className="card-text">{item.numOfStations}</p></li>
                                <li class="list-group-item"><p className="card-text">{item.lastUpdated}</p></li>
                                <li class="list-group-item"><p className="card-text">{item.isVerified ? "0" : "1" }</p></li>
                            </ul>

                        </div>

                        <div className="card-footer text-muted">
                            <button className="btn btn-primary">Düzenle</button>
                        </div>
                    </div>

                ))

            }
        </div>
    );
}






function Settings() {


    var user = JSON.parse(localStorage.getItem('userData'))[0];

    return (

        <div className="panel panel-wide">
            <div className="card">
                <div className="card-body">
                    <img className="card-img-top" src={user.photo}/>

                    <div>
                        <div className="form-group">
                            <label>Kullanıcı Adı</label>
                            <input name="name" type="text" className="form-control read-only" readonly value={user.name}/>
                        </div>

                        <div className="form-group">
                            <label>E-mail Adresi</label>
                            <input name="name" type="text" className="form-control read-only" readonly value={user.email}/>
                        </div>


                        <ul className="list-group list-group-flush">
                            <li class="list-group-item"><p className="card-text">ID: {user.id}</p></li>
                            <li class="list-group-item"><p className="card-title">DOĞUM TARİHİ: {user.birthday}</p></li>
                            <li class="list-group-item"><p className="card-text">SON DEĞİŞİKLİK: {user.lastUpdated}</p></li>
                        </ul>


                        <button className="btn btn-warning" value="Submit">DEĞİŞİKLİKLERİ KAYDET</button>
                    </div>

                </div>

            </div>

        </div>




    )


}






function StartPanel() {


    var user = JSON.parse(localStorage.getItem('userData'))[0];
    console.log(user);

    return (
        <div className="panel panel-wide d-flex align-items-start flex-column text-center py-3">
            <ButtonContainer
                menu={<Settings/>}
                name="!"
                class="btn btn-danger rounded-circle settings-btn"
            />
            <div className="mb-3 p-4">
                <img className="img-responsive" alt="User image" src={logo}/>
                <h4>{user.name}</h4>
            </div>
            <ButtonContainer
                menu={<Stations/>}
                name="İstasyonlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                menu={<Companies/>}
                name="Markalar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Kullanıcılar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Raporlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Yorumlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Kampanyalar"
                class="btn btn-block btn-primary"
            />
        </div>
    );
}









// App.js
export class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        if ( !this.props.geod.title ) {
            const view = [];
            view.push(<StartPanel/>);
            this.props.geod.title = view;
            this.props.geod.type = "panel wide-panel";
        }
    }

    render() {
        return (
            this.props.geod.title.map((result, i) => (
                <React.Fragment key={i}>{result}</React.Fragment>
            ))
        );
    }
}







// AppContainer.js
const mapStateToProps = state => ({
    geod: state.geod
});

const mapDispatchToProps = {
    activateGeod
};




const FuelSpotAdmin_LOGGEDIN = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);


const ButtonContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Button);






const fakeAuth = {

    isAuthenticated: localStorage.getItem('userData') ? true : false,
    authenticate(cb) {
        this.isAuthenticated = true;
        setTimeout(cb, 100); // fake async
    },
    signout(cb) {
        this.isAuthenticated = false;
        setTimeout(cb, 100);
    }
};



















export class FuelSpot_ADMIN extends React.Component {

    render() {

        return (
            <Router basename="/admin">
                <Switch>
                    <PrivateRoute exact path="/" component={FuelSpotAdmin_LOGGEDIN}/>
                    <Route path='/Login' component={FuelSpotAdmin_LOGIN}/>
                    <Route component={FuelSpotAdmin_LOGIN} />
                </Switch>
            </Router>
        );
    }
}











export class FuelSpotAdmin_LOGIN extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loggedIn: fakeAuth.isAuthenticated
        };
        this.login = this.login.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    login = () => {
        if(this.state.username && this.state.password){

            PostData(this.state.username,this.state.password)
                .then((result) => {
                    console.log("Kullanıcı Bulundu", result);
                    localStorage.setItem('userData',JSON.stringify(result));

                    fakeAuth.authenticate(() => {
                        this.setState({ loggedIn: true });
                    });
                })
                .catch((error) => {
                    console.log("Kullanıcı Bulunamadı");
                    this.setState({ error: true });
                });
        }
    };


    onChange(e){
        this.setState({[e.target.name]:e.target.value});
    }



    render() {

        if (this.state.loggedIn) return <Redirect to={'/'} />;

        return (
            <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column">
                <header className="masthead mb-auto">
                    <div className="inner">
                        <h3 className="masthead-brand">FuelSpot</h3>
                    </div>
                </header>
                <main className="text-center">

                    <React.Fragment>
                        {
                        this.state.error ?
                            <p className="text-danger">Hatalı kullanıcı adı veya şifre</p>
                            :
                            null
                        }
                    </React.Fragment>

                    <input id="name" class="form-control" name="username" type="text" placeholder="Kullanıcı Adı" maxlength="20" aria-required="true" onChange={this.onChange} />
                    <input id="password" class="form-control" name="password" type="password" placeholder="Şifre" maxlength="15" aria-required="true" onChange={this.onChange} />
                    <button class="btn btn-block btn-dark" type="submit" name="button" value="GİRİŞ" onClick={() => this.login()} />
                </main>
                <footer className="mastfoot mt-auto"></footer>
            </div>
        );
    }
}























function PrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={props =>
                fakeAuth.isAuthenticated ? (
                  <Component {...props} />
                ) : (
                  <Redirect
                    to={{
                      pathname: "/Login",
                      state: { from: props.location }
                    }}
                  />
                )
              }
        />
    );
}















export default FuelSpot_ADMIN;
