import React from "react";

function ProfileUpdate() {
    let user = JSON.parse(localStorage.getItem('userData'))[0];

    return (
        <div className="panel panel-wide">
            <div className="card">
                <div className="card-body">
                    <img className="card-img-top" src={user.photo}/>

                    <div>
                        <div className="form-group">
                            <label>Kullanıcı Adı</label>
                            <input name="name" type="text" className="form-control read-only" readonly
                                   value={user.name}/>
                        </div>

                        <div className="form-group">
                            <label>E-mail Adresi</label>
                            <input name="name" type="text" className="form-control read-only" readonly
                                   value={user.email}/>
                        </div>

                        <ul className="list-group list-group-flush">
                            <li class="list-group-item"><p className="card-text">ID: {user.id}</p></li>
                            <li class="list-group-item"><p className="card-title">DOĞUM TARİHİ: {user.birthday}</p></li>
                            <li class="list-group-item"><p className="card-text">SON DEĞİŞİKLİK: {user.lastUpdated}</p>
                            </li>
                        </ul>

                        <button className="btn btn-warning" value="Submit">DEĞİŞİKLİKLERİ KAYDET</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileUpdate