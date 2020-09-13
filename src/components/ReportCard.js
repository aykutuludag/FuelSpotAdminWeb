import React from "react";

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
                </div>
            </div>
        )
    }
}

export default ReportCard