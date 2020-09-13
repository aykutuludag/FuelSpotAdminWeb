import React from "react";
import IconOK from "../img/ok.png"
import {confirmAlert} from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import {token} from "../App";

class LicenseCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let url = 'https://www.google.com.tr/search?q=' + this.props.licenseNo + '';

        return (
            <div className="card" id={this.props.id}>
                <div className="card-body">
                    <p className="card-text">{this.props.id}</p>
                    <a href={url} target="_blank"><h4 className="card-text">{this.props.licenseNo}</h4></a>
                    <p className="card-text">{this.props.distributorName}</p>
                    <p className="card-text">{this.props.il}</p>
                    <p className="card-text">{this.props.ilce}</p>
                    <p className="card-text">{this.props.date}</p>
                    <img className="btn" width={72} height={72} onClick={() => this.deleteLicense(this.props.id)}
                         src={IconOK}/>
                </div>
            </div>
        )
    }

    deleteLicense = (rID) => {
        confirmAlert({
            title: 'LİSANS NO SİLME',
            message: 'Bu lisans numarasını sisteme kaydettiyseniz silebilirsiniz.',
            buttons: [
                {
                    label: 'SİL',
                    onClick: () => {
                        this.removeLicenseFromMissingLicenses(rID)
                    }
                },
                {
                    label: 'İPTAL',
                }
            ]
        });
    };

    removeLicenseFromMissingLicenses(rowID) {
        let url = 'https://fuelspot.com.tr/api/v1.0/admin/remove-missing-license.php';
        let params = {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: "Bearer " + token,
            },
            body: 'id=' + rowID,
            method: "POST"
        };

        fetch(url, params)
            .then(
                (result) => {
                    alert("Lisans veritabanından silindi.");
                },
                (error) => {
                    alert("Silme işlemi sırasında bir hata oluştu");
                }
            );
    }
}

export default LicenseCard