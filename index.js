const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;

var accRawdata = fs.readFileSync('accounts.json');
var accounts = JSON.parse(accRawdata);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send("CovidCheckin Database Working!")
    console.log("A new client packet recieved.")
    console.log(accounts)
});

app.get('/status', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(accounts)
});

app.post('/register', function(req, res) {
    console.log("A new client packet recieved.")
    const body = req.body;
    const name = body.name;
    const telnum = body.telnum;
    const email = body.email;
    const password = body.password;
    const id = body.id;
    const newUser = {
        "id": id,
        "pw": password,
        "name": name,
        "telnum": telnum,
        "email": email
    };
    accounts.push(newUser);
    fs.writeFile('./accounts.json', JSON.stringify(server), function (err) {
        if (err) {
            console.log('Error has occurred!');
            console.dir(err);
            return;
        }
        console.log('File wrote.'); 
       }
    );
    return res.status(201).json(accounts)
});

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port 3000!")
    console.log(accounts)
});