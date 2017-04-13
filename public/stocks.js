var socket = io();

//listen to add button
$('form').submit(function () {
    socket.emit('stock', $('#m').val());
    $('#m').val('');
    return false;
});


//listen to stock data
socket.on('stock', function (msg) {
    if (msg.type == "error") {
        console.log(msg);
        alert(msg.data);
        return;
    }
    console.log(msg);
    //convert stock data for hightchart stock to render fancy chart 
    var formatArr = [];
    for (let i in msg.currentStock.data) {
        formatArr[i] = {
            data: msg.currentStock.data[i],
            name: msg.currentStock.tickers[i]
        }
    }
    createChart(formatArr);
    renderStockBox(formatArr);

     $('img').on('click',function(){
        var index = $(this).data('index');
       socket.emit('delete-stock', index );
    });
});


function createChart(seriesOptions) {

    Highcharts.stockChart('chart-box', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

function renderStockBox(formatArr){
    $(".box-container").empty();
    for(var i in formatArr){
        $(".box-container")
            .append('<div class="stock-box"><div class="box-header"><h1>'+formatArr[i].name+'</h1><h2 class = "price">' + formatArr[i].data[0][1] + '</h2><img data-index="'+i+'"class="close-icon" src="./public/close.png" alt=""></div></div>');
    }

};
