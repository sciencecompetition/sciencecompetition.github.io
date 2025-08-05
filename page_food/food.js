import { getData, getDataList } from "/firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYEoyWgcbPsiNFVd30KYjkshD5AgjF9Bk"/*API_key*/,
  authDomain: "food-waste-record.firebaseapp.com",
  databaseURL: "https://food-waste-record-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "food-waste-record",
  storageBucket: "food-waste-record.firebasestorage.app",
  messagingSenderId: "891094328182",
  appId: "1:891094328182:web:18d1c293b282324dabd057",
  measurementId: "G-M6WWZ0CR05"
};

const app = await initializeApp(firebaseConfig);
const auth = await getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(user)
    const user_id = user.uid;
    await verifiedUser(user_id);
  } else {
    window.location.href = "/index.html";
  }
});

async function verifiedUser(user_id) {
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

    function defDate(numberOfDaysBefore) {
        let return_date_raw = new Date(raw_date)
        return_date_raw.setDate(raw_date.getDate()-numberOfDaysBefore);
        return return_date_raw;
    }

    const raw_date = new Date("2025-8-7");
    const full_date = stringifyDate(raw_date)
    const week_ago = stringifyDate(defDate(6))
    const month_ago = stringifyDate(defDate(29))
    const week_ago_2 = stringifyDate(defDate(13))
    const queryParameters = new URLSearchParams(window.location.search);
    const food_type = queryParameters.get('food');
    const title_ele = document.getElementById("title");
    const photo = document.querySelector(".foodimg");
    const waste_today_ele = document.getElementById("waste_today");
    const waste_total_ele = document.getElementById("waste_total");
    const buy_Object = await getData(`/${user_id}/${food_type}_buy`)//whole food data on buying
    //const download_png = [...document.querySelectorAll(".btnstyle2")].slice(1,4);
    //const download_jpg = [...document.querySelectorAll(".btnstyle")].slice(1,4);
    title_ele.innerText = food_type;
    photo.src = `/image_sources/${food_type}.png`

    getData(`/${user_id}/${food_type}`).then(async (return_value) => {
        let data_Object = return_value["data"] //one food all data
        let data_list = []; //data_list[0] is the newest one
        if (!data_Object[full_date]) {
            data_Object[full_date] = 0;
        }
        Object.values(data_Object).forEach((value) => {
            data_list.push(value);
        })
        data_list.reverse();
        let data_sum = calculateSum(data_list);
        waste_total_ele.innerText = data_sum
        waste_today_ele.innerText = data_Object[full_date]
        // daily part
        document.getElementById("daily_now").innerText = `Today: ${data_Object[full_date]} kg `
        let daily_difference = round((data_list[0]-data_list[1]));
        let daily_difference_ele = document.getElementById("daily_difference")
        daily_difference_ele.innerText = `(${daily_difference>=0 ? "+" : ""}${daily_difference}kg)`;
        daily_difference_ele.style.color = color(daily_difference)
        getData(`/${user_id}/${food_type}_buy/${full_date}`).then((buy_data) => {
            document.getElementById("daily_ratio").innerText = `Waste ratio: ${round(data_list[0]/(data_list[0]+buy_data["data"])*100)}%`
        })
        let daily_average = calculateSum(data_list)/data_list.length;
        
        //chart part for daily
        document.getElementById("daily_average").innerText = `Average Daily Waste: ${round(daily_average)}kg`
        let daily_chart = document.querySelector(".dailyimg")
        var daily_dataset = [];
        let week_buy=[];
        await (async () => {
            let buy_data = await getDataList(`/${user_id}/${food_type}_buy`,week_ago,full_date)
            daily_dataset = [{
                    "data":data_list.slice(0,7).reverse(),
                    "label":`${food_type} wasted (kg)`,
                }, {
                    "data":buy_data,
                    "label":`${food_type} bought (kg)`
                }
            ]
            week_buy = buy_data.slice()
            daily_chart.src=generate_chart (
            "bar",
            ["6天前","5天前","4天前","3天前","2天前","昨天","今天"],
            daily_dataset,
            `${food_type} wasted in the last 7 days`
            )
        } )();
        /////////////////////////////////////////////////////////////////////////////////

        //weekly part
        let waste_thisweek = calculateSum(data_list.slice(0,7))
        let waste_lastweek = calculateSum(data_list.slice(7,14))
        let weekly_difference_ele = document.getElementById("weekly_difference")
        let weekly_difference = round(waste_thisweek-waste_lastweek)

        document.getElementById("weekly_now").innerText = `This week: ${waste_thisweek}`
        weekly_difference_ele.innerText = `(${weekly_difference>=0 ? "+" : ""}${weekly_difference}kg)`
        weekly_difference_ele.color = color(weekly_difference)
        document.getElementById("weekly_ratio").innerText = `Waste ratio: ${round(waste_thisweek/(waste_thisweek+calculateSum(week_buy))*100)}%`
        document.getElementById("weekly_average").innerText = `Average weekly: ${round(daily_average*7)}kg`

        //chart for weekly
        let weekly_chart = document.querySelector(".weeklyimg")
        let last_week_buy = await getDataList(`/${user_id}/${food_type}_buy`,week_ago_2,stringifyDate(defDate(7)));
        let weekly_dataset = [{
                "data":[calculateSum(data_list.slice(0,7)), calculateSum(data_list.slice(7,14))],
                "label":`${food_type} wasted (kg)`,
            }, {
                "data":[calculateSum(week_buy),calculateSum(last_week_buy)],
                "label":`${food_type} bought (kg)`
            }
        ]
        weekly_chart.src=generate_chart (
            "bar",
            ["上週","本週"],
            weekly_dataset,
            `${food_type} wasted in the last 2 weeks`
        )
        /////////////////////////////////////////////////////////////////////////////////
        
        //monthly part
        let waste_thismonth = calculateSum(data_list.slice(0,30))
        let waste_lastmonth = calculateSum(data_list.slice(30,60))
        let monthly_difference_ele = document.getElementById("monthly_difference")
        let monthly_difference = round(waste_thismonth-waste_lastmonth)
        let month_buy = await getDataList(`/${user_id}/${food_type}_buy`,month_ago,full_date)

        document.getElementById("monthly_now").innerText = `This month: ${waste_thismonth}`
        monthly_difference_ele.innerText = `(${monthly_difference>=0 ? "+" : ""}${monthly_difference}kg)`
        monthly_difference_ele.color = color(monthly_difference)
        document.getElementById("monthly_ratio").innerText = `Waste ratio: ${round(waste_thismonth/(waste_thismonth+calculateSum(month_buy))*100)}%`
        document.getElementById("monthly_average").innerText = `Average monthly: ${round(daily_average*30)}kg`

        //chart for weekly
        let monthly_chart = document.querySelector(".monthlyimg")
        let last_month_buy = await getDataList(`/${user_id}/${food_type}_buy`,stringifyDate(defDate(59)),stringifyDate(defDate(30)));
        let monthly_dataset = [{
                "data":[calculateSum(data_list.slice(30,60)), calculateSum(data_list.slice(0,30))],
                "label":`${food_type} wasted (kg)`,
            }, {
                "data":[calculateSum(last_month_buy),calculateSum(month_buy)],
                "label":`${food_type} bought (kg)`
            }
        ]
        monthly_chart.src=generate_chart (
            "bar",
            ["上月","本月"],
            monthly_dataset,
            `${food_type} wasted in the last 2 months`
        )
        /////////////////////////////////////////////////////////////////////////////////
        //AI suggestion part
        let AI_suggestion_ele = document.getElementById("AI_suggestion")
        document.getElementById("food_type").innerText = food_type;
        let formatted_waste = formatData(data_Object)
        let formatted_buy = formatData(buy_Object["data"])
        let AI_suggestion = await predict(formatted_waste,formatted_buy)
        AI_suggestion_ele.innerText = round(week_buy.reverse()[0]+AI_suggestion["result"])
    } );

    function round(number) {
        return Math.round(number*100)/100
    }

    function color(difference) {
        return difference > 0 ? "green" : (difference < 0 ? "red" : "#888888")
    }

    function calculateSum(list) {
        let sum = 0;
        list.forEach((number)=> {
            sum+=number;
        })
        return round(sum);
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

    window.download_chart = function (img, format) {
        const canva = document.createElement("canvas");
        canva.width = img.naturalWidth
        canva.height = img.naturalHeight;
        const canva_content = canva.getContext("2d");
        const temp_btn = document.createElement("a");
        let url = "";
        canva_content.drawImage(img,0,0);
        url=canva.toDataURL(`image/${format}`);
        temp_btn.href = url;
        temp_btn.download = `chart.${format}`;
        document.body.appendChild(temp_btn)
        temp_btn.click();
        document.body.removeChild(temp_btn)
    }

    function formatData(object) {
        let returnList=[];
        let keys = Object.keys(object);
        keys.forEach((key) => {
            returnList.push([key,object[key]])
        })
        return returnList.reverse()
    }

    async function predict(waste,buy) {
        const encodedWaste = encodeURIComponent(JSON.stringify(waste));
        const encodedBuy = encodeURIComponent(JSON.stringify(buy));
        let response = await fetch(`https://trusted-pony-deadly.ngrok-free.app/predict?waste_data=${encodedWaste}&buy_data=${encodedBuy}&food=Meatball`, {method: "GET",
            headers: {
                'ngrok-skip-browser-warning':"super!!!"
            }
        })
        response = await response.json()
        return response
    }

    //handle jumping and home button
    document.getElementById('homeBtn').onclick = function() {
        window.location.href = '/page_analysis/analysis.html';
    };  
    ["daily","weekly","monthly"].forEach((item) => {
        document.getElementById(`${item}_btn`).onclick = () => {
        window.location.href = `food.html?food=${food_type}#${item}`
    } })
}