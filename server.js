"use strict"

var express = require('express');
var app = express();
var request = require('request');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var morgan = require('morgan')


app.use(morgan('dev'));

app.use('/public', express.static('public'));


app.get('/', (req, res) => {
  res.sendfile(__dirname + "/public/index.html");
});
app.get('/api/stock', (req, res) => {



});

let currentStock = {tickers:[],data:[]};

io.on('connection', function (socket) {

  console.log('connection~~');

  socket.on('delete-stock',function(index){
        currentStock.tickers.splice(index,1);
        currentStock.data.splice(index,1);
     io.emit('stock', {
          type:'stock',
          currentStock: currentStock
        });
  });

  io.emit('stock', {
          type:'stock',
          currentStock: currentStock
        });

  socket.on('stock', function (msg) {
    msg = msg.trim();

    for(let i in currentStock.tickers){
      if(currentStock.tickers[i]==msg)
      {
          io.emit('stock',{
          type:'error',
          data: 'duplicate company name'
        });
        return;
      }
    }

    let url = `
  https://www.quandl.com/api/v3/datatables/WIKI/PRICES.json?ticker=` + msg + `&date.gte=20160101&date.lt=
  ` + getCurrentDate() + `&qopts.columns=date,open&api_key=asrxmqhy54Yj6qMtshh9
  `;



    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        
        console.log('requested');
        let data = JSON.parse(body).datatable.data;
        if(data.length==0){
          io.emit('stock',{
          type:'error',
          data: 'no data was found'
        });
        return;
        }
        for (let d in data) {
          //convert date to utc
          let date = data[d][0].split('-');
          let year = date[0];
          let month = date[1];
          let day = date[2];
          let utc = Date.UTC(year, month-1, day); 
          data[d][0] = utc;

        }
 
        
        currentStock.tickers.push(msg);
        currentStock.data.push(data);

        io.emit('stock', {
          type:'stock',
          currentStock: currentStock
        });


      }

      else{

        io.emit('stock', {
          type:'error',
          data: 'stock api error'
        });

      }

    });
  });


});



http.listen(process.env.PORT||3000,function(){
  console.log("Listening to "+process.env.PORT||3000)
});


function getCurrentDate() {

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; 

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  var today = dd + '/' + mm + '/' + yyyy;
  return yyyy + mm + dd;
}