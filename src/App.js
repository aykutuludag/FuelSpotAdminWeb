import React from 'react';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import './App.css';
import logo from './img/user-image.svg';
import fuelspotlogo from "./img/fuelspotlogo.svg"
import StationsPanel, {ButtonContainer, mapDispatchToProps, mapStateToProps} from "./panels/StationsPanel";
import ProfileUpdate from "./panels/ProfileUpdate";
import CompaniesPanel from "./panels/CompaniesPanel";

export let STATIONS = {};
export let COMPANIES = {};
export const AUTH_KEY = "AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";

const getCompanies = () => {
    let url = 'https://fuel-spot.com/api/other/company.php';
    let params = {
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

function MainPanel() {
    let user = JSON.parse(localStorage.getItem('userData'))[0];
    console.log(user);
    getCompanies();
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
                menu={<StationsPanel/>}
                name="İstasyonlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                // menu={<CampaignsPanel/>}
                name="Kampanyalar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //   menu={<ReportsPanel/>}
                name="Raporlar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //  menu={<PurchasesPanel/>}
                name="Satınalmalar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                menu={<CompaniesPanel/>}
                name="Dağıtım firmaları"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //    menu={<BankingPanel/>}
                name="Hesap hareketleri"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //    menu={<OrdersPanel/>}
                name="Siparişler"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //    menu={<UsersPanel/>}
                name="Kullanıcılar"
                class="btn btn-block btn-primary"
            />
            <ButtonContainer
                //   menu={<AutomobilesPanel/>}
                name="Araçlar"
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
            view.push(<MainPanel/>);
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

const FuelSpotAdmin_LOGGEDIN = connect(mapStateToProps, mapDispatchToProps)(App);

export class FuelSpot_ADMIN extends React.Component {
    render() {
        return (
            <Router basename="/admin">
                <Switch>
                    <PrivateRoute exact path="/" component={FuelSpotAdmin_LOGGEDIN}/>
                    <Route path='/Login' component={Login}/>
                    <Route component={Login}/>
                </Switch>
            </Router>
        );
    }
}

export class Login extends React.Component {
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

function PostData(username, password) {

    const url = "https://fuel-spot.com/api/admin/login.php";
    const body = "username=" + username + "&password=" + password + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
    const params = {
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: body,
        method: "POST"
    };
    console.log(username, password);

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

export default FuelSpot_ADMIN;