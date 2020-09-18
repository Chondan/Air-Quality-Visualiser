(() => {
    function dropDownHint(input, dropDown) {
        const dropDownArray = Array.from(dropDown.querySelectorAll("li"));
        input.addEventListener('input', () => {
            dropDownArray.forEach(ls => {
                // add condition here to make a hint 
                if(ls.innerHTML.indexOf(input.value, 0) == -1) {
                    ls.style.display = "none";
                } else {
                    ls.style.display = "block";
                }
            });
        });
    }
    function getStateID(stateName) {
        let id;
        statesJson.forEach(state => {
            if (state.name == stateName) {
                id = state.id;
            }
        });
        return id;
    }
    function getCityListOfState(stateID) {
        const cityList = [];
        citiesJson.forEach(city => {
            if (city.state_id == stateID) {
                cityList.push(city.name);
            }
        });
        return cityList;
    }
    function getStateListOfCountry(countryID) {
        const stateList = [];
        statesJson.forEach(state => {
            if (state.country_id == countryID) {
                stateList.push(state.name);
            }
        });
        return stateList;
    }
    function getCountryID(countryName) {
        let id;
        countriesJson.forEach(country => {
            if (country.name == countryName) {
                id = country.id;
            }
        });
        return id;
    }
    function getJsonData(jsonFilePath) {
        const response = fetch(jsonFilePath);
        const data = response.then((res) => res.json());
        return data;
    }
    function getDataList(jsonObj) {
        const arr = [];
        jsonObj.forEach(val => {
            arr.push(val.name);
        });
        return arr;
    }
    async function setup() {
        // countriesJson = await getJsonData('./json/countries.json');
        // statesJson = await getJsonData('./json/states.json');
        // citiesJson = await getJsonData('./json/cities.txt'); 
        const countryRes = await fetch("https://raw.githubusercontent.com/Chondan/Air-Quality-Visualiser/master/json/countries.json");
        countriesJson = await countryRes.json();
        const stateRes = await fetch("https://raw.githubusercontent.com/Chondan/Air-Quality-Visualiser/master/json/states.json");
        statesJson = await stateRes.json();
        const cityRes = await fetch("https://raw.githubusercontent.com/Chondan/Air-Quality-Visualiser/master/json/cities.txt");
        citiesJson = await cityRes.json();
    }
    function loadDataToDropDown(className, dataList) {
        // load data to dropdown
        const dropDownList = document.querySelector(`div.${className} div.dropdown ul`);
        dropDownList.innerHTML = "";
        dataList.forEach(data => {
            const list = document.createElement('li');
            list.innerHTML = data;
            dropDownList.appendChild(list);
        });
        return dropDownList.querySelectorAll('li');
    }
    function dropDownHandle(className) {
        const input = document.querySelector(`div.${className} input`);
        const dropDown = document.querySelector(`div.${className} div.dropdown`);
        let dropDownList;
        input.addEventListener('input', () => {
            if (className == "country") {
                countryInput = input.value;
            } else if (className == "state") {
                stateInput = input.value
            } else {
                cityInput = input.value;
            }
        })
        input.addEventListener('click', () => {
            card.style.opacity = 0;
            isShown = false;
            if (className == "country") {
                dropDownList = Array.from(loadDataToDropDown("country", getDataList(countriesJson)));
                dropDownHint(countryInputElem, document.querySelector('div.country div.dropdown ul'));
            } else if (className == "state") {
                dropDownList = loadDataToDropDown("state", getStateListOfCountry(getCountryID(countryInput)));
                dropDownHint(stateInputElem, document.querySelector('div.state div.dropdown ul'));
            } else {
                dropDownList = loadDataToDropDown("city", getCityListOfState(getStateID(stateInput)));
                dropDownHint(cityInputElem, document.querySelector('div.city div.dropdown ul'));
            }
            // show dropdown
            dropDown.style.display = "block";
            // click dropdown to store value
            if (!dropDownList) { return; }
            dropDownList.forEach(ls => {
                ls.addEventListener('click', () => {
                    if (className == "country") {
                        countryInput = ls.innerHTML;
                        stateInputElem.value = "";
                        cityInputElem.value = "";
                    } else if (className == "state") {
                        stateInput = ls.innerHTML;
                        cityInputElem.value = "";
                    } else {
                        cityInput = ls.innerHTML;
                    }
                    input.value = ls.innerHTML;
                });
            });
        });
        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropDown.style.display = "none";
            }, 250);
        });
    }
    const apiKey = "86228319-158c-4962-931e-1c06df5a064e";
    let countriesJson, statesJson, citiesJson;
    const countryInputElem = document.querySelector('div.country input');
    const stateInputElem = document.querySelector('div.state input');
    const cityInputElem = document.querySelector('div.city input');
    let countryInput, stateInput, cityInput;
    const card = document.querySelector('div.card');
    let isShown = false;
    async function App() {
        await setup();
        loadDataToDropDown("country", getDataList(countriesJson));
        dropDownHint(countryInputElem, document.querySelector('div.country div.dropdown ul'));
        dropDownHandle("country");
        dropDownHandle("state");
        dropDownHandle("city");
        document.querySelector("div.air-visualiser").addEventListener('click', () => {
            if (!countryInput || !stateInput || !cityInput) {
                const warning = document.querySelector("div.warning");
                warning.style.opacity = 1;
                warning.innerHTML = "Please complete filling the data";
                setTimeout(() => {
                    warning.style.opacity = 0;
                    warning.style.transition = "opacity 1s";
                }, 1000);
                return;
            }
            if (isShown) {
                return;
            }
            card.style.opacity = 1;
            isShown = true;
            // fetch weather data here 
            const aqiValue = document.querySelector("div#aqi div");
            const response = new Promise((resolve, reject) => {
                const res = fetch(
                    `https://api.airvisual.com/v2/city?city=${cityInput}&state=${stateInput}&country=${countryInput}&key=${apiKey}`
                ).then(resolve);
            }).then(data => data.json()).then(dataList => {
                const { data: { current : { pollution, weather } } } = dataList;
                // Display data here
                if (pollution.aqius <= 50) {
                    document.documentElement.style.setProperty(
                        '--aqi-color',
                        'var(--good-aqi-color)'
                    );
                } else if (pollution.aqius <= 100) {
                    document.documentElement.style.setProperty(
                        '--aqi-color',
                        'var(--medium-aqi-color)'
                    );
                } else {
                    document.documentElement.style.setProperty(
                        '--aqi-color',
                        'var(--bad-aqi-color)'
                    );
                }
                aqiValue.innerHTML = pollution.aqius;
                document.getElementById("temp-value").innerHTML = `${weather.tp} &#8451`;
                document.getElementById("humidity-value").innerHTML = `${weather.hu} %`;
                document.getElementById("wind-value").innerHTML = `${weather.ws} m/s`;
            }).catch(error => {
                console.error(error);
                aqiValue.innerHTML = "Not found";
                document.getElementById("temp-value").innerHTML = `Not found`;
                document.getElementById("humidity-value").innerHTML = `Not found`;
                document.getElementById("wind-value").innerHTML = `Not found`;
            });
        });
    }
    App();
})();
