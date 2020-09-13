import React from 'react';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import './App.css';
import logo from './img/user-image.svg';
import fuelspotlogo from "./img/fuelspotlogo.svg"
import {activateGeod} from "./redux";
import Button from "./components/Button";

import StationsPanel from "./panels/StationsPanel";
import AutomobilesPanel from "./panels/AutomobilesPanel"
import CampaignsPanel from "./panels/CampaignsPanel"
import PurchasesPanel from "./panels/PurchasesPanel"
import ProfileUpdate from "./panels/ProfileUpdate";
import AccountingPanel from "./panels/AccountingPanel"
import DistributorsPanel from "./panels/DistributorsPanel"
import UsersPanel from "./panels/UsersPanel"
import SuperUsersPanel from "./panels/SuperUsersPanel"
import FuelBotPanel from "./panels/FuelBotPanel"
import ReportsPanel from "./panels/ReportsPanel";
import CommentsPanel from "./panels/CommentsPanel";
import _ from "lodash";

export const mapStateToProps = state => ({geod: state.geod});
export const mapDispatchToProps = {activateGeod};
export const ButtonContainer = connect(mapStateToProps, mapDispatchToProps)(Button);

export let STATIONS = {};
export let COMPANIES = {};
export let LICENSES = {};
export let REPORTS = {};

export let token;

if (localStorage.getItem('userData') != null) {
    token = JSON.parse(localStorage.getItem('userData'))[0].token;
}

const filterReports = (reports) => {
    REPORTS.all = reports;

    //Filter Reports
    REPORTS.approved = _.filter(REPORTS.all, {status: "1"});
    REPORTS.waiting = _.filter(REPORTS.all, {status: "0"});
    REPORTS.rejected = _.filter(REPORTS.all, {status: "-1"});
};

const getReports = () => {
    let url = 'https://fuelspot.com.tr/api/v1.0/admin/bulk-report-fetch.php';
    let params = {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + token,
        },
        method: "GET"
    };

    fetch(url, params)
        .then(res => res.json())
        .then((result) => {
                console.log("Raporlar çekildi.", result);
                REPORTS = result;
                filterReports(REPORTS);
            }, (error) => {
                console.log("Raporlar çekilemedi", error);
            }
        )
};

const getMissingLicenses = () => {
    let url = 'https://fuelspot.com.tr/api/v1.0/admin/missing-licenses.php';
    let params = {
        headers: {
            Authorization: "Bearer " + token,
        },
        method: "GET"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
                LICENSES = result;
            },
            (error) => {
                console.log("Eksik Lisanslar veritabanından çekilemedi.", error);
            }
        );
};

const getCompanies = () => {
    let url = 'https://fuelspot.com.tr/api/v1.0/other/company.php';
    let params = {
        headers: {
            Authorization: "Bearer " + token,
        },
        method: "GET"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
                COMPANIES = result;
            },
            (error) => {
                console.log("Firmalar veritabanından çekilemedi.", error);
            }
        );
};

function MainPanel() {
    let user = JSON.parse(localStorage.getItem('userData'))[0];
    return (
        <div className="panel panel-wide d-flex align-items-start flex-column text-center py-3">
            <ButtonContainer
                menu={<ProfileUpdate/>}
                name="!"
                class="btn btn-danger rounded-circle settings-btn"
            />
            <div className="mb-3 p-4">
                <img className="img-responsive" alt="User image" src={logo}/>
                <h4>{user.name}</h4>
            </div>
            <ButtonContainer
                name="İstasyonlar"
                menu={<StationsPanel/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Raporlar"
                menu={<ReportsPanel/>}
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                name="Kampanyalar"
                menu={<CampaignsPanel/>}
                class="btn btn-block btn-primary"
            />
            <button type="button" className="btn btn-block btn-primary" onClick={AutomobilesPanel}>Otomobiller</button>
            <button type="button" className="btn btn-block btn-primary" onClick={PurchasesPanel}>Satınalmalar</button>
            <button type="button" className="btn btn-block btn-primary" onClick={CommentsPanel}>Yorumlar</button>
            <button type="button" className="btn btn-block btn-primary" onClick={UsersPanel}>Kullanıcılar</button>
            <button type="button" className="btn btn-block btn-primary" onClick={SuperUsersPanel}>İstasyon Sahipleri
            </button>
            <button type="button" className="btn btn-block btn-primary" onClick={DistributorsPanel}>Distributörler
            </button>
            <button type="button" className="btn btn-block btn-primary" onClick={AccountingPanel}>Finans</button>
            <button type="button" className="btn btn-block btn-primary" onClick={FuelBotPanel}>FuelBot</button>
        </div>
    );
}

// App.js
export class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        if (!this.props.geod.title) {
            const view = [];
            view.push(<MainPanel/>);
            this.props.geod.title = view;
            this.props.geod.type = "panel wide-panel";
            getMissingLicenses();
            getCompanies();
            getReports();
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

const FuelSpotAdmin_LOGGEDIN = connect(mapStateToProps, mapDispatchToProps)(App);

export class FuelSpot_ADMIN extends React.Component {
    render() {
        return (
            <Router basename="./">
                <Switch>
                    <PrivateRoute path="/" component={FuelSpotAdmin_LOGGEDIN}/>
                    <Route path='/Login' component={Login}/>
                    <Route component={Login}/>
                </Switch>
            </Router>
        );
    }
}

export class Login extends React.Component {
    login = () => {
        if (this.state.username && this.state.password) {

            PostData(this.state.username, this.state.password)
                .then((result) => {
                    localStorage.setItem('userData', JSON.stringify(result));

                    fakeAuth.authenticate(() => {
                        this.setState({loggedIn: true});
                    });
                })
                .catch((error) => {
                    this.setState({error: true});
                });
        }
    };

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

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }


    render() {
        if (this.state.loggedIn) return <Redirect to={'/'}/>;
        return (
            <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column">
                <header className="masthead mb-auto">
                    <div className="inner">
                        <img src={fuelspotlogo}/>
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

                    <input id="name" className="form-control" name="username" type="text" placeholder="Kullanıcı Adı"
                           maxLength="30" aria-required="true" onChange={this.onChange}/>
                    <input id="password" className="form-control" name="password" type="password" placeholder="Şifre"
                           maxLength="30" aria-required="true" onChange={this.onChange}/>
                    <button className="btn btn-block btn-dark" type="submit" name="button" value="GİRİŞ" color="#fff"
                            onClick={() => this.login()}/>
                </main>
                <footer className="mastfoot mt-auto"/>
            </div>
        );
    }
}

function PrivateRoute({component: Component, ...rest}) {
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
                            state: {from: props.location}
                        }}
                    />
                )
            }
        />
    );
}

function PostData(username, password) {

    const url = "https://fuelspot.com.tr/api/v1.0/admin/login.php";
    const body = "username=" + username + "&password=" + password;
    const params = {
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: body,
        method: "POST"
    };
    return new Promise((resolve, reject) => {

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {
                    //Kullanıcı bulundu
                    resolve(result);
                },
                (error) => {
                    reject();
                }
            );

    });
}

export const fakeAuth = {
    isAuthenticated: !!localStorage.getItem('userData'),
    authenticate(cb) {
        this.isAuthenticated = true;
        setTimeout(cb, 100); // fake async
    },
    signout(cb) {
        this.isAuthenticated = false;
        setTimeout(cb, 100);
    }
};

export default FuelSpot_ADMIN;