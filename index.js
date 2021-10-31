const express = require('express');
const fs = require('fs');

const jsonQuery = require('json-query')
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
    checkLog = JSON.parse(checkinRawdata);
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
        console.log(str);

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
        console.log(upperOrLower[index]);
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
    console.log
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
    console.log(typeof user.pw);
    console.log(user.pw);
    console.log(typeof req.params.password);
    console.log(encryptHash(req.params.password, 5));
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
    console.log(telnum)
    filteredData = jsonQuery('email=' + email + '', {
        data: accounts
    })

    console.log(filteredData)
    console.log(filteredData.value)

    if (filteredData.value != []) {
        return res.status(409)
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
    var isRightCode = false;

    filteredPlaceData = jsonQuery('checkinLists[place=' + place + ']', {
        data: data
    })

    while (!isRightCode) {
        filteredCodeData = jsonQuery('checkinLists[code=' + code + ']', {
            data: checkinLists
        })

        if (filteredCodeData != null) {
            code = generateRandomString(8)
            continue
        } else isRightCode = true;
    }

    if (filteredPlaceData != null) {
        return res.status(409)
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
        "code": id,
        "time": time,
        "isCheckedOut" : true
    }

    console.log(JSON.stringify(checkinLog))
    
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

app.post('/checkout/:place/:id/:time/', function (req, res) {
    console.log("A new client packet recieved.")
    console.log(req.params)
    const place = req.params.place
    const id = req.params.id
    const time = req.params.time

    console.log(place)
    console.log(id)

    const newLog = {
        "place": place,
        "code": id,
        "time": time,
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
    return res.status(200).json(checkinLog)
});

app.get('/query/:days/:place', (req, res) => {
    console.log("A new client packet recieved.")
    let user = accounts.filter(user => user.email == req.params.email)[0];
    if (!user){
        return res.status(404).json({err: "Unknown user"});
    }
    console.log(typeof user.pw);
    console.log(user.pw);
    console.log(typeof req.params.password);
    console.log(encryptHash(req.params.password, 5));
    if (Object.is(user.pw, encryptHash(req.params.password, 5))) {
        return res.status(200).json(user);
    } else return res.status(400).json({err: "Invalid password"});
});

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port " + PORT)
    console.log(accounts)
    console.log(checkinLists)
    console.log(checkLog)
});
