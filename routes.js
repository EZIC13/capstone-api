const mysql = require("mysql2");

//Create connection to MySQL Database
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

//Function to format results and add them to array
var formatResponse = (data) => {

    let countries = [];

    data.forEach(element => {

        //Convert binary values to boolean
        element.landlocked == 1 ? element.landlocked = true : element.landlocked = false;

        countries.push({
            "id": element.id,
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
        });
    });

    console.log(`Returning ${countries.length} items`)

    return countries;
};

//Default route
exports.default = (_req, res) => {
    res.redirect("/countries");
};

//Return JSON of countries
exports.countries = (_req, res) => {
    try {
        //Query database
        let query = "SELECT * FROM countries"
        connection.query(query, (error, results) => {
            if (error) throw error;
            //Format and send the data
            const finalData = formatResponse(results);
            res.send(finalData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'An internal server error occurred',
            message: 'Unable to query database to get all countries'
        });
    };
};

//Get specific countries
exports.searchCountries = (req, res) => {
    try {
        let query = `SELECT * FROM countries WHERE name_common LIKE ?`
        connection.query(query, [`%${req.params.name}%`], (error, results) => {
            if (error) throw error; 
            //Format and send the data
            const finalData = formatResponse(results);
            res.send(finalData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'An internal server error occurred',
            message: `Unable to query database to get countries containing:  ${req.params.name}`
        });
    };
};

//Post data from the injection script
exports.postCountries = (req, res) => {
    try {
        //Drop and recreate the table to prevent any chance of duplication, when insert the data
        connection.query("DROP TABLE IF EXISTS countries", error => {
            if (error) throw error;

            console.log('Countries table dropped');

            connection.query("CREATE TABLE IF NOT EXISTS countries (id INT AUTO_INCREMENT PRIMARY KEY, name_common VARCHAR(500) NOT NULL, name_official VARCHAR(500) NOT NULL, latitude DECIMAL(5,2) NOT NULL, longitude DECIMAL(5,2) NOT NULL, flag VARCHAR(500) NOT NULL, region VARCHAR(500) NOT NULL, subregion VARCHAR(500) NOT NULL, capital VARCHAR(500) NOT NULL, landlocked BOOLEAN NOT NULL, area INT NOT NULL, population INT NOT NULL, demonym VARCHAR(500) NOT NULL)", async error => {
                if (error) throw error;
                console.log("Countries table created");
        
                await req.body.forEach(element => {
                    connection.query(`INSERT INTO countries (name_common, name_official, latitude, longitude, flag, region, subregion, capital, landlocked, area, population, demonym) VALUES ("${element.name_common}", "${element.name_official}", "${element.coordinates.latitude}", "${element.coordinates.longitude}", "${element.flag}", "${element.region}", "${element.subregion}", "${element.capital}", "${element.landlocked}", "${element.area}", "${element.population}", "${element.demonym}")`, error => {
                        if (error) throw error;
                    });
                });
        
                console.log("Added all countries");
                res.send("Data injected");
            });
    
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'An internal server error occurred',
            message: 'Unable to post data to database'
        });
    };
};