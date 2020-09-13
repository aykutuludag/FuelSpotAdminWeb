import React from "react";
import IconOK from "../img/ok.png";
import {confirmAlert} from "react-confirm-alert";
import {token} from "../App";

let bonus = 0;

class ReportCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <b><p>ID</p></b>
                    <p className="card-text">{this.props.id}</p>
                    <b><p>Kullanıcı adı</p></b>
                    <p className="card-text">{this.props.username}</p>
                    <b><p>İstasyon ID</p></b>
                    <p className="card-text">{this.props.stationID}</p>
                    <b><p>Rapor türü</p></b>
                    <p className="card-text">{this.props.report}</p>
                    <b><p>Rapor bilgileri</p></b>
                    <p className="card-text">{this.props.details}</p>
                    <b><p>Fiyatlar</p></b>
                    <p className="card-text">{this.props.prices}</p>
                    <b><p>TARİH</p></b>
                    <p className="card-text">{this.props.reportTime}</p>
                    <b><p>FOTOĞRAF</p></b>
                    <img className="card-img-top" src={this.props.photo}/>
                    <br></br>
                    {this.props.status === "0" &&
                    <img className="btn" width={72} height={72}
                         onClick={() => this.verifyReport(this.props.id, this.props.status, this.props.username)}
                         src={IconOK}/>
                    }
                </div>
            </div>
        )
    }

    change(event) {
        bonus = event.target.value;
    }

    verifyReport = (reportID, status, username) => {
        confirmAlert({
            customUI: ({onClose}) => {
                return (
                    <div className='custom-ui'>
                        <h1>Raporu onayla</h1>
                        <p>Kullanıcıya vermek istediğiniz bonusu aşağı yazdıktan sonra onayla tuşuna basınız.</p>
                        <input name="licenseNo" type="text" className="form-control form-control-lg"
                               onChange={this.change} defaultValue="0"/>
                        <button onClick={onClose}>İptal</button>
                        <button
                            onClick={() => {
                                if (bonus !== 0) {
                                    this.approveReport(reportID, status, username, bonus);
                                }
                                onClose();
                            }}
                        >
                            ONAYLA
                        </button>
                    </div>
                );
            }
        });
    };

    approveReport(reportID, status, username, bonus) {
        let url = 'https://fuelspot.com.tr/api/v1.0/admin/add-fund.php';
        let params = {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: "Bearer " + token,
            },
            body: 'username=' + username + '&processType=reward&currency=TRY&country=TR&amount=' + bonus + '&notes=reportID: ' + reportID,
            method: "POST"
        };

        fetch(url, params)
            .then(
                (result) => {
                    alert("Rapor onaylandı.");
                },
                (error) => {
                    alert("Rapor onaylama işlemi sırasında hata alındı.");
                }
            );
    }
}

export default ReportCard