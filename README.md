# capstone-api
This is the back-end portion of the Swift Geography mobile application project. The repository for the front-end can be found [here](https://github.com/EZIC13/capstone-geography).

<br/>

# API Details
The back-end of this project is written in Node.js and connect to a MySQL database hosted on Amazon Web Services (AWS). The country data for the project was obtained from [REST Countries](https://restcountries.com/) and was placed into the database using the `countries2API.py` script, which is present in the file; however, the URL to the public API server has been removed for privacy reasons. 

The following libraries were used in this project:
- express
- mysql2
- nodemon

<br/>

# Getting Started
To begin using this API complete the following steps:

- Download and unzip the project files above.
- Edit `countries2API.py` and edit the `LOCAL_URL` const on line 84 (or make a new const) and set the correct URL of your server.
- Edit `routes.js` and input the necessary MySQL credential information. ***This database MUST have a `countries` table. If otherwise, all query strings in `routes.js` must be changed to match your database table name.***
- In a terminal, navigate to the unzipped folder directory and execute `npm install`.
- Also in the terminal, execute `node index.js` OR `nodemon`.
> NOTE: By default, the server listens on port 3000.

# countries2API.py
This is the Python file that gets the data from the source, reformats it, and injects it into the database through a POST method in Node.js. This is done by parsing through the data returned from the REST Countries API and then creating a `country` object which is added to the `pulledCountries` list. This list is then sorted in alphabetical order and then sent to the API. 

<br/>

# index.js
This file initializes the server and has all methods to configure parsing and CORS as well as initializing all routes on the server. The following routes are present: 

- `app.get('/', routes.default);` is the default route. This currently redirects the user to `/countries`.
- `app.get('/countries', routes.countries);` will return an array of all countries in JSON objects.
- `app.get('/countries/:name', routes.searchCountries);` will return all countries containing the `name`paramater.
- `app.post('/', routes.postCountries);` will post all countries from the Python script into the database.

<br/>

# routes.js
This file contains the code for all of the routes, and is where all of the logic of the API takes place.

First, the connection to the MySQL database is made by using the following code format: 
```node.js
const mysql = require("mysql2");

let connection;
try {
    connection = mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: "",
        port: 3306 //default MySQL Port
    });
} catch (error) {
    console.error(error);
};

//connection can now be used globally to execute MySQL commands
```

Next, there is a function that will format the MySQL response into a JSON object and return it for the route to return to the user. The data is formatted to match the following schema: 
```json
{
    "id": element.id, //this is the primary key of the row in MySQL
    "name_common": element.name_common,
    "name_official": element.name_official,
    "coordinates": {
        "latitude": parseFloat(element.latitude),
        "longitude": parseFloat(element.longitude)
    },
    "flag": element.flag,
    "region": element.region,
    "subregion": element.subregion,
    "capital": element.capital,
    "landlocked": element.landlocked,
    "area": element.area,
    "population": element.population,
    "demonym": element.demonym
}
```

From here there is the default `/` route, which currently auto redirects to the `/countries` route.

The `/countries` route will query the database for all entries and then format and return them, logging the amount of items to the console, and returning an error 500 there are any errors.

The `/searchCountries/:name` route will do the same, but will only query on the `name` parameter. For example, if the user navigates to `countries/united`, then only countries that contain the string "united" will be returned. An error 500 will be returned if there are any errors, and the amount of items returned will be logged to the console.
> NOTE: The `name` parameter is being compared to the `name_common` column.

The `/postCountries` route will start by dropping and recreating the `countries` table from the database. Then the request body (which contains all of the data sent by the Python script) will be parsed and each entry will be inserted into the database. If, successful, a message will be sent to the console and sent back to the Python terminal, otherwise there will be an error 500 returned.
