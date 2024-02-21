fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "test",
        password: "test",
    }),
})
    .then((res) => res.json())
    .then((data) => {
        console.log(data)
        localStorage.setItem("token", data.token);
    })
    .catch((err) => console.log(err));


fetch("http://localhost:3000/students", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
}).then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
