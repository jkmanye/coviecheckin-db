const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;

var rawdata = fs.readFileSync('server.json');
var server = JSON.parse(rawdata);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send("CovidCheckin Database Working!")
    console.log("A new client packet recieved.")
    console.log(server)
});

app.get('/status', (req, res) => {
    console.log("A new client packet recieved.")
    return res.json(server)
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
        id: id,
        pw: password,
        name: name,
        telnum: telnum,
        email: email
    };
    server.push(newUser);
    fs.writeFile('./server.json', JSON.stringify(server), function (err) {
        if (err) {
            console.log('Error has occurred!');
            console.dir(err);
            return;
        }
        console.log('File wrote.'); 
       }
    );
});

app.listen(PORT, () => {
    console.log("CovidCheckin DB is running in port 3000!")
    console.log(server)
});