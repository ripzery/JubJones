const { exec } = require('child_process');
const admin = require("firebase-admin");
const { machineId, machineIdSync } = require('node-machine-id');
const serviceAccount = require("./jubjones-omg-firebase-adminsdk-vqwk5-4353d61f82.json");

async function getMachineId() {
    let id = await machineId();
}

const capture = () => {
    exec('imagesnap -w 1 jones.png', (err, stdout, stderr) => {
        if (err) {
            return
        }

        console.log(`${stdout}`)
        console.log(`${stderr}`)
    })
}


const lockscreen = () => {
    exec('osascript -e \'tell application "Finder" to sleep\'', (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }

        console.log(`${stdout}`)
        console.log(`${stderr}`)
    })
}

function setupFirebase() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://jubjones-omg.firebaseio.com"
    });
}

function listen() {
    let db = admin.database()
    let id = machineIdSync({ original: true })
    console.log(id)
    let userRef = db.ref('/').child(`users/${id}`)
    userRef.on("value", function (snapshot) {
        console.log(snapshot.val());
    }, function (errorObject) {
        console.log('Reading failed : ' + errorObject.code)
    })
    userRef.set({
        sleep: 0,
        capture: 0
    })
}


function main() {
    setupFirebase()
    listen()
}

main()