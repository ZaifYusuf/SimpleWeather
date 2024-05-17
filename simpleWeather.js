const express = require("express");
const app = express();
const path = require("path");
const portNumber = 7002;
const bodyParser = require("body-parser");

require("dotenv").config({ path: path.resolve(__dirname, '.env') })
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('images')); 
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

const uri = process.env.MONGO_CONNECTION_STRING;

const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = client.db(process.env.MONGO_DB_NAME); 
const collection = db.collection(process.env.MONGO_DB_COLLECTION);

console.log(`Web server started and running at http://localhost:${portNumber}/`);

app.get("/", (req, res) => {
    res.render("index"); 
});

app.get("/getCurrWeather", (req,res) => {
    res.render("weather"); 
});

app.post("/", async (req, res) => {
    let fname = req.body.firstName;
    console.log(fname);  

    let obj = {name: fname};
    try{
        await client.connect(); 
        await collection.insertOne(obj); 
    }catch(err){
        console.log(err); 
    }finally{
        await client.close(); 
    }

    res.redirect("/getCurrWeather"); 
});

app.post("/getCurrWeather", async (req, res) => {
    const {lat, lon} = req.body; 
    const apiKey = 'da90a92bcf6c533e5bbc81d85056aea2'; 
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=minutely,hourly,alerts,daily`; 

    try{
        let response = await fetch(apiUrl); 
        let data = await response.json(); 
        console.log(data);
        let currentWeather = data.current; 
        let icon = currentWeather.weather[0].icon; 
        let temp = currentWeather.temp; 
        let feelsLike = currentWeather.feels_like; 
        let uvIndex = currentWeather.uvi; 
        let iconImgLink = `https://openweathermap.org/img/wn/${icon}@4x.png`;
        let variables = 
        {
            image: iconImgLink,
            temperature: temp,
            feels: feelsLike,
            uv: uvIndex
        }
        res.render("weatherInfo", variables); 
    }catch(err){
        console.log(err); 
    }
}); 

















app.listen(portNumber);