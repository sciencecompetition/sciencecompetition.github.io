import { getDataList } from "/firebase.js"

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

const textbox = document.getElementById("user_inputbox");
const submit_btn = document.getElementById("sendButton");
const chatbox_parent = document.querySelector(".chatbox_parent");
const home_btn = document.getElementById("homeBtn");
const checkbox = document.getElementById("include_data_checkbox");
const deepseek_url = "https://router.huggingface.co/fireworks-ai/inference/v1/chat/completions";
const authtoken = "deepseek_authtoken" // for injection in the YAML, make the comment super long for easy identification
const raw_date = new Date("2025-6-27");
const month_before_raw = new Date(raw_date);
month_before_raw.setDate(raw_date.getDate() - 29);
const full_date = stringifyDate(raw_date);
const month_before = stringifyDate(month_before_raw);
const key_list = ["Chilli","Corn","Meatball","Chilli_buy","Corn_buy","Meatball_buy"];
textbox.style.width = (window.innerWidth - 56) + "px";
chatbox_parent.style.height = (window.innerHeight - 263) + "px";

console.log(authtoken)

window.addEventListener("resize",() => {
    textbox.style.width = (window.innerWidth - 56) + "px";
})

home_btn.addEventListener('click', () => {
    window.location.href = '/page_analysis/analysis.html';
})

function addChatbox(user, message) {
    /*example div
    <div class="chatbox">
            <img src="/image_sources/deepseek-logo-02.png" alt="" class="deepseekimg">
            <span class="message">Hello, I am deepseek. You can ask me questions about food waste, and you can choose to send your food waste data to me by clicking the checkbox above the input box.</span>
        </div>
    */

   console.log(`the message is: ${message}`)
    const chatbox_ele = document.createElement('div');
    chatbox_ele.className = "chatbox";
    chatbox_ele.style.justifyContent = user=="deepseek" ? "left" : "right";
    chatbox_ele.style.alignItems = user=="deepseek" ? "left" : "right";
    
    const user_img_ele = document.createElement('img');
    user_img_ele.className = "userimg";
    user_img_ele.src = user=="deepseek" ? "/image_sources/deepseek-logo-02.png" : "/image_sources/user_icon.png";
    user_img_ele.alt = user=="deepseek" ? "deepseek_icon" : "user_icon";

    const message_ele = document.createElement('span');
    message_ele.className = user=="deepseek" ? "message" : "message_user";
    message_ele.innerHTML = message;
    message_ele.style.backgroundColor = user=="deepseek" ? "#D5D5D5" : "transparent"

    const append_list = user=="deepseek" ? [user_img_ele,message_ele] : [message_ele,user_img_ele]
    append_list.forEach((item) => {
        chatbox_ele.appendChild(item);
    })

    const chatbox_parent_ele = document.querySelector(".chatbox_parent");
    chatbox_parent_ele.appendChild(chatbox_ele);
}

async function sendMessage(message,data) {
    const ask_message = `${message}${data["include"] ? "\nrefer to data:\n" : ""}${data["data"]}`
    const payload = {
        "messages":[{
            "role":"user",
            "content":ask_message
        }],
        "model":"accounts/fireworks/models/deepseek-v3"
    }
    try {
        const response = await fetch(deepseek_url,{
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
                'Authorization': authtoken
            },
            body: JSON.stringify(payload)
        })
        if (!response.ok) {
            throw new Error(`There's an error unfortunately. Error code ${response.status}, ${response.statusText}`)
        }
        const response_json = await response.json()
        console.log(response_json)
        return {"response":response_json,"success":true};
    } catch(error) {
        console.log(error);
        return {"response":error,"success":false};
    }
}

submit_btn.addEventListener('click', async () => {
    console.log("hi");
    const message = convertMarkdown(textbox.value);
    addChatbox("user",message);
    const data = {};
    if (checkbox.checked) {
        data["include"] = true;
        data["data"] = loadData();
    } else {
        data["include"] = false;
        data["data"] = "";
    }
    let response  = await sendMessage(textbox.value,data);
    response = response["success"] ? response["response"]["choices"][0]["message"]["content"] : response["response"];
    addChatbox("deepseek",convertMarkdown(response));
    
    textbox.value = "";
})

function convertMarkdown(text) {
    let temporary_ele = document.createElement("div");
    let skipped_line = text.replace("\\n","<br>");
    skipped_line = skipped_line.replace(/#/g,""); //clear the para markdown stuff, which is the #
    console.log(skipped_line)
    temporary_ele.innerHTML = marked.parse(skipped_line);
    const return_thing = temporary_ele.firstChild.innerHTML
    return return_thing;
}

async function loadData() {
    const upload_data = {};
    
    await Promise.all(key_list.map(async (key_name) => {
        const data_list = await getDataList(key_name, month_before, full_date);
        let data_object = {};
        let currentDate = new Date(month_before_raw); // Start from the initial date
        
        console.log(`length of the data list is:`)
        console.log(data_list.length);

        data_list.forEach((data) => {
            // Create a new date string for each entry
            data_object[stringifyDate(new Date(currentDate))] = data;
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
            console.log(currentDate);
        });
        
        upload_data[key_name] = data_object;
    }));
    
    return upload_data;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//just for testing

/*console.log(`loading data:`);
const placeholder = await loadData();
console.log(placeholder);*/