import './App.css';
//import Select from 'react-select'
import React from 'react';
import 'request';
import Select from 'react-select';

var request = require('request');
var array = [];
var options = [];
var state = [0,0];

function sendReq() {
  var clientServerOptions = {
    uri: 'http://Project-Middleware-1666426067.us-east-1.elb.amazonaws.com:3001/populate',
    body: JSON.stringify({}),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  request(clientServerOptions, (err, response)=> {
    if (err) throw err;
    array = JSON.parse(response.body);
    //console.log(JSON.stringify(array));
    options.length = 0;
    array.forEach((element,i) => {
      if (element.lightID) {
        options.push({label:element.lightID,value:[element.lightID,element.value]});
        document.getElementsByName("selection").options = {options};
      }
    });
  });
}

function changeState(postData) {
  console.log(postData);
  var clientServerOptions = {
    uri: 'http://Project-Middleware-1666426067.us-east-1.elb.amazonaws.com:3001/',
    body: JSON.stringify(postData),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  request(clientServerOptions, (err, response)=> {
    if (err) throw err;
  });
}
function addValue() {
  if(state[0] !== 0) {
    if(state[1] === true) {
      state[1] = false;
      document.getElementById('state').innerHTML = "Light is Off!";  
    } else {
      state[1] = true;
      document.getElementById('state').innerHTML = "Light is On!";  
    }

    changeState({lightID: state[0], value:(state[1])});
    sendReq();
  }
}

var onChangeFunction = (event) => {
  console.log(event.value);
  state = event.value;
  sendReq();
  if(state[1] === true) {
    document.getElementById('state').innerHTML = "Light is On!";  
  } else {
    document.getElementById('state').innerHTML = "Light is Off!";  
  }
}

var setValueOff = (event) => {
  changeState({lightID: "all", value:false});
  state[1] = false;
  document.getElementById('state').innerHTML = "Light is Off!";
  sendReq();
}

var setValueOn = (event) => {
  changeState({lightID: "all", value:true});
  state[1] = true;
  document.getElementById('state').innerHTML = "Light is On!";
  sendReq();
}

function App() {
  React.useEffect(() => {
    sendReq();
  },[])

  return (
    <div className="App">
      <form>
      <h1 onLoad = {sendReq}>Lighting Web App</h1>
      <Select name ="selection" options={options} onChange={onChangeFunction}/>
      <h5>Light State</h5>
      <p id="state">No Light Selected</p>
      <button type="button" onClick={addValue}>Toggle Light</button>
      <button type="button" onClick={setValueOff}>Turn all Lights Off</button>
      <button type="button" onClick={setValueOn}>Turn all Lights On</button>
      </form>
    </div>
  );
}

export default App;
