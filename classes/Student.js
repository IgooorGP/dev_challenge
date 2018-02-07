/**
* This class represents a student.
*/
class Student {
    // fullname = students name
    // eid = unique id of the student
    // addresses = reference to an array of Address objects
    // invisible = true or false
    // see_all = true or false
    constructor(fullname, eid, classes, addresses, invisible, see_all) {
        this.fullname = fullname;
        this.eid = eid;
        this.classes = classes;
        this.addresses = addresses;
        this.invisible = invisible;
        this.see_all = see_all;
    }
}

module.exports = Student;
