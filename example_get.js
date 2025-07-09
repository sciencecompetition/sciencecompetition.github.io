getData("Chilli").then((promise) => {
    if (promise["Status"]) {
        let data = promise["data"]
        console.log(data[2][1])
    } else {
        console.log("error")
    }
}) 