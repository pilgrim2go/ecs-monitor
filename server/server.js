const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const MOUNTING_PATH = require('../globalConfig.js').MOUNTING_PATH;

const app = express();
const sub = express();
const env = process.env.NODE_ENV || 'development';
const rootPath = path.normalize(__dirname + '/../build');

let devCredentials;
if (env === 'development') {
    devCredentials = require('../devCredentials.json');
}

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || devCredentials.DEVELOPMENT_AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || devCredentials.DEVELOPMENT_AWS_SECRET_KEY;


const sts = new AWS.STS({
    region: 'eu-west-1',
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

app.use(express.static(rootPath));


sub.post('/authenticate', (req, res) => {
    return sts.getSessionToken().promise().then(res.json.bind(res));
});

sub.get('/ping', (req, res) => {
    res.contentType('text/plain');
    return res.send('PONG');
});

sub.get('*', (req, res) => {
    // send down the homepage from the build directory.
    res.sendFile('index.html', { root: rootPath });
});

app.use(MOUNTING_PATH, sub);

const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log('App listening on port ' + port);
});