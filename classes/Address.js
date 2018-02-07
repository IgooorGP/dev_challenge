/**
* This class represents an address of a student.
*/
class Address {
    // type = phone or email
    // tags = Responsavel, Pai, Mae, etc.
    // address = value of the address
    constructor(type, tags, address) {
        this.type = type;
        this.tags = tags;
        this.address = address;
    }
}

module.exports = Address;
