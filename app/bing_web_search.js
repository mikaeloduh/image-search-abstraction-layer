'use strict';
let https = require('https');

let bing_img = function(app, history) {
  
    let subscriptionKey = process.env.ACCKEY;
    let host = 'api.cognitive.microsoft.com';
    let path = '/bing/v7.0/images/search';

    let bing_web_search = function (request, response) {
        const search = request.params.query;
        const offset = request.query.offset;
        const options = ["count=10", "offset=" + 10 * offset].join("&");
      
        const doc    = {
          term: search, 
          offset: offset,
          date: new Date()
        };
      
        history.insert(doc, (err, data) => {
          if (err) throw err;

        });

        console.log('Searching the Web for: ' + search);      
        let request_params = {
            method : 'GET',
            hostname : host,
            path : path + '?q=' + encodeURIComponent(search) + "&" + options,
            headers : {
                'Ocp-Apim-Subscription-Key' : subscriptionKey,
            },
            count: 10
        };

        let req = https.request(request_params, function (res) {
            let body = '';
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                let obj = JSON.parse(body);
                let result = obj.value.map((n) => {
                  return { url: n.contentUrl, snippet: n.name, thumbnail: n.thumbnailUrl, context: n.webSearchUrl};
                });
                
                response.json(result);
            });
            res.on('error', function (e) {
                console.log('Error: ' + e.message);
            });
        });       
        req.end();
    }
    
    // Request search query
    app.get("/test/:query", bing_web_search);
  
    // View search history
    app.get("/last", (request, response) => {
      history.find({}).toArray((err, result) => {
        response.send(result);
      });    
    });  
}


module.exports = bing_img;
