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

function cleanClasses(headers, lst) {
    var classes = [],
        seps = [",", "/"];
        
    headers.forEach(function(hdr, i) {
        if (hdr == 'class') {
            var raw = lst[i],
                hasSep = false;
            
            // checks seperators
            seps.forEach(function(sep) {

                if (raw.search(sep) != -1) {
                    hasSep = true;
                    
                    raw.split(sep).forEach(function(part) {
                        classes.push(part.trim());
                    });
                } 
                
            });

            // if no separator is in the string and if its not empty
            if (!hasSep && raw !== "") {
                classes.push(raw.trim());
            }

        }
    });
                    
    return classes;
}

function getRow(headers, rawRow) {
    var row = {};
    
    for (var i = 0; i < headers.length; i++) {

        if (headers[i] != 'class') {
            row[headers[i]] = rawRow[i];
        }        
    }
    
    row['classes'] = cleanClasses(headers, rawRow);
    
    return row;
}

function cleanEmail(a) {
    var splitEmails = [],
        addresses = [];
    
    if (a.address.search("/") != -1) {
        // ['email@gmail.com, 'email2@gmail.com']
        a.address.split("/").map(s => s.trim()).forEach(function(email) {
            splitEmails.push(email);
        });
    } else {
        splitEmails.push(a.address);
    }

    splitEmails.forEach(function(email) {        
        if (validateEmail(email)) {            
            addresses.push(new Address(a.type, a.tags, email));
        }
    });

    // returns addresses with valid emails
    // may be empty
    return addresses;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return re.test(String(email).toLowerCase());
}

function cleanPhoneNumber(a) {    
    // Get an instance of `PhoneNumberUtil`.
    const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    var addresses = [];

    try {
        // Parse number with country code and keep raw input
        const number = phoneUtil.parseAndKeepRawInput(a.address, 'BR');

        if (phoneUtil.isPossibleNumber(number)) {
            addresses.push(new Address(a.type, a.tags, number.getCountryCode().toString() + number.getNationalNumber().toString()));

            return addresses;
        } else {
            return [];
        }

    } catch (NOT_A_NUMBER) {
        return [];
    }

}

function getAddress(row) {
    var keywords = ["phone", "email"],
        tagList = [],
        addresses = [],
        emailAddresses = [],
        phoneAddresses = [];

    // traverses keys (column names)
    Object.keys(row).forEach(function(field) {

        // email, phone
        keywords.forEach(function(keyword) {
            if (field.search(keyword) != -1) {

                // removes keyword email or phone so only taglist is left
                var tagListString = field.replace(keyword, "").trim(),
                    tagList = tagListString.split(",").map(s => s.trim());

                if (keyword == 'email') {
                    emailAddresses = cleanEmail(new Address(keyword, tagList, row[field]));
                    addresses = addresses.concat(emailAddresses)
                } else {
                    phoneAddresses = cleanPhoneNumber(new Address(keyword, tagList, row[field]));
                    addresses = addresses.concat(phoneAddresses)
                }                
            }
        });        
    });
    
    // console.log(JSON.stringify(addresses));
    
    return addresses;
}

function getInvisible(row) {
    if (parseInt(row['invisible'] ) === 1) {
        return true;
    } else {
        return false;
    }
}

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


