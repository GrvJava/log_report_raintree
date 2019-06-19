const fs = require('fs');
const Async = require('async');
var resultDisconnect = {};
var resultLimit = {};
var resultDrop = {};

function processFile(date){
    var lines = '';
    //Please edit log folder location here
    try {
       lines = fs.readFileSync("/home/gauravkumar/Desktop/RTTest/QoS_logs/H--RAINTREE-PARKER94-/"+date+".log", 'utf-8');
    } catch(error) {
       console.log("Error in reading file for : " + date);
    }

if(lines){
    lines = lines.split("\n");
    lines.forEach(function(line){
        try{
            var data = line.split("|");
            var data2 = data[2].trim();
            var varData = data[0].split(" ");
            var computerName = varData[1].split(":")[1].trim();
            var check = data2.split(" ");
            var repeat = check[check.length - 1];
            var numberToAdd = 1;
            if(repeat.includes('times')){
                numberToAdd = check[check.length - 2];
            }else if(repeat.includes('x')){
                numberToAdd = repeat.charAt(0);
            }
            if(data2.includes("Client is disconnected from agent.")){
                if(computerName in resultDisconnect){
                    resultDisconnect[computerName] = Number(resultDisconnect[computerName]) + Number(numberToAdd);
                }else{
                    resultDisconnect[computerName] = Number(numberToAdd);
                }
            }else if(data2.includes('Average limit')){
                if(computerName in resultLimit){
                    resultLimit[computerName] = Number(resultLimit[computerName]) + Number(numberToAdd);
                }else{
                    resultLimit[computerName] = Number(numberToAdd);
                }
            }else if(data2.includes('Drop count limit')){
                if(computerName in resultDrop){
                    resultDrop[computerName] = Number(resultDrop[computerName]) + Number(numberToAdd);
                }else{
                    resultDrop[computerName] = Number(numberToAdd);
                }
            }
        }catch(error){
            //console.log("Error in parsing : " + error + " " + line)
        }
    });
}
};

(function () {
    if (require.main === module) {
        let startDate = process.env.START_DATE;
        let endDate = process.env.END_DATE || new Date();
        let parallelProcessing = 10;
        if (startDate && endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            console.log('Initiating recon for date range '+ startDate + '->' + endDate);
            let date = startDate;
            let dateRange = [];

            for (date; date < endDate; date.setDate(date.getDate() + 1)) {
                dateRange.push(new Date(date));
            }
            dateRange.push(new Date(endDate));
                Async.forEachLimit(dateRange, parallelProcessing, Async.ensureAsync((date, callback) => {
                    var year = date.getFullYear().toString();
                    var month = date.getMonth() + 1;
                    month = month.toString();
                    var day = date.getDate().toString();
                    month = month.length == 2 ? month : ('0' + month);
                    day = day.length == 2 ? day : ('0' + day);
                    date = year + month + day; 
                    processFile(date);
                    callback(null);
                }), (error, result) => {
                    console.log("Computer Name Number of Disconnects");
                    console.log(resultDisconnect);
                    console.log('Computer Name Number of Average limit exceeded');
                    console.log(resultLimit);
                    console.log('Computer Name Number of Drops');
                    console.log(resultDrop);
                    console.log('Process completed');
                });
        }else{
            console.log('Please provide valid start and end date');
            process.exit(1);
        }
    }
}());
