// showTheLocalWeather.js compares the users weather to Ryan's and displays who is warmer
// the users location is automatically detected and locations, weather and times are displayed
// this is compared to Ryan's weather (location set manually).

// fetch.js is used for obtaining JSON objects, the below polyfill is included:
// https://cdnjs.cloudflare.com/ajax/libs/fetch/1.0.0/fetch.js

// resetElements() is used to hide the appropriate elements for better UX
function resetElements() {
  document.getElementById('resultSuccess').style.display = 'none';
  document.getElementById('resultNotSuccess').style.display = 'none';
  document.getElementById('resultError').style.display = 'none';
  document.getElementById('findOutButton').style.display = 'inline-block';
  document.getElementById('tempUnits').innerHTML = 'C';
  document.getElementById('weather').classList.add('hide');
}

// errorReceived() resets the page if an error is occurred and logs the error
function errorReceived(error) {
  console.log('parsing failed', error);
  resetElements();
  document.getElementById('resultError').style.display = 'inline-block';
}

// getMyLocation() detects and returns the users location based on their IP address
function getMyLocation() {
  var location = {};
  location.ipCoordinates = [];
  // fetch location JSON from IP address API
  return fetch('https://ip-api.com/json')
  .then(function connectToJSON(response) {
    if (response.status >= 200 && response.status < 400) {
      return response.json();
    }
    else {
      console.log(response.status);
      return false;
    }
  }).then(function getLocation(json) {
    location.ipCoordinates[0] = json.lat;
    location.ipCoordinates[1] = json.lon;
    location.country = json.country;
    location.city = json.city;
    // return coordinates and country/city
    return location;
  }).catch(function (err) {
    errorReceived(err);
    console.log('getMyLocation() failed');
    return false;
  });
}

// getTime() displays the local time for given coordinates and html Object (Either user or Ryan)
function getTime(coordinates, htmlDate) {
  // fetch JSON from time API using given coordinates
  var url = 'https://api.timezonedb.com/?key=HZSGGW75YGJL&format=json&lat=' + coordinates[0] + '&lng=' + coordinates[1];
  fetch(url)
  .then(function connectToJSON(response) {
    if (response.status >= 200 && response.status < 400) {
      return response.json();
    }
    else {
      console.log(response.status);
      return false;
    }
  }).then(function getUnixTime(json) {
    var timestamp = json.timestamp;
    // set given html object to the local time
    document.getElementById(htmlDate).innerHTML = 'Local Time: ' +
      new Date((timestamp) * 1000).toISOString().slice(11, 16);
    return false;
  }).catch(function (err) {
    errorReceived(err);
    console.log('getTime() failed');
    return false;
  });
}

// getWeather() returns the weather for given coordinates
function getWeather(coordinates) {
  var weatherHere = {};
  // fetch JSON from weather API using given coordinates
  var url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + coordinates[0] +
    '&lon=' + coordinates[1] + '&APPID=ad8c09618252495484dcf62dc4e4a801';
  return fetch(url)
  .then(function connectToJSON(response) {
    if (response.status >= 200 && response.status < 400) {
      return response.json();
    }
    else {
      console.log(response.status);
      return false;
    }
  }).then(function getThisWeather(json) {
    // return key weather data
    weatherHere.head = json.weather[0];
    weatherHere.icon = weatherHere.head.icon;
    weatherHere.temp = json.main;
    return weatherHere;
  }).catch(function (err) {
    errorReceived(err);
    console.log('getWeather() failed');
    return false;
  });
}

// calculateRyanWeather() displays Ryan's weather and time data
function calculateRyanWeather() {
  // ########################################################
  // manually define where Ryan is
  const ryanCoordinates = [32.2942, -64.7839];
  document.getElementById('ryanLocation').innerHTML = 'Hamilton, Bermuda';
  // ########################################################
  // calculate Ryan local time
  getTime(ryanCoordinates, 'ryanDate');
  // display Ryan weather data and return the temperature (in Celsius)
  return getWeather(ryanCoordinates).then(function (ryanWeather) {
    var ryanCelsiusTemperature = Math.round((ryanWeather.temp.temp - 273.15) * 100) / 100;
    document.getElementById('ryanWeatherTemp').innerHTML = ryanCelsiusTemperature;
    document.getElementById('ryanWeatherImg').src = 'https://openweathermap.org/img/w/' + ryanWeather.icon + '.png';
    document.getElementById('ryanDescription').innerHTML = ryanWeather.head.description.charAt(0).toUpperCase() +
      ryanWeather.head.description.slice(1);
    return ryanCelsiusTemperature;
  }).catch(function (err) {
    errorReceived(err);
    console.log('getWeather() for Ryan failed');
    return false;
  });
}

// calculateMyWeather() displays user's weather and time data
function calculateMyWeather() {
  // detect users location, then display weather data and return temperature (celsius)
  return getMyLocation().then(function (myLocation) {
    getTime(myLocation.ipCoordinates, 'myDate');
    document.getElementById('myLocation').innerHTML = myLocation.city + ', ' + myLocation.country;
    return getWeather(myLocation.ipCoordinates).then(function (myWeather) {
      var myCelsiusTemp = Math.round((myWeather.temp.temp - 273.15) * 100) / 100;
      document.getElementById('myWeatherTemp').innerHTML = myCelsiusTemp;
      document.getElementById('myWeatherImg').src = 'https://openweathermap.org/img/w/' + myWeather.icon + '.png';
      document.getElementById('myDescription').innerHTML = myWeather.head.description.charAt(0).toUpperCase() +
        myWeather.head.description.slice(1);
      return myCelsiusTemp;
    }).catch(function (err) {
      errorReceived(err);
      console.log('getWeather() for me failed');
      return false;
    });
  }).catch(function (err) {
    errorReceived(err);
    console.log('getMyLocation() failed');
    return false;
  });
 // return false;
}

// findOut() calculates users and Ryans weather and compares the temperatures
// then displays who is warmer
function findOut() {
  // CSS
  resetElements();
  document.getElementById('findOutButton').style.display = 'none';
  document.getElementById('myWeatherTemp').innerHTML = 'loading';
  document.getElementById('ryanWeatherTemp').innerHTML = 'loading';

  // wait until both weathers have calculated
  Promise.all([calculateRyanWeather(), calculateMyWeather()])
  .then(function (celsiusTemps) {
    // display weather data (now that it has loaded)
    document.getElementById('weather').classList.remove('hide');
    // compare temperatures and display who is warmer
    if (celsiusTemps[1] > celsiusTemps[0]) {
      document.getElementById('resultSuccess').style.display = 'block';
    } else if (celsiusTemps[1] <= celsiusTemps[0]) {
      document.getElementById('resultNotSuccess').style.display = 'block';
    }
  })
  .catch(function (err) {
    errorReceived(err);
    console.log('Promise.all() failed');
    return false;
  });
}

// changeUnits() toggles displayed temperature between Fahrenheit and Celsius
function changeUnits() {
  // store initial values globally so can revert on later calls
  if (!window.myWeatherCels || !window.ryanWeatherCels) {
    window.myWeatherCels = document.getElementById('myWeatherTemp').innerHTML;
    window.ryanWeatherCels = document.getElementById('ryanWeatherTemp').innerHTML;
  }

  // if currently Celsius, convert to Fahrenheit, otherwise revert to initial values (Celsius)
  if (document.getElementById('tempUnits').innerHTML === 'C') {
    var myWeatherFahr = (window.myWeatherCels * 1.8) + 32;
    document.getElementById('myWeatherTemp').innerHTML = Math.floor(myWeatherFahr * 100) / 100;
    var ryanWeatherFahr = (window.ryanWeatherCels * 1.8) + 32;
    document.getElementById('ryanWeatherTemp').innerHTML = Math.floor(ryanWeatherFahr * 100) / 100;
    document.getElementById('tempUnits').innerHTML = 'F';
  } else {
    document.getElementById('myWeatherTemp').innerHTML = window.myWeatherCels;
    document.getElementById('ryanWeatherTemp').innerHTML = window.ryanWeatherCels;
    document.getElementById('tempUnits').innerHTML = 'C';
  }
  return false;
}

// once page has loaded, enable findOut() button and changeUnits() hyperlink
document.addEventListener('DOMContentLoaded', function pageReady() {
  const findOutButton = document.getElementById('findOutButton');
  findOutButton.onclick = findOut;
  const unitsShown = document.getElementById('tempUnits');
  unitsShown.onclick = changeUnits;
});
