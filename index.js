const express = require('express');
const routes = require('./routes');

//Create Sever
const app = express();

//Parse JSON
app.use(express.urlencoded({extended: true})); 
app.use(express.json());

//Allow CORS Requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Routes
app.get('/', routes.default);
app.get('/countries', routes.countries);
app.get('/countries/:name', routes.searchCountries);
app.post('/countriesPOST', routes.postCountries);

//Make server listen on port 3000
app.listen(3000);