export function PostData(username, password) {

    const url = "https://fuel-spot.com/api/admin/login.php";
    const body = "username=" + username + "&password=" + password + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
    const params ={
        headers: {
            "content-type" : "application/x-www-form-urlencoded"
        },
        body: body,
        method: "POST"
    };
    console.log(username,password);

    return new Promise((resolve, reject) =>{

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