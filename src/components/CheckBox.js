import React from "react";
import {AUTH_KEY} from "../App";

class Checkbox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stationID: props.station.id,
            checked: props.station.isActive == 1
        };
        this.handleActiveChange = this.handleActiveChange.bind(this);
    }

    changeActive(isActive) {
        let _root = this;
        let paramMendatory = AUTH_KEY + '&stationID=' + this.state.stationID;
        let paramsChange = '&isActive=' + isActive;

        let url = 'https://fuelspot.com.tr/api/v1.0/admin/station-update.php';
        let params = {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: paramMendatory + paramsChange,
            method: "POST"
        };

        fetch(url, params)
            .then(
                (result) => {
                    alert("Kaydedildi" + result);
                    document.body.classList.remove("loading");
                    _root.setState({checked: !_root.state.checked});
                },
                (error) => {
                    alert("Kayıt başarısız!" + error);
                    console.log(error, "Kayıt başarısız!");
                }
            );

    }


    handleActiveChange(event) {


        let isActive = this.state.checked ? 0 : 1;

        if (!this.state.checked) {

            if (window.confirm('ID-' + this.props.station.id + '- İstasyonu aktife almak istediğinize emin misiniz?')) {
                // Save it!

                this.changeActive(isActive);

            } else {
                return false;
            }
        } else {
            if (window.confirm('ID-' + this.props.station.id + '- İstasyonu pasife almak istediğinize emin misiniz?')) {

                this.changeActive(isActive);

            } else {
                return false;
            }

        }


    }


    render() {


        return (
            <label className="checkbox">
                <input
                    type="checkbox"
                    className="on_off"
                    checked={this.state.checked}
                    onChange={this.handleActiveChange}
                />
                <div className="square btn btn-danger"/>
            </label>
        )
    }
}

export default Checkbox;