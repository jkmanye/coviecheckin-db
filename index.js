const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var accRawdata = fs.readFileSync('accounts.json');
var accounts = JSON.parse(accRawdata);

function reloadAccount() {
    accRawdata = fs.readFileSync('accounts.json');
    accounts = JSON.parse(accRawdata);
}

app.get('/', (req, res) => {
    res.send("CovidCheckin Database Working!")
    console.log("A new client packet recieved.")
    reloadAccount()
    console.log(accounts)
});

app.get('/status', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(accounts)
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
    console.log(req.params.password);
    if (user.password === req.params.password) {
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
        "pw": password,
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

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port 3000!")
    console.log(accounts)
});
