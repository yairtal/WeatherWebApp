function searchKeyPress(e) {
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
        document.getElementById('btnSearch').click();
        return false;
    }
    return true;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var weatherData = {
    city: document.querySelector("#city"),
    weather: document.querySelector("#weather"),
    temperature: document.querySelector("#temperature"),
    icon: document.querySelector("#weathericon"),
    temperatureValue: 0,
    units: "°C"
};

function switchUnits(){
    if (weatherData.units == "°C"){
        weatherData.temperatureValue = (weatherData.temperatureValue * 9/5 + 32).toFixed(2);
        weatherData.units = "°F";
    }
    else{
        weatherData.temperatureValue = ((weatherData.temperatureValue -  32) * 5/9).toFixed(2);
        weatherData.units = "°C";
    }

    weatherData.temperature.innerHTML = weatherData.temperatureValue + weatherData.units;
}

function getLocationAndWeather(cityInput){
    if (window.XMLHttpRequest){
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            var position = {
                latitude: response.coord.lat,
                longitude: response.coord.lon
            };
            var weatherSimpleDescription = response.weather[0].main;

            var weatherTemperature = response.main.temp;
            var iconUrl = "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
            weatherData.temperatureValue = weatherTemperature;

            loadBackground(position.latitude, position.longitude, weatherSimpleDescription, cityInput);
            var weatherDescription = response.weather[0].description;
            var weatherDescriptionCapital = weatherDescription.capitalizeFirstLetter();
            var cityName = response.name;
            weatherData.city.innerHTML = cityName;
            weatherData.weather.innerHTML =  ", " + weatherDescriptionCapital;
            weatherData.temperature.innerHTML = weatherTemperature + weatherData.units;
            weatherData.icon.src = iconUrl;
        }, true);

        xhr.addEventListener("error", function(err){
            alert("Could not complete the request");
        }, true);

        xhr.open("GET", "http://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=89034ee2a7e65a0adf2152538716bfeb&units=metric", true);
        xhr.send();
    }
    else{
        alert("Unable to fetch the location and weather data.");
    }
}

function loadBackground(lat, lon, weatherTag, cityTag) {
    var script_element = document.createElement('script');

    script_element.src = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=9c2652f9e340c05e5afb67c78c6d0834&lat=" + lat + "&lon=" + lon + "&accuracy=1&tags=" + cityTag + ", " + weatherTag + "&sort=relevance&extras=url_l&format=json";

    document.getElementsByTagName('head')[0].appendChild(script_element);
}

function jsonFlickrApi(data){
    if (data.photos.pages > 0){
        var photo = data.photos.photo[0];
        document.querySelector("body").style.backgroundImage = "url('" + photo.url_l + "')";
        document.querySelector("#image-source").setAttribute("href", "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id);
    }
    else{
        document.querySelector("body").style.backgroundImage = "url('https://fourtonfish.com/tutorials/weather-web-app/images/default.jpg')";
        document.querySelector("#image-source").setAttribute("href", "https://www.flickr.com/photos/superfamous/310185523/sizes/o/");
    }
}

function getLocation(){
    if (window.XMLHttpRequest){
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            getLocationAndWeather(response.country_name);
        }, true);

        xhr.addEventListener("error", function(err){
            alert("Could not complete the request");
        }, true);

        xhr.open("GET", "http://freegeoip.net/json/" + myip, true);
        xhr.send();
    }
    else{
        alert("Unable to fetch the location and weather data.");
    }
}

getLocation();

jQuery(function ()
{
    jQuery("#f_elem_city").autocomplete({
        source: function (request, response) {
            jQuery.getJSON(
                "http://gd.geobytes.com/AutoCompleteCity?callback=?&template=<geobytes%20city>,%20<geobytes%20country>&q="+request.term,
                function (data) {
                    response(data);
                    console.log(data.geobytescity);
                }
            );
        },
        minLength: 3,
        select: function (event, ui) {
            var selectedObj = ui.item;
            jQuery("#f_elem_city").val(selectedObj.value);
            getLocationAndWeather(selectedObj.value);
            return false;
        },
        open: function () {
            jQuery(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function () {
            jQuery(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });
    jQuery("#f_elem_city").autocomplete("option", "delay", 100);
});
