/**
* Dev Challenge: parsing CSV with nodeJS.
*
* @author Igor G.P.
* @date 07/02/2018
*/ 

var Student  = require("./classes/Student.js"),       // Student class
    Address  = require("./classes/Address.js"),       // Address class
    aux      = require("./functions/functions.js"),   // aux module with helper functions
    csv      = require("fast-csv"),                   // module to read csv row by row
    isHeaders = true,
    students = [],
    headers = [];

csv.fromPath("input.csv").on("data", data => { // reads line after line of the csv (begins at the headers)
    
    if (isHeaders) { // reads the headers of the csv
        
        headers = data;
        isHeaders = false;
        
    } else { // reads row after row of the csv
        
        var row          = aux.getRow(headers, data),  // gets rows in an object whose keys are header names and values are row inputs
            rowAddresses = aux.getAddress(row),        // parses all addresses of a row
            invisible    = aux.getInvisible(row),      // parses the invisible property
            see_all      = aux.getSeeAll(row);         // parses the see_all property
        
        // creates a new student object for each row which will be JOINED later (same student can appear in more than 1 row)
        // pushes each new object into an array of students
        students.push(new Student(row['fullname'], row['eid'], row['classes'], rowAddresses, invisible, see_all));
    }
    
}).on("end", function() { // promise --> after csv reading is over, time to JOIN the same students that appear in different rows

    var studentsToJoin = {},      // hash (js object) for checking for students that appear in more than one row
        studentsJSON   = [];      // array with final JSON results

    // traverses students objects that were created from parsing the CSV = one student object for each ROW
    students.forEach( student => {

        if (!studentsToJoin.hasOwnProperty(student.eid)) { // if its a new student (not yet JOINED) with its other row objects

            // adds student.eid (unique id) as the key and the student as the value
            studentsToJoin[student.eid] = student; 
            
        } else { // if student.eid is already in the hash, it means the same student has another row result

            // updates (mutates) student with the same eid to concat new classes 
            studentsToJoin[student.eid].classes = studentsToJoin[student.eid].classes.concat(student.classes);

            // updates (mutates) student with the same eid to concat new addresses
            studentsToJoin[student.eid].addresses = studentsToJoin[student.eid].addresses.concat(student.addresses);

            if (student.invisible === true) {
                
                // changes invisible property if at least one student value was 1
                studentsToJoin[student.eid].invisible = true;
                
            }
            
            if (student.see_all === true) {
                
                // changes see_all property if at least one student value was 'yes'
                studentsToJoin[student.eid].see_all = true;
                
            }
            
        }
        
    });

    // traverses the student hash (object) to get all updated (JOINED) students
    for (var eid in studentsToJoin) {
        // searchs only the properties of the object and NOT in its prototype chain
        if (studentsToJoin.hasOwnProperty(eid)) {
            // pushes JOINED student to the final array
            studentsJSON.push(studentsToJoin[eid]);
        }
    }

    // prints the final JSON
    console.log(JSON.stringify(studentsJSON));
});
