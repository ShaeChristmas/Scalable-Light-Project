const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3001;
var schema = require(`${__dirname}/models/schema.js`);

const cloudb = mongoose.createConnection('mongodb+srv://testUser:testpass@lights.8ylc4.mongodb.net/Lights?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
var Light = cloudb.model("Light",schema,"Lights");

app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
});
app.post("/", (req, res) => {
    var newLightData = {
        lightID: req.body.lightID,
        value: req.body.value
    }
    console.log(JSON.stringify(newLightData));
    if (newLightData.lightID == "all") {
        cloudb.collection("Lights").updateMany(
            { "lightID": { $ne: " " } },
            { $set: { "value": newLightData.value } },
            function (err, result) {
                if (err) console.log(err);
                client.publish("/Lighting", JSON.stringify(newLightData));
                console.log(result); // Logs result.
            }
        );
    } else {
        Light.findOne({ "lightID": newLightData.lightID }, function (err, result) {
            if (err) throw err;
            if (result == null) {
                var newLight = new Light(
                    {lightID: newLightData.lightID, value: newLightData.value}
                    ).save((err)=> {
                        if (err) throw err;
                });
                client.publish("/Lighting", JSON.stringify(newLightData));
            } else {
                Light.updateOne(
                    { "lightID": newLightData.lightID },
                    { $set: { "value": newLightData.value } },
                    function (err, result) {
                        if (err) console.log(err); // Logs error
                        client.publish("/Lighting", JSON.stringify(newLightData));
                        console.log(result); // Logs result.
                    }
                );
            }
        }
        );
    }
});

app.post("/populate", (req,res)=> {
    cloudb.collection("Lights").find().toArray(function(err, docs){
        res.send(docs);
    });
});

client.on('connect', () => {
    console.log('MQTT Connected');
});
client.subscribe('/Lighting/Connect/1');
client.on('message', (topic, message) => {
    var newLightData = JSON.parse(message);
    const cloudb = mongoose.createConnection('mongodb+srv://testUser:testpass@lights.8ylc4.mongodb.net/Lights?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    cloudb.collection("Lights").findOne({ "lightID": newLightData.lightID }, function (err, result) {
        if (err) throw err;
        if (result == null) {
            cloudb.collection("Lights").insertOne(newLightData);
        } else {
            cloudb.collection("Lights").updateOne(
                { "lightID": newLightData.lightID },
                { $set: { "value": newLightData.value } },
                function (err, result) {
                    if (err) console.log(err); // Logs error
                    console.log(result); // Logs result.
                    cloudb.close();  // Close database.
                }
            );
        }
    });
});
app.get('/test', (req, res) => {
    res.send('test');
});
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
