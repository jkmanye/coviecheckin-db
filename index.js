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
var checkinLists = JSON.parse(accRawdata);

function reloadAccount() {
    accRawdata = fs.readFileSync('accounts.json');
    accounts = JSON.parse(accRawdata);
}

function reloadCheckinLists() {
    checkinRawdata = fs.readFileSync('codes.json');
    checkinLists = JSON.parse(checkinRawdata);
}

function generateRandomString (num) {
    let result1 = Math.random().toString(36).substring(0, num);
    return result1;
}

function encryptHash(s, n) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    let answer = '';
    var isNumber = new Boolean(false);

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
        return res.json(user);
    } else return res.status(400).json({err: "Invalid password"});
});

app.post('/register/:email/:password/:name/:telnum', function(req, res) {
    console.log("A new client packet recieved.")
    console.log(req.body)
    const email = req.params.email
    console.log(email)
    const password = req.params.password
    console.log(password)
    const name = req.params.name;
    console.log(name)
    const telnum = req.params.telnum
    console.log(telnum)
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
            return
        }
        console.log('File wrote.')
        reloadAccount()
       }
    )
    return res.status(201).json(accounts)
});

app.post('/addCode/:place/', function (req, res) {
    console.log("A new client packet recieved.")
    console.log(req.body)
    const place = req.params.place
    console.log(place)
    const code = generateRandomString(8);
    const newUser = {
        "place": place,
        "code": code
    }
    console.log(JSON.stringify(newUser))
    accounts.push(newUser)
    fs.writeFile('./codes.json', JSON.stringify(checkinLists), function (err) {
        if (err) {
            console.log('Error has occurred!')
            console.dir(err)
            return
        }

        console.log('File wrote.')
        reloadCheckinLists()
    }
    )
    return res.status(201).json(checkinLists)
});

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port 3000!")
    console.log(accounts)
    console.log(checkinLists)
});
