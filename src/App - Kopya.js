import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { activateGeod } from './redux';
import logo from './user-image.svg';
import './App.css';

var _ = require('lodash');


const STATIONS = {};
var COMPANIES = {};





    var http = new XMLHttpRequest();
    var url = 'http://fuel-spot.com/FUELSPOTAPP/api/admin-company-fetch.php';
    http.open('POST', url, true);
    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            console.log(JSON.parse(http.responseText));
        }
    };
    http.send();




class Button extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            containerId: null,
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

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });

                    STATIONS.all = result;
                    STATIONS.active = _.filter( STATIONS.all, {isActive: "1"} );
                    STATIONS.passive = _.filter( STATIONS.all, {isActive: "0"} );
                    STATIONS.isVerified = _.filter( STATIONS.active, {isVerified: "1"} );
                    STATIONS.isNoLogo = _.filter( STATIONS.active, {photoURL: "http://fuel-spot.com/FUELSPOTAPP/station_icons/unknown.jpg"} );
                    STATIONS.allstationsSortByLocation  = _.orderBy(STATIONS.active, "location");

                    STATIONS.duplicated  = [];

                    var deg2rad = function(deg) {
                        return deg * (Math.PI/180)
                    };

                    var getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
                        var R = 6371000;
                        var dLat = deg2rad(lat2-lat1);
                        var dLon = deg2rad(lon2-lon1);
                        var a =
                                Math.sin(dLat/2) * Math.sin(dLat/2) +
                                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                                Math.sin(dLon/2) * Math.sin(dLon/2)
                            ;
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        var d = R * c;
                        return d;
                    };

                    var row = false;

                    for (var i = 0; i <  STATIONS.allstationsSortByLocation.length ; i++) {

                        var station_1 = STATIONS.allstationsSortByLocation[i]["location"].split(";");

                        if( STATIONS.allstationsSortByLocation[i+1] ) {

                            var station_2 = STATIONS.allstationsSortByLocation[i+1]["location"].split(";");

                            if ( getDistanceFromLatLonInKm(station_1[0],station_1[1],station_2[0],station_2[1]) < 50 ) {

                                if ( !row ) {
                                    row = true;
                                    STATIONS.duplicated.push([STATIONS.allstationsSortByLocation[i],STATIONS.allstationsSortByLocation[i+1] ]);
                                } else {
                                    STATIONS.duplicated[STATIONS.duplicated.length - 1].push(STATIONS.allstationsSortByLocation[i+1]);
                                }

                            } else {
                                row = false;
                            }
                        }
                    }


                    console.log(STATIONS);

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
                    console.log(error);
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













const Child = ({ id }) => <div id={id}>content for id {id}</div>;



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
            this.state.maximum = max;
        }

        if ( this.state.pagination ) {

            this.state.pagination_dom = this.Pagination();
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




    DuplicatedView() {


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
            <div className="panel panel-b-wide d-flex flex-column">
                <React.Fragment>{this.state.pagination_dom}</React.Fragment>


                {


                    visibleItems.map((result, i) => (

                        <div className="card" id={result.id} key={i}>
                            <div className="card-body">
                                <img className="card-img-top" src={result.photoURL}/>
                                <h5 className="card-title">{result.name}</h5>
                                <p className="card-text">{result.vicinity}</p>
                                <a className="btn btn-primary" href={result.location.split(";")}>Haritada Aç</a>
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
                                        <td>{result.gasolinePrice}</td>
                                        <td>{result.dieselPrice}</td>
                                        <td>{result.lpgPrice}</td>
                                        <td>{result.electricityPrice}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="card-footer text-muted">
                                <Checkbox station={result}/>
                                <h4>{result.id}</h4>
                                <ButtonContainer
                                    name="Düzenle"
                                    class="btn btn-secondary"
                                    menu={<StationIdView key={result.id} station={result}/>}
                                />
                            </div>
                        </div>

                    ))
                }




            </div>
        )

    }
}














class StationIdView extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            station: this.props.station
        }
    }

    handleClickEvent(event) {

    }

    render(){

        return (
            <div className="panel panel-b-wide" id={this.state.station.id}>
                <div className="form-group row">
                    <img src={this.state.station.photoURL}/>
                </div>
                <div className="form-group row">
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {this.state.station.name}
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <a className="dropdown-item" href="#">Something else here</a>
                        </div>
                    </div>

                </div>
                <div className="form-group row">
                    <label class="col-form-label">Adres</label>
                    <input type="text" value={this.state.station.vicinity}/>
                </div>

                <div className="form-group row">
                    <label class="col-form-label">Benzin Fiyatı</label>
                    <input type="text" value={this.state.station.gasolinePrice}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">Dizel Fiyatı</label>
                    <input type="text" value={this.state.station.dieselPrice}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">LPG Fiyatı</label>
                    <input type="text" value={this.state.station.lpgPrice}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">Elektrik Fiyatı</label>
                    <input type="text" value={this.state.station.electricityPrice}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">İmkanlar</label>
                    <input type="text" value={this.state.station.facilities}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">Kayıtlı Yetkili</label>
                    <input type="text" value={this.state.station.owner}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">Lokasyon</label>
                    <input type="text" value={this.state.station.location}/>
                </div>
                <div className="form-group row">
                    <label class="col-form-label">Lisans Numarası</label>
                    <input type="text" value={this.state.station.licenceNo}/>
                </div>

                <ButtonContainer
                    name="Düzenle"
                    id={this.state.station.id}
                />
            </div>
        )
    }
}












class Checkbox extends React.Component {

    constructor (props) {
        super(props);
        const checked = this.props.station.isActive == 1;
        this.state = {
            checked: checked
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }


    changeActive(durum) {

        var _root = this;
        var http = new XMLHttpRequest();
        var params = 'stationID='+ this.props.station["id"] +'&stationName='+ this.props.station["name"] +'&stationVicinity='+ this.props.station["vicinity"] +'&facilities='+ this.props.station["facilities"] +'&licenseNo='+ this.props.station["licenseNo"] +'&owner='+ this.props.station["owner"] +'&gasolinePrice='+ this.props.station["gasolinePrice"] +'&dieselPrice='+ this.props.station["dieselPrice"] +'&lpgPrice='+ this.props.station["lpgPrice"] +'&electricityPrice='+ this.props.station["electricityPrice"] +'&isActive='+ durum +'';
        var url = 'http://fuel-spot.com/FUELSPOTAPP/api/admin-station-update.php';

        http.open('POST', url, true);
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                _root.setState({checked: !_root.state.checked});
                console.log("ACTİVE DEĞİŞİMİ BAŞARILI");
            }
        };
        http.send(params);

    }



    handleInputChange(event) {



        var durum = this.state.checked ? 0 : 1;

        if ( !this.state.checked ) {

            if (window.confirm('ID-'+ this.props.station.id +'- İstasyonu aktife almak istediğinize emin misiniz?')) {
                // Save it!

                this.changeActive(durum);

            } else {
                return false;
            }
        } else {
            if (window.confirm('ID-'+ this.props.station.id +'- İstasyonu pasife almak istediğinize emin misiniz?')) {

                this.changeActive(durum);

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
                    onChange={this.handleInputChange}
                />
                <div className="square"></div>
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
                    menu={<ListView list={STATIONS.active} key="1" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Onaylılar"
                    list={STATIONS.isVerified}
                    size={_.size(STATIONS.isVerified)}
                    menu={<ListView list={STATIONS.isVerified} key="2" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Logosuzlar"
                    list={STATIONS.isNoLogo}
                    size={_.size(STATIONS.isNoLogo)}
                    menu={<ListView list={STATIONS.isNoLogo} key="3" />}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Kopya İstasyonlar"
                    list={STATIONS.duplicated}
                    size={_.size(STATIONS.duplicated)}
                    menu={<ListView list={STATIONS.duplicated} key="4" />}
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
                    name="Aktif İstasyonlar"
                    list={STATIONS.active}
                    menu={<ActiveFilter/>}
                    size={_.size(STATIONS.active)}
                    class="btn btn-block btn-primary"
                />
                <ButtonContainer
                    name="Pasif İstasyonlar"
                    list={STATIONS.passive}
                    menu={<ListView list={STATIONS.passive} key="4" />}
                    size={_.size(STATIONS.passive)}
                    class="btn btn-block btn-primary"
                />
            </div>

        );

    }

}





function Stations() {
    return (
        <div className="panel panel-wide">
            <ButtonContainer
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=TR"
                name="Türkiye"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=US"
                name="Amerika"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=DE"
                name="Almanya"
                menu={<StationFilter/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=AZ"
                name="Azerbeycan"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php"
                param="country=RU"
                name="Rusya"
                class="btn btn-block btn-primary"
            />
        </div>

    );
}





function StartPanel() {
    return (
        <div className="panel panel-wide d-flex align-items-start flex-column">
            <img className="img-responsive" alt="User image" src={logo}/>
            <h2>FuelSpot Admin</h2>
            <ButtonContainer
                menu={<Stations/>}
                name="İstasyonlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
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




const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);


const ButtonContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Button);












export default AppContainer;
