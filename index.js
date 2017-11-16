const { exec } = require('child_process');
const admin = require("firebase-admin");
const { machineId, machineIdSync } = require('node-machine-id');
const serviceAccount = require("./jubjones-omg-firebase-adminsdk-vqwk5-4353d61f82.json");
let sleep = 0
let capture = 0

async function getMachineId() {
    let id = await machineId();
}

const takePic = () => {
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

    userRef.set({
        sleep: 0,
        capture: 0
    })

    userRef.on("value", function (snapshot) {
        let sSleep = snapshot.val().sleep
        let sCapture = snapshot.val().capture
        if (sSleep > sleep) {
            lockscreen()
            sleep = sSleep
        }
        if (sCapture > capture) {
            takePic()
            capture = sCapture
        }
        console.log(snapshot.val());
    }, function (errorObject) {
        console.log('Reading failed : ' + errorObject.code)
    })
}


function main() {
    setupFirebase()
    listen()
}

main()