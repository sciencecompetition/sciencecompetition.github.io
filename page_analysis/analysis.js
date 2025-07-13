import { getData, getDataList } from "/firebase.js"

const today_waste_ele = document.querySelector(".strong1");
const raw_date = new Date("2025-6-26");
const raw_previous_date = new Date(raw_date);
const food_types = ["Chilli","Corn","Meatball"];
const chart_types = ["bar","pie","line"]

raw_previous_date.setDate(raw_date.getDate() - 6);

function stringifyDate(date) {
    const year = date.getFullYear();
    let month = date.getMonth()+1;
    if (month < 10) {
        month = `0${month}`
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`
    }
    return `${year}${month}${day}`
}

const full_date = stringifyDate(raw_date)
const previous_date = stringifyDate(raw_previous_date)

let waste_dataObject = {};
let total = 0;
function refresh_dataObject() {
    Promise.all(
    food_types.map(item =>
        getData(`/${item}/${full_date}`).then(data => {
            waste_dataObject[item] = data;
        })
        )
    ).then(() => {
        food_types.forEach((item) => {
            total += waste_dataObject[item]["data"]
        })
        today_waste_ele.innerHTML = total.toString();
        updateChart('pie');
    });
}

function generate_chart(type,label,datasets,title) {
    let jsonInput = {
        "type":type,
        "data": {
            "labels":label,
            "datasets":datasets
        },
        "options": {
            title: {
                "display": true,
                "text": title
            }
        }
    }
    const return_url = "https://quickchart.io/chart?c="+JSON.stringify(jsonInput);
    return return_url;
}

async function updateChart(type) {
    console.log("updating....")
    let chart_ele = document.querySelector(`.${type}chartimg`)
    let label_var = [];
    if (type=="pie") {
        label_var = food_types.slice()
    } else {
        label_var = ["6天前","5天前","4天前","3天前","2天前","昨天","今天"]
    }

    let input_dataset = [];
    //below code for making the datasets var
    if (type == "pie") {
        input_dataset = [{data:[]}];
        for (let i=0; i<3; i++) {
            input_dataset[0]["data"][i] = waste_dataObject[food_types[i]]["data"]
        }
    } else {
        input_dataset = await Promise.all(
            food_types.map(async (food) => {
                const return_value = await getDataList(food, previous_date, full_date);
                return {
                    data: return_value,
                    label: food
                };
            })
        );   
    }
    //

    chart_ele.src = generate_chart (type,label_var,input_dataset,"The amount of food waste (kg) in the previous week"
    )
}

// the first time show the photo+data
refresh_dataObject();
updateChart("bar")
updateChart("line")

//handle regenerate button
chart_types.forEach((type) => {
    console.log(type);
    let button = document.getElementById(`${type}_regenerate`);
    console.log(button);
    button.addEventListener("click", () => {
        if (type == "pie") {
            refresh_dataObject();
        } else {
            updateChart(type);
        }
        })
})

console.log("Hello world!");
