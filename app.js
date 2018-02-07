var csv = require("fast-csv"),
    headers = [],
    isHeaders = true;

class Student {
    constructor(fullname, eid, classes, addresses, invisible, see_all) {
        this.fullname = fullname;
        this.eid = eid;
        this.classes = classes;
        this.addresses = addresses;
        this.invisible = invisible;
        this.see_all = see_all;
    }
}

class Address {
    constructor(type, tags, address) {
        this.type = type;
        this.tags = tags;
        this.address = address;
    }
}


/**
* Takes an array of csv headers and an array of csv inputs and combines the two 'class'
* columns into one. Also, it splits class inputs that are separated by commands or slashes
* in the same row field.
*
* @param csvHeaders is an array that holds the header names of the csv input.
* @param csvRow is an array that holds the values of each row of the csv input.
*
* @return classes is an array that holds all the classes for a given csv row.
*/
function cleanClasses(csvHeaders, csvRow) {
    var classes = [],
        seps = [",", "/"]; // separators used to split classes

    // traverses the csv headers
    csvHeaders.forEach(function(hdr, i) {
        // finds the class header which may or not be split
        if (hdr === 'class') {
            var csvClass = csvRow[i], // finds the class position in the row array
                hasSep = false;       // bool to check if a class requires spliting or no
            
            // checks if the seperators are in the class
            seps.forEach(function(sep) {
                // if the csv class has one of the seps, it must be split
                if (csvClass.search(sep) != -1) {
                    hasSep = true;

                    // splits csvClass and pushes each individual class to the classes array
                    csvClass.split(sep).forEach(function(individualClass) {
                        classes.push(individualClass.trim());
                    });
                } 
            });

            // if the csv class has no separators it can be pushed directly (i.e. its an individual one)
            if (!hasSep && csvClass !== "") {
                classes.push(csvClass.trim());
            }
        }
    });
                    
    return classes;
}

/**
* Takes an array of headers and an array of the inputs of each row and transforms
* into an object in which the keys are the header names and the values are
* the inputs of the row.
*
* @param csvHeaders is an array that holds the header names of the csv input.
* @param csvRow is an array that holds the values of each row of the csv input.
*
* @return row an object whose keys are the header names and the values are the row inputs.
*/
function getRow(csvHeaders, csvRow) {
    var row = {};

    for (var i = 0; i < csvHeaders.length; i++) {
        if (csvHeaders[i] != 'class') {
            // sets the headers as the keys
            // sets the row inputs as the values
            row[csvHeaders[i]] = csvRow[i];
        }        
    }

    // transforms the two class column into one
    // splits class values that are separated by commas or slashes
    row['classes'] = cleanClasses(csvHeaders, csvRow);
    
    return row;
}

/**
* Takes an array of email tags and and array of email inputs of the csv
* file to create an array of Address objects. Validates phone numbers.
*
* @param tagList is an array of the tags of the email field of the csv input.
* @param csvEmail is the email value in each row of the csv input.
*
* @return addresses is an array of Address objects that were created with the email inputs.
*/
function getEmailAddresses(tagList, csvEmail) {
    var splitEmails = [],
        addresses = [];

    // checks if the csv email contains a slash to hold many emails in one field
    if (csvEmail.search("/") != -1) {
        
        // splits the emails at the slash and pushes each one to the splitEmails array
        csvEmail.split("/").map(s => s.trim()).forEach(function(email) {
            splitEmails.push(email);
        });
        
    } else {
        // if the csv email has no slash it is pushed right away into splitEmails
        splitEmails.push(csvEmail);
    }

    // validates each csv email in splitEmails
    splitEmails.forEach(function(email) {

        // creates an email Address object and pushes to the address array
        if (isValidEmail(email)) {            
            addresses.push(new Address("email", tagList, email));
        }
    });

    // returns an array with Address objects for valid emails
    return addresses;
}

/**
* Takes a string with an email value and returns whether it is a valid one or not. Taken
* from a StackOverFlow question.
*
* @param email is a string with email value.
*
* @return true if the email is valid. Otherwise, returns false.
*/
function isValidEmail(email) {
    // regexp pattern to look for valid emails
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return re.test(String(email).toLowerCase());
}

/**
* Takes an array of phone tags and and array of phone inputs of the csv
* file to create an array of Address objects. Validates phone numbers.
*
* @param tagList is an array of the tags of the phone field of the csv input.
* @param csvPhone is the phone value in each row of the csv input.
*
* @return addresses is an array of Address objects that were created with the phone inputs.
*/
function getPhoneAddresses(tagList, csvPhone) {
    // requires google library
    const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
    var addresses = [];

    try {
        // parses number with country code and keep raw input
        const number = phoneUtil.parseAndKeepRawInput(csvPhone, "BR");

        // checks if the phone number is valid
        if (phoneUtil.isPossibleNumber(number)) {

            // pushes a new phone Address object with the valid phone number (right format)
            addresses.push(new Address("phone", tagList,
                                       number.getCountryCode().toString() +
                                       number.getNationalNumber().toString()));

            return addresses;
        } else {
            // returns an empty array if no valid phone numbers were found
            return [];
        }

    } catch (NOT_A_NUMBER) {
        // returns an empty array if an invalid phone number threw NOT_A_NUMBER exception
        return [];
    }

}

/**
* Takes a row object and searches the headers names for address and tags information.
*
* @param row is an object whose keys are column names and values are the row inputs of the csv file.
*
* @return addresses an array that holds Address objects.
*/
function getAddress(row) {
    var keywords       = ["phone", "email"], 
        allAddresses   = [],
        emailAddresses = [],
        phoneAddresses = [];

    // traverses keys of the row object (headers/column names)
    Object.keys(row).forEach(function(headerName) {

        // checks if keywords (phone/email) are substrings in the headerName
        keywords.forEach(function(keyword) {
            
            if (headerName.search(keyword) != -1) {

                // removes keyword (phone/email) to obtain a string with the tags
                var tagListString = headerName.replace(keyword, "").trim(),
                    tagList       = tagListString.split(",").map(s => s.trim());

                if (keyword == 'email') {
                    // emailAddresses = cleanEmail(new Address(keyword, tagList, row[headerName]));
                    
                    // validates the email
                    emailAddresses = getEmailAddresses(tagList, row[headerName]);

                    // concatenates the array of email addresses into the addresses array found for this headerName
                    allAddresses = allAddresses.concat(emailAddresses);
                } else {
                    // validates the phone number
                    phoneAddresses = getPhoneAddresses(tagList, row[headerName]);

                    // concatenates the array of phone addresses into the addresses array
                    allAddresses = allAddresses.concat(phoneAddresses);
                }                
            }
            
        });
        
    });
    
    return allAddresses;
}

/**
* Transforms the invisible field of the csv input into true or false.
*
* @param row is an object whose keys are column names and values are the row inputs of the csv file.
*
* @return true if invisible is one. Otherwise, returns false.
*/
function getInvisible(row) {
    if (parseInt(row['invisible'] ) === 1) {
        return true;
    } else {
        return false;
    }
}

/**
* Transforms the see_all field of the csv input into true or false.
*
* @param row is an object whose keys are column names and values are the row inputs of the csv file.
*
* @return true if see_all is one. Otherwise, returns false.
*/
function getSeeAll(row) {
    if (row['see_all'] === 'yes') {
        return true
    } else {
        return false;
    }
}

var students = [];

csv.fromPath("input.csv")
    .on("data", function(data){
        if (isHeaders) {
            headers = data;

            isHeaders = false;
        } else {
            var row = getRow(headers, data),
                rowAddresses = getAddress(row),
                invisible = getInvisible(row),
                see_all = getSeeAll(row);
            
            students.push(new Student(row['fullname'], row['eid'], row['classes'], rowAddresses, invisible, see_all));

//            console.log(JSON.stringify(new Student(row['fullname'], row['eid'], row['classes'], rowAddresses, invisible, see_all)));
        }

    })
    .on("end", function(){
        console.log("done");       
        var eids = {};
        
        students.forEach(function(student) {
            
            if (!eids.hasOwnProperty(student.eid)) {
                eids[student.eid] = student;
            } else {
                // already found that eid --> must group student properties
                // var previousRegister = eids[student.eid];
                
                eids[student.eid].classes = eids[student.eid].classes.concat(student.classes);
                eids[student.eid].addresses = eids[student.eid].addresses.concat(student.addresses);

                if (student.invisible === true) {
                    eids[student.eid].invisible = true;
                }

                if (student.see_all === true) {
                    eids[student.eid].see_all = true;
                }
                   
            }
        });

        var studentsJSON = [];
        
        for (var key in eids) {
            if (eids.hasOwnProperty(key)) {
                studentsJSON.push(eids[key]);
            }
        }

        console.log(JSON.stringify(studentsJSON));
    });


