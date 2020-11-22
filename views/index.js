$(document).ready(function () {
    let interval;

    function calculateOHLC(data) {

        // GroupBy Keys
        let groupByKey = data.reduce(function (r, a) {
            r[a.sym] = r[a.sym] || [];
            r[a.sym].push(a);
            return r;
        }, Object.create(null));
    
        var result = [];
        var ohlcData = [];
        var barNumber = 1;
        const formatYmd = date => date.toISOString().slice(0, 10); 

        for (var key in groupByKey) {

            var tempObject = {};
            var ohlcTempObject = {};
            var tempArray = [];
            var obj = groupByKey[key];
            //Ascending by timestamp
            obj.sort(function (x, y) {
                return x.TS - y.TS;
            });

            // convert timestamp to date
            obj.forEach(d => d.TS = new Date(d.TS * 1000));
        
            tempObject.date = formatYmd(new Date(obj[0].TS));
            tempObject.open = obj[0].P;
            tempObject.close = obj[obj.length - 1].P;
            tempObject.symbol = obj[0].sym;
            tempObject.bar_num = barNumber;
            // assign ohlc format
            ohlcTempObject.x = new Date(obj[0].TS).getMilliseconds();
            tempArray[0] = tempObject.open; // Open
            tempArray[3] = tempObject.close; // close
           
            // sort by price
            obj.sort(function (a, b) {
                return a.P - b.P
            });        
            tempObject.high = obj[obj.length - 1].P;
            tempObject.low = obj[0].P;
            tempObject.volume = obj[0].Q;

            tempArray[1] = tempObject.high; // High
            tempArray[2] = tempObject.low; // Low
 
            ohlcTempObject.y = tempArray;
            ohlcData.push(ohlcTempObject);
            result.push(tempObject);
            barNumber++;
        }
        
        return {
            output : result,
            ohlcData : ohlcData
        }
    }

    $('#btnStart').off().click(function () {
        let number = 0;

        const ws = new WebSocket('ws://localhost:5000/');

        ws.onopen = function () {

            interval = setInterval(function () {

                if (number === 0) {                    
                    ws.send(JSON.stringify({
                        type: 'request',
                        msg: 'Read json file',
                        seconds: number
                    }));
                }

                $('#timer').text(number++); // Update the timer

                if (number > 15) {
                    number = 0;
                }

            }, 1000); // Run for each second      
        };

        ws.onmessage = function (e) {
            let receivedDate = JSON.parse(e.data);

            if(receivedDate.length){
                let result = calculateOHLC(receivedDate);
                var chart = $(".chartContainer").CanvasJSChart();
                chart.options.data[0].dataPoints = result.ohlcData;
                chart.render();

                $('#result').text(JSON.stringify(result.output));
            }
            
        };

    });
});
