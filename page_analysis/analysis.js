import { getDataList } from "/firebase.js";
import { getData } from "/firebase.js"

const today_waste_ele = document.querySelector(".strong1");
const raw_date = new Date();
const year = raw_date.getFullYear();
const food_types = ["Chilli","Corn","Meatball"]
let month = raw_date.getMonth()+1;
if (month < 10) {
    month = `0${month}`
}
let day = raw_date.getDate();
if (day < 10) {
    day = `0${day}`
}
const full_date = `${year}${month}${day}`
let waste_dataObject = {};
let total = 0;
Promise.all(
    food_types.map(item =>
        getData(`/${item}/20250626`).then(data => {
            waste_dataObject[item] = data;
        })
    )
).then(() => {
    food_types.forEach((item) => {
        total += waste_dataObject[item]["data"]
    })
    today_waste_ele.innerHTML = total.toString();
});

function updateChart(type) {
    let chart_ele = document.getElementById(`${type}chartimg`)
    let input_dataset = [];
    if (type == "bar") {
        input_dataset = [{data:[]}];
        for (let i=0; i<3; i++) {
            input_dataset[0]["data"][i] = waste_dataObject[food_types[i]]
        }
    } else {
        
    }
    chart_ele.src = generate_chart (
        type=type,
        labels= type=="pie" ? ["6天前","5天前","4天前","3天前","2天前","昨天","今天"] : food_types
    )
}

function generate_chart(type,labels,datasets,title) {
    let jsonInput = {
        "type":type,
        "data": {
            "labels":labels,
            "datasets":datasets
        },
        "options": {
            title: {
                "display": true,
                "text": title
            }
        }
    }
    return ("https://quickchart.io/chart?c="+JSON.stringify("jsonInput"))
}

console.log(getDataList(location="Chilli",number=7))