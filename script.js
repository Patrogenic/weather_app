document.getElementById("weatherSubmit").addEventListener("click", getWeatherData)
getWeatherData();
function getWeatherData() {
    // event.preventDefault();
    
    const value = document.getElementById("weatherInput").value || 'provo';
    if (value === "")
        return;
    document.getElementById("weatherInput").value = '';
    document.getElementById('city').innerHTML = '';
    document.getElementById('sky-condition').innerHTML = '';
    document.getElementById('temp').innerHTML = '';
    document.getElementById('forecastResults').innerHTML = '';
    document.getElementById('other-info').innerHTML = '';

    const url = "http://api.openweathermap.org/data/2.5/weather?q=" + value + ",US&units=imperial" + "&APPID=WEATHER_API_KEY";
    fetch(url)
        .then(function(response) {
            return response.json();
        }).then(function(json) {
            let cityEl = document.getElementById('city');
            let skyConditionEl = document.getElementById('sky-condition');
            let skyConditionImgEl = document.getElementById('sky-condition-img');
            let tempEl = document.getElementById('temp');

            cityEl.innerHTML = json.name;
            skyConditionEl.innerHTML = json.weather[0].description.split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' '); //capitalizes first letter in each word
            skyConditionImgEl.innerHTML = '<img src="http://openweathermap.org/img/w/' + json.weather[0].icon + '.png"/>';
            tempEl.innerHTML = Math.round(json.main.temp) + '°';

            let otherInfoEl = document.getElementById("other-info");
            let windEl = document.createElement('div');
            let humidityEl = document.createElement('div');
            let feelsLikeEl = document.createElement('div');
            let sunriseEl = document.createElement('div');
            let sunsetEl = document.createElement('div');

            // otherInfoEl =

            windEl.innerHTML = "Wind Speed: " + Math.round(json.wind.speed) + " mph";
            windEl.classList.add('bottom-info');

            humidityEl.innerHTML = "Humidity: " + json.main.humidity + "%";
            humidityEl.classList.add('bottom-info');

            feelsLikeEl.innerHTML = "Feels Like: " + Math.round(json.main.feels_like) + "°";
            feelsLikeEl.classList.add('bottom-info');

            sunriseEl.innerHTML = "Sunrise: " + moment.unix(json.sys.sunrise).format('h:mm a');
            sunriseEl.classList.add('bottom-info');

            sunsetEl.innerHTML = "Sunset: " + moment.unix(json.sys.sunset).format('h:mm a');
            sunsetEl.classList.add('bottom-info');

            //moment.unix(json.list[i].dt).format('dddd, h:mm a'); //'dddd MMMM Do YYYY, h:mm:ss a'

            otherInfoEl.appendChild(sunriseEl);
            otherInfoEl.appendChild(sunsetEl);
            otherInfoEl.appendChild(windEl);
            otherInfoEl.appendChild(humidityEl);
            otherInfoEl.appendChild(feelsLikeEl);
        });
    

        //I could potentially use something like flexbox to display the forecast, we will see
    const url2 = "http://api.openweathermap.org/data/2.5/forecast?q=" + value + ", US&units=imperial" + "&APPID=WEATHER_API_KEY" + "&timezone_offset=-25200";
    fetch(url2)
        .then(function(response) {
            return response.json();
        }).then(function(json) {
            for (let i = 0; i < json.list.length; i++) {
                // json.list[i].dt -= 3600; //should align time zone correctly
            }

            let dayContainer = document.createElement('div');
            dayContainer.id = 0;
            let forecastEl = document.getElementById("forecastResults");
            let idCounter = 1;

            const ALIGN = alignForecast(json);

            let firstDayEl = createDayElement(json, 0, ALIGN, true);
            firstDayEl.addEventListener('click', expandWeather);
            firstDayEl.style.cursor = "pointer";

            var children = firstDayEl.childNodes;
            for (let i = 0; i < children.length; i++) {
                children[i].id = 0;
            }

            forecastEl.appendChild(firstDayEl);



            for (let i=0; i < json.list.length; i++) { //'dddd MMMM Do YYYY, h:mm:ss a'
                let timeEl = document.createElement('span');
                let imgEl = document.createElement('span');
                let tempEl = document.createElement('span');

                timeEl.innerHTML = moment.unix(json.list[i].dt).format('h:mm a');
                timeEl.style.marginLeft = "20px";
                imgEl.innerHTML = '<img src="http://openweathermap.org/img/w/' + json.list[i].weather[0].icon + '.png"/>';
                tempEl.innerHTML = Math.round(json.list[i].main.temp);
                tempEl.style.marginRight = "27px";
                tempEl.style.marginLeft = "-75px";

                timeEl.classList.add('forecast-time');
                imgEl.classList.add('forecast-img');
                tempEl.classList.add('forecast-temp');

                let container = document.createElement('div');
                container.classList.add('forecast-entry-container');
                container.appendChild(timeEl);
                container.appendChild(imgEl);
                container.appendChild(tempEl);
                dayContainer.appendChild(container);

                if((i + 1 + ALIGN) % 8 === 0){
                    dayContainer.classList.add('forecast-day-container');
                    dayContainer.id = idCounter - 1 + "container";
                    forecastEl.appendChild(dayContainer);
                    dayContainer = document.createElement('div');
                    
                    let dayEl = createDayElement(json, i, ALIGN);
                    dayEl.id = idCounter;
                    dayEl.classList.add('.forecast-day-parent');
                    dayEl.addEventListener('click', expandWeather);

                    var children = dayEl.childNodes;
                    for (let i = 0; i < children.length; i++) {
                        children[i].id = idCounter;
                    }

                    dayEl.style.cursor = "pointer";
                    idCounter++;
                    forecastEl.appendChild(dayEl);
                }
            }
            dayContainer.classList.add('forecast-day-container');
            dayContainer.id = idCounter - 1 + "container";
            forecastEl.appendChild(dayContainer);
            dayContainer = document.createElement('div');
            forecastEl.appendChild(dayContainer);


        });
};

function findHighLowTemp(json, j, ALIGN, first){ //j is an iterator
    let highTemp = -200;
    let lowTemp = 200;
    let length = 8;

    if(first){
        length -= ALIGN;
    }
    for (let i = j; i < j + length; i++) {
        if(i < 40){
            if(json.list[i].main.temp < lowTemp){
                lowTemp = json.list[i].main.temp;
            }
            if(json.list[i].main.temp > highTemp){
                highTemp = json.list[i].main.temp;
            }
        }
    }
    return {highTemp, lowTemp};
}

function createDayElement(json, i, ALIGN, first){
    let dayEl = document.createElement('div');
    let dayTimeEl = document.createElement('span');
    let dayImgEl = document.createElement('img');
    let dayTempEl = document.createElement('span');


    dayTimeEl.innerHTML = moment.unix(json.list[first ? i : (ALIGN === 0) ? i + 1: i + ALIGN].dt).format('dddd'); //nesting ternary statements for fun, very bad solution with bad coding
    // dayTimeEl.innerHTML = moment.unix(json.list[i + ALIGN].dt).format('dddd');
    dayImgEl.src ='http://openweathermap.org/img/w/' + json.list[i === 0? 7 - ALIGN : i + 5 < 40 ? i + 5 : 39].weather[0].icon + '.png'; //icon at 3:00pm will represent the day //the first element's icon is 9:00pm

    let temps = findHighLowTemp(json, i, ALIGN, first); //returns an object {highTemp, lowTemp}
    dayTempEl.innerHTML = Math.round(temps.highTemp) + ' &nbsp&nbsp&nbsp' + Math.round(temps.lowTemp);

    dayTimeEl.classList.add('forecast-time');
    dayImgEl.classList.add('forecast-img');
    dayTempEl.classList.add('forecast-temp');

    if(first){
        dayEl.id = 0;
    }
    dayEl.classList.add('forecast-entry-container');
    dayEl.appendChild(dayTimeEl);
    dayEl.appendChild(dayImgEl);
    dayEl.appendChild(dayTempEl);

    return dayEl;
}

function alignForecast(json){
    let day = moment.unix(json.list[0].dt).format('dddd');
    for (let i = 0; i < 8; i++) {
        if(!(day.localeCompare(moment.unix(json.list[i].dt).format('dddd')) === 0)){
            return 8 - i;
        }
    }
    return 0;
}


function expandWeather(event){
    let currEl = event.srcElement;
    let dayContainer = document.getElementById(currEl.id + "container");
    let height = dayContainer.childNodes.length;

    if(dayContainer.style.animationName === "collapse-day" + height || dayContainer.style.animationName === ''){
        dayContainer.style.animationName = "expand-day" + height;
    }else{
        dayContainer.style.animationName = "collapse-day" + height;
    }


    //they will click on the day
    //but a different element unrelated to it will expand
    //count the children to see how big to expand it

}