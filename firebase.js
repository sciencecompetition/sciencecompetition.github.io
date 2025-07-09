// Initialize Firebase (provided by firebase tutorial/documentations)
const app = initializeApp(firebaseConfig);
const db = getDatabase()

function changeData(location,data) {
    let set_ref = ref(db,location);
    set(set_ref,data);
}
async function getData(location) {
    let get_ref = ref(db,location);
    let return_data;
    return_data = await get(get_ref);
    if (return_data.exists()) {
        return {"data":return_data.val(),"Status":true};
    } else {
        return {"Status":false};
    }
} 