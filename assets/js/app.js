
var API_KEY = "fd08e7b93087dced2415887de7b9194c";


$(document).ready(function(){
    // Ukrywanie geolokacji jeśli nie wspierana
    if (!navigator.geolocation){
        $('#geolocation').hide();
    }
    // Pobieranie domyślnego miasta
    var city;
    if (document.location.hash){

        city = document.location.hash.substr(1);
    }
    else {
        // Domyślne miasto
        city = "Berlin";
    }
    // Wyświetlanie bieżącej daty
    date = moment();
    for (var i = 0; i < 3; i++){
        // Wyświetlanie daty
        day = $("#meteo-day-" + (i+1));
        day.find(".name").text(date.format("dddd"));
        day.find(".date").text(date.format("DD/MM"));
        // Przejście do kolejnego dnia
        date = date.add(1, 'days')
    }
    // Ładowanie
    loading = $('#search-loading');
    loading.attr('class', 'loading inload');
    // Pobranie danych
    getMeteoByCity(city, function (data, error) {
        if (error == null) {
            displayMeteo(data);
        }
        else {
            meteoTitle = $('#meteo-title span');
            meteoTitle.html('City <span class="text-muted">' + city + '</span> not found');
        }
        // Zatrzymanie ładowania
        setTimeout(function () {
            loading.attr('class', 'loading')
        }, 500);
    });
});


$("#meteo-form").submit(function (event) {

    loading = $('#search-loading');
    loading.attr('class', 'loading inload');
    var city = event.currentTarget[0].value;
    getMeteoByCity(city, function (data, error){
        if (error == null) {
            displayMeteo(data);
        }
        else {
            meteoTitle = $('#meteo-title span');
            meteoTitle.html('City <span class="text-muted">' + city + '</span> not found');
        }
              setTimeout(function () {
            loading.attr('class', 'loading')
        }, 500);
    });
    return false;
});

$("#geolocation").click(function (event) {
    navigator.geolocation.getCurrentPosition(function (position) {
              loading = $('#search-loading');
        loading.attr('class', 'loading inload');
        //Pobieranie współrzędnych
        var lat = position.coords.latitude
        var lon = position.coords.longitude
        // Aktualizacja pogody
        getMeteoByCoordinates(lat, lon, function (data, error) {
            if (error == null) {
                displayMeteo(data);
            }
            else {
                meteoTitle = $('#meteo-title span');
                meteoTitle.html('Can\'t  get meteo for your position');
            }

            setTimeout(function () {
                loading.attr('class', 'loading')
            }, 500);
        });
    });
});
// Korzystanie z API na podstawie nazwy miasta
function getMeteoByCity(city, callback){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&APPID=" + API_KEY,
        success: function(data){
            callback(data, null);
        },
        error: function(req, status, error){
            callback(null, error);
        }
    });
}
// Korzystanie z API na podstawie koordynatów
function getMeteoByCoordinates(lat, lon, callback){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&APPID=" + API_KEY,
        success: function(data){
            callback(data, null);
        },
        error: function(req, status, error){
            callback(null, error);
        }
    });
}

function displaySunriseSunset(lat, long){
    date = moment();
    for (var i = 0; i < 3; i++) {
        // Pobranie godzin wschodu i zachodu słońca
        var times = SunCalc.getTimes(date, lat, long);
        var sunrise = pad(times.sunrise.getHours(), 2) + ':' + pad(times.sunrise.getMinutes(), 2);
        var sunset = pad(times.sunset.getHours(), 2) + ':' + pad(times.sunset.getMinutes(), 2);
        day = $("#meteo-day-" + (i + 1));
        day.find('.meteo-sunrise .meteo-block-data').text(sunrise);
        day.find('.meteo-sunset .meteo-block-data').text(sunset);
        date = date.add(1, 'days')
    }

}

function displayMeteo(data){
    // Zmiana adresu wyszukiwania miasta
    googleMapCity = "https://www.google.com/maps/place/" + data.city.coord.lat + "," + data.city.coord.lon;
    $('#meteo-title span').html('Weather in <a href="' + googleMapCity + '" class="text-muted meteo-city" target="_blank">' + data.city.name + ', ' + data.city.country + '</a>');

    var tempMark = 0;
    for (var i = 0; i < 3; i++){
        meteo = data.list[i*8];
        day = $("#meteo-day-" + (i + 1));
        icon = day.find(".meteo-temperature .wi");
        temperature = day.find(".meteo-temperature .data");
        humidity = day.find(".meteo-humidity .meteo-block-data");
        wind = day.find(".meteo-wind .meteo-block-data");
        sunrise = day.find(".meteo-sunrise .meteo-block-data");
        sunset = day.find(".meteo-sunset .meteo-block-data");
        code = meteo.weather[0].id;
        icon.attr('class', 'wi wi-owm-' + code);
        temperature.text(toCelsius(meteo.main.temp) + "°C");
        humidity.text(meteo.main.humidity + "%");
        wind.text(meteo.wind.speed + " km/h");
        tempMark += meteo.main.temp;
    }
    displaySunriseSunset(data.city.coord.lat, data.city.coord.lon);
    // Zmiana koloru tła w zależności od temperatury
    tempMark = toCelsius(tempMark / 3);
    var hue1 = 30 + 240 * (30 - tempMark) / 60;
    var hue2 = hue1 + 30;
    rgb1 = 'rgb(' + hslToRgb(hue1 / 360, 0.6, 0.5).join(',') + ')';
    rgb2 = 'rgb(' + hslToRgb(hue2 / 360, 0.6, 0.5).join(',') + ')';
    $('body').css('background', 'linear-gradient(' + rgb1 + ',' + rgb2 + ')');
}
