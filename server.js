// server.js
const express     = require('express'),
      bodyParser  = require("body-parser"),
      mongodb     = require("mongodb"),
      bingImg     = require("./app/bing_web_search.js");

const mongoClient = mongodb.MongoClient;
const app = express();
const uri = process.env.DBURI;

app.use(bodyParser.json());
app.use(express.static('public'))

mongoClient.connect(uri, (err, client) => {
  if (err) throw err;
  console.log("connected!");  
  
  const _db = client.db("imagesearch");
  _db.createCollection("history", {capped: true, size: 5242880, max: 5000} );
  const history = _db.collection("history");
  
  bingImg(app, history);  
  
});


app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
