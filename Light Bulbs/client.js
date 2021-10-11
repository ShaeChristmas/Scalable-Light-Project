const http = require('http');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const lightID = "2";

var data = {
    lightID: lightID,
    value: false
};

client.on('connect', () => {
    console.log("Connected\n");
    topic = "/Lighting/Connect/"+Math.ceil(Math.random()*3);
    console.log(topic);
    client.publish(topic,JSON.stringify(data));
});

client.subscribe(`/Lighting`);

function set(state) {
    data.value = state;
}

client.on('message', (topic, message)=> {
    if (topic != "/Lighting/Connect/#") {
        var newData = JSON.parse(message);
        if ((newData.lightID == data.lightID)||(newData.lightID == "all")) {
            if(data.value == "toggle") {
                data.value = !(data.value);
            } else {
                data.value = newData.value;
            }
        }
    }
});

setInterval(() => {
    if(data.value) {
        console.log("on");
    } else {
        console.log("off");
    }
}, 5000);