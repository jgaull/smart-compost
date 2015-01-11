var spark = require('spark');
var Spreadsheet = require('edit-google-spreadsheet');
var moment = require("moment");

var internalTemp = 0;
var externalTemp = 0;

var params = { 
    debug: true,
    spreadsheetId: "1shggL5AQYZ6-aNg0xNIceqCAQO6rMUAhcCqB-fC02rM",
    worksheetId: "od6",
    username: "jon@modeo.co",
    password: "ch33zerZ"
}

spark.login({accessToken: "cb85c3f3a709edbdd1da67aaa28d340b5878fb38"}, function (error, body) {
    
    if (error) {
        console.log("Error logging in.");
    } else {
        console.log("Successfully logged in.", body);
        
        spark.getDevice("48ff6e065067555059401587", function(err, device) {
            
            if (err) {
                console.log("error getting device.", err);
            } else {
                console.log("Device name: " + device.name);
                
                device.getVariable('internalTemp', function(e, data) {
                  if (err) {
                    console.log('An error occurred while getting attrs:', err);
                  } else {
                    internalTemp = data.result;
                    
                    console.log('internalTemp:', internalTemp);
                    storeValues();
                  }
                });
                
                device.getVariable('externalTemp', function(e, data) {
                  if (err) {
                    console.log('An error occurred while getting attrs:', err);
                  } else {
                    externalTemp = data.result;
                    
                    console.log('externalTemp:', externalTemp);
                    storeValues();
                  }
                });
            }
        });
    }
});

function storeValues() {
    
    if (internalTemp > 0 && externalTemp > 0) {
        console.log("Saving values!");
        
        Spreadsheet.load(params, function sheetReady(err, spreadsheet) {
            
            if (err) {
                console.log("Error loading spreadsheet");
            } else {
                console.log("Success loading spreadsheet");
                
                spreadsheet.receive(function(err, rows, info) {
                    if(err) {
                        console.log("error receiving.");
                    }
                    else {
                        console.log("Found rows:", rows);
                        
                        var newRow = {
                            1: moment().format("M/D/YYYY HH:mm:ss"),
                            2: internalTemp,
                            3: externalTemp
                        };
                        
                        var p = {};
                        p[info.nextRow] = newRow;
                        
                        spreadsheet.add(p);
                        
                        spreadsheet.send(function(err) {
                          if(err) {
                              console.log("error sending updates.", err);
                          }
                          else {
                              console.log("updates sent");
                          }
                        });
                    }
                });
            }
        });
    }
}