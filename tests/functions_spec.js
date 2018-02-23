/**
* Dev Challenge: tests written for functions.js using
* jasmine-node testing framework.
*
* @author Igor G.P.
* @date 07/02/2018
*/ 

var aux  = require('../functions/functions.js'),
    csv  = require("fast-csv");

describe('fast-csv header reading: ', () => {
    it ('should parse the HEADERS and the first row of  the csv file', (done) => {
        // variables for header and first row testing
        var isHeaders = true, isFirstRow = true;
                
        csv.fromPath("../input.csv").on("data", (data) => {
            
            if (isHeaders) { // asserts the headers of the csv

                var csvHeaders = [ 'fullname', 'eid', 'class', 'class', 'email Responsável, Pai', 'phone Pai',
                                   'phone Responsável, Mãe', 'email Mãe', 'email Aluno', 'phone Aluno', 'invisible', 'see_all' ]
                
                expect(data).toEqual(csvHeaders);                
                isHeaders = false;
                
            } else { // asserts the first row
                
                if (isFirstRow) {
                    csvFirstRow = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3', 'johndoepai1@gmail.com :)', '11 22221',
                                '(11) 38839332', 'johndoemae1@gmail.com', 'johndoealuno1@gmail.com', 'hahaha', '1', '' ];
                    
                    expect(data).toEqual(csvFirstRow);
                    isFirstRow = false;
                    
                }

                // finishes async testing
                done();
            }  
        })
    });
});

describe('cleanClasses function testing', () => {
    it ('should combine the two classes columns into one', () => {
        // data just until the classes columns
        var csvHeaders    = [ 'fullname', 'eid', 'class', 'class'],
            csvRow1       = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3'],
            csvRow2       = [ 'John Doe 1', '1234', 'Sala 4', 'Sala 5, Sala 6'],
            specClasses1  = ['Sala 1', 'Sala 2', 'Sala 3'],
            specClasses2  = ['Sala 4', 'Sala 5', 'Sala 6'];
        
        expect(aux.cleanClasses(csvHeaders, csvRow1)).toEqual(specClasses1);
        expect(aux.cleanClasses(csvHeaders, csvRow2)).toEqual(specClasses2);
    });
});

describe('getRow function testing', () => {
    it ('should create an object whose keys are the columns and values are the row inputs', () => {
        var csvHeaders = [ 'fullname', 'eid', 'class', 'class', 'email Responsável, Pai', 'phone Pai'],
            csvRow     = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3', 'johndoepai1@gmail.com :)', '11 22221'];
        
        var specRow    = { 'fullname' : 'John Doe 1', 'eid' : '1234', 'classes' : [ 'Sala 1', 'Sala 2', 'Sala 3' ],
                           'email Responsável, Pai' : 'johndoepai1@gmail.com :)', 'phone Pai' : '11 22221' }
        
        expect(aux.getRow(csvHeaders, csvRow)).toEqual(specRow);
    });
});

describe('getEmailAddresses function testing', () => {
    it ('should create an array of Address objects', () => {
        var csvEmail1 = 'johndoepai2@gmail.com/johndoepai3@gmail.com',  // email requires splitting (valid)
            csvEmail2 = 'johndoemae1@gmail.com',                        // ordinary email (valid)
            csvEmail3 = 'johndoepai1@gmail.com :)';                     // INVALID email

        var tagList1  = ['Responsável', 'Pai'],
            tagList2  = ['Mãe'],
            tagList3  = ['Responsável', 'Pai'];
        
        var specAddress1 = [{'type' : 'email', 'tags' : ['Responsável', 'Pai'], 'address' : 'johndoepai2@gmail.com'},
                            {'type' : 'email', 'tags' : ['Responsável', 'Pai'], 'address' : 'johndoepai3@gmail.com'}],
            specAddress2 = [{'type' : 'email', 'tags' : ['Mãe'], 'address' : 'johndoemae1@gmail.com'}],
            specAddress3 = [];

        expect(aux.getEmailAddresses(tagList1, csvEmail1)).toEqual(specAddress1);
        expect(aux.getEmailAddresses(tagList2, csvEmail2)).toEqual(specAddress2);

        // invalid email returns an empty address list []
        expect(aux.getEmailAddresses(tagList3, csvEmail3)).toEqual(specAddress3);
    });
});

describe('getPhoneAddresses function testing', () => {
    it ('should create an array of Address objects', () => {
        var csvPhone1 = '(11) 38839332',  // valid number
            csvPhone2 = '11 22221',       // INVALID
            csvPhone3 = 'hahaha';         // INVALID

        var tagList1  = ['Responsável', 'Mãe'],
            tagList2  = ['Pai'],
            tagList3  = ['Aluno'];

        var specAddress1 = [{'type' : 'phone', 'tags' : ['Responsável', 'Mãe'], 'address' : '551138839332'}], // required phone output
            specAddress2 = [],
            specAddress3 = [];

        expect(aux.getPhoneAddresses(tagList1, csvPhone1)).toEqual(specAddress1);

        // invalid phones returns empty address list []
        expect(aux.getPhoneAddresses(tagList2, csvPhone2)).toEqual(specAddress2);
        expect(aux.getPhoneAddresses(tagList3, csvPhone3)).toEqual(specAddress3);
    });
});

describe('getAddress function testing', () => {
    it ('should create an array of Address (phone and number) objects', () => {
        var csvHeaders  = [ 'fullname', 'eid', 'class', 'class', 'email Responsável, Pai', 'phone Pai',
                            'phone Responsável, Mãe', 'email Mãe', 'email Aluno', 'phone Aluno', 'invisible', 'see_all' ],
            csvFirstRow = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3', 'johndoepai1@gmail.com :)', '11 22221',
                            '(11) 38839332', 'johndoemae1@gmail.com', 'johndoealuno1@gmail.com', 'hahaha', '1', '' ],
            row         = aux.getRow(csvHeaders, csvFirstRow);

        var specAddress = [{'type' : 'phone', 'tags' : ['Responsável', 'Mãe'], 'address' : '551138839332'},
                           {'type' : 'email', 'tags' : ['Mãe'], 'address' : 'johndoemae1@gmail.com'},
                           {'type' : 'email', 'tags' : ['Aluno'], 'address' : 'johndoealuno1@gmail.com'}]
        
        expect(aux.getAddress(row)).toEqual(specAddress);      
    });
});

describe('getInvisible function testing', () => {
    it ('should return true for the first row of the csv', () => {
        var csvHeaders  = [ 'fullname', 'eid', 'class', 'class', 'email Responsável, Pai', 'phone Pai',
                            'phone Responsável, Mãe', 'email Mãe', 'email Aluno', 'phone Aluno', 'invisible', 'see_all' ],
            csvFirstRow = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3', 'johndoepai1@gmail.com :)', '11 22221',
                            '(11) 38839332', 'johndoemae1@gmail.com', 'johndoealuno1@gmail.com', 'hahaha', '1', '' ],
            row         = aux.getRow(csvHeaders, csvFirstRow);

        // firstRow --> invisible field = 1 --> true
        expect(aux.getInvisible(row)).toBe(true); 
    });
});

describe('getSeeAll function testing', () => {
    it ('should return false for the first row of the csv', () => {
        var csvHeaders  = [ 'fullname', 'eid', 'class', 'class', 'email Responsável, Pai', 'phone Pai',
                            'phone Responsável, Mãe', 'email Mãe', 'email Aluno', 'phone Aluno', 'invisible', 'see_all' ],
            csvFirstRow = [ 'John Doe 1', '1234', 'Sala 1 / Sala 2', 'Sala 3', 'johndoepai1@gmail.com :)', '11 22221',
                            '(11) 38839332', 'johndoemae1@gmail.com', 'johndoealuno1@gmail.com', 'hahaha', '1', '' ],
            row         = aux.getRow(csvHeaders, csvFirstRow);

        // firstRow --> see_all = '' (empty) --> false
        expect(aux.getSeeAll(row)).toBe(false);
    });
});
