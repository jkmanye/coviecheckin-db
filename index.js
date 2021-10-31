const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var accRawdata = fs.readFileSync('accounts.json');
var accounts = JSON.parse(accRawdata);

var checkinRawdata = fs.readFileSync('codes.json');
var checkinLists = JSON.parse(checkinRawdata);

var checkLogRawdata = fs.readFileSync('checkinlists.json');
var checkLog = JSON.parse(checkLogRawdata);

function reloadAccount() {
    accRawdata = fs.readFileSync('accounts.json');
    accounts = JSON.parse(accRawdata);
}

function reloadCheckinLists() {
    checkinRawdata = fs.readFileSync('codes.json');
    checkinLists = JSON.parse(checkinRawdata);
}

function reloadCheckinLog() {
    checkLogRawdata = fs.readFileSync('checkinlists.json');
    checkLog = JSON.parse(checkLogRawdata);
}

function generateRandomString (num) {
    let result1 = Math.random().toString(36).substring(0, num);
    return result1;
}

function encryptHash(s, n) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    let answer = '';

    for (let i = 0; i < s.length; i++) {
        const str = s[i];

        if (!isNaN(str)) {
            answer += String(Number(str) + 5);
            continue;
        } else if (str == ' ') {
            answer += ' ';
            continue;
        }

        const upperOrLower = upper.includes(str) ? upper : lower;
        let index = upperOrLower.indexOf(str) + n;
        if (index >= upperOrLower.length) {
            index -= upperOrLower.length;
        }
        answer += upperOrLower[index];
    }

    return answer;
}

app.get('/', (req, res) => {
    res.send("CovidCheckin Database Working!")
    console.log("A new client packet recieved.")
    reloadAccount()
    reloadCheckinLists()
    console.log(accounts)
});

app.get('/accStatus', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(accounts)
});

app.get('/codeStatus', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(checkinLists)
});

app.get('/checkinStatus', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(checkLog)
});

app.get('/login/:email/:password', (req, res) => {
    console.log("A new client packet recieved.")
    let user = accounts.filter(user => user.email == req.params.email)[0];
    if (!user){
        return res.status(404).json({err: "Unknown user"});
    }
    if (Object.is(user.pw, encryptHash(req.params.password, 5))) {
        return res.status(200).json(user);
    } else return res.status(400).json({err: "Invalid password"});
});

app.post('/register/:email/:password/:name/:telnum', function(req, res) {
    console.log("A new client packet recieved.")
    const email = req.params.email
    console.log(email)
    const password = req.params.password
    console.log(password)
    const name = req.params.name;
    console.log(name)
    const telnum = req.params.telnum
    console.log(telnum);

    for (let i = 0; i < accounts.length; i += 1) {
        console.log(accounts[i])
        console.log(accounts[i].email)
        if (Object.is(accounts[i].email, email)) {
            return res.status(409).json({err: "Duplicate email"})
        } else continue
    }

    const newUser = {
        "email": email,
        "pw": encryptHash(password, 5),
        "name": name,
        "telnum": telnum
    }
    console.log(JSON.stringify(newUser))
    accounts.push(newUser)
    fs.writeFile('./accounts.json', JSON.stringify(accounts), function (err) {
        if (err) {
            console.log('Error has occurred!')
            console.dir(err)
            return res.status(500)
        }
        console.log('File wrote.')
        reloadAccount()
       }
    )
    return res.status(200).json(newUser)
});

app.post('/addCode/:place/', function (req, res) {
    console.log("A new client packet recieved.")
    console.log(req.body)
    const place = req.params.place
    console.log(place)
    var code = generateRandomString(8);

    for (let i = 0; i < checkinLists.length; i += 1) {
        console.log(checkinLists[i])
        console.log(checkinLists[i].place)
        console.log(checkinLists[i].code)
        if (Object.is(checkinLists[i].place, place)) {
            return res.status(409).json({err: "Duplicate place"})
        }

        if (Object.is(checkinLists[i].code, code)) {
            code = generateRandomString(8)
            continue
        }
    }

    const newPlace = {
        "place": place,
        "code": code
    }

    console.log(JSON.stringify(newPlace))
    checkinLists.push(newPlace)
    fs.writeFile('./codes.json', JSON.stringify(checkinLists), function (err) {
        if (err) {
            console.log('Error has occurred!')
            console.dir(err)
            return res.status(500)
        }

        console.log('File wrote.')
        reloadCheckinLists()
    })
    return res.status(200).json(newPlace)
});

app.post('/checkin/:place/:id/:time/', function (req, res) {
    console.log("A new client packet recieved.")
    console.log(req.params)

    const place = req.params.place
    const id = req.params.id
    const time = req.params.time

    console.log(place)
    console.log(id)
    console.log(time)

    const checkinLog = {
        "place": place,
        "id": id,
        "checkinTime": time,
        "checkoutTime": "",
        "isCheckedOut": false
    }

    console.log(checkinLog)
    
    checkLog.push(checkinLog)
    fs.writeFile('./checkinlists.json', JSON.stringify(checkLog), function (err) {
        if (err) {
            console.log('Error has occurred!')
            console.dir(err)
            return
        }

        console.log('File wrote.')
        reloadCheckinLog()
    })
    return res.status(200).json(checkinLog)
});

app.post('/checkout/:place/:id/:time/:curtime', function (req, res) {
    console.log("A new client packet recieved.")
    console.log(req.params)
    const place = req.params.place
    const id = req.params.id
    const time = req.params.time
    const curtime = req.params.curtime
    var changingJson;

    for (let i = 0; i < checkLog.length; i += 1) {
        console.log(checkLog[i])
        console.log(checkLog[i].place)
        console.log(checkLog[i].id)
        console.log(checkLog[i].checkinTime)
        console.log(checkLog[i].checkoutTime)
        console.log(checkLog[i].isCheckedOut)
        console.log(typeof time)
        console.log(typeof checkLog[i].checkinTime)
        console.log(Object.is(checkLog[i].checkinTime, time))
        if (!checkLog[i].isCheckedOut && Object.is(checkLog[i].id, id) && Object.is(checkLog[i].place, place) && Object.is(checkLog[i].checkinTime, time)) {
            changingJson = checkLog[i]
            checkLog.splice(i, 1)
        } else continue
    }

    console.log(place)
    console.log(id)
    console.log(changingJson)

    const newLog = {
        "place": place,
        "id": id,
        "checkintime": time,
        "checkouttime": curtime,
        "isCheckedOut" : true
    }

    console.log(JSON.stringify(newLog))
    checkLog.push(newLog)
    fs.writeFile('./checkinlists.json', JSON.stringify(checkLog), function (err) {
        if (err) {
            console.log('Error has occurred!')
            console.dir(err)
            return res.status(500)
        }

        console.log('File wrote.')
        reloadCheckinLog()
    })
    return res.status(200).json(newLog)
});

app.get('/query/:condition/:var1/:var2', (req, res) => {
    console.log("A new client packet recieved.")
    const condition = req.params.condition;
    const var1 = req.params.var1;
    const var2 = req.params.var2;
    var returnJson = [];

    if (Object.is(condition, "traceback")) {
        //usage: var1=time, var2=place
        for (let i = 0; i < checkLog.length; i += 1) {
            console.log(checkLog[i])
            console.log(checkLog[i].checkinTime)
            console.log(checkLog[i].checkoutTime)
            console.log(checkLog[i].id)
            console.log(checkLog[i].place)
            if (checkLog[i].checkinTime.startsWith(var1) && Object.is(checkLog[i].place, var2)) {
                returnJson.push(checkLog[i])
            }
        }

        return res.status(200).json(returnJson)
    } else if (Object.is(condition, "checkoutquery")) {
        //usage: var1=id
        for (let i = 0; i < checkLog.length; i += 1) {
            console.log(checkLog[i])
            console.log(checkLog[i].checkinTime)
            console.log(checkLog[i].checkoutTime)
            console.log(checkLog[i].id)
            console.log(checkLog[i].place)
            if (Object.is(checkLog[i].id, var1)) {
                returnJson.push(checkLog[i])
            }
        }

        return res.status(200).json(returnJson)
    } else return res.status(400)
});

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port " + PORT)
    console.log(accounts)
    console.log(checkinLists)
    console.log(checkLog)
});
