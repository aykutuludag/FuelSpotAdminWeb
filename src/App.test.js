import React, { Component } from 'react';
import logo from './user-image.svg';
import './App.css';



const STATIONS = {};














class Panel extends React.Component {
  render() {
    return (
        <div {...this.props}>
          new component
        </div>
    );
  }
}





class Button extends Component {

  getList (props) {



    console.log(props.list);

    if ( props.list == "stationsByCountry ") {

    }

  }



  render() {
    return (
        <button onClick={() => this.getList(this.props)}>{this.props.name}</button>
    )
  }

}







class Fetch extends Component {
  constructor () {
    super();
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };

  }
  fetchUrl (props) {

    console.log(props);

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
              console.log(result);

              return (
                  <Button onClick={() => this.fetchUrl(this.props)}>{this.props.name}</Button>
              )
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

    return (
        <button onClick={() => this.fetchUrl(this.props)}>{this.props.name}</button>
    )
  }
}






class FetchButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    var url = "http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php";
    var params ={
      headers: {
        "content-type" : "application/x-www-form-urlencoded"
      },
      body: "country=US",
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
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
        )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      console.log(items);
      return (
          <ul>
            {items.map(item => (
                <li key={item.id}>
                  {item.id}
                </li>
            ))}
          </ul>
      );
    }
  }

}









class NewComponent extends React.Component {
  render() {
    return (
        <div {...this.props}>
          new component
        </div>
    );
  }
}





class App extends Component {

  constructor() {
    super();
    this.state = {
      clicked: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    return (
        <div className="panel text-center">
          <div>
            <img className="img-responsive" alt="User image" src={logo}/>
            <h2>FuelSpot Admin</h2>
          </div>
          <Fetch url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php" param="country=TR" name="FETCH 1"/>
          <Fetch url="http://fuel-spot.com/FUELSPOTAPP/api/admin-station-fetch.php" param="country=US" name="FETCH 2"/>
          <Button list="stationsByCountry" name="İSTASYONLAR"/>
          <div className="box" data-card="users">KULLANICILAR</div>
          <div className="box" data-card="reports">RAPORLAR</div>
          <div className="box" data-card="comments">YORUMLAR</div>
          <div className="box fetch" data-fetch="http://fuel-spot.com/FUELSPOTAPP/api/admin-campaign-fetch.php" data-param="">KAMPANYALAR</div>
          <div className="box" data-card="buying">SATIN ALMALAR</div>
          <div className="box" data-card="feedbacks">FEEDBACKLER</div>
          <div className="box" data-card="cars">OTOMOBİLLER</div>
          <div className="box" data-card="taxes">VERGİLER</div>
          {this.state.clicked ? <NewComponent /> : null}
        </div>

    );
  }
}







export default App;




