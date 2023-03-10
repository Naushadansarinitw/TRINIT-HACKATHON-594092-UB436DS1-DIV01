const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const secretkey  = process.env.SECRETKEY;

// Creating the Schema for Philanthropic 
const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not valid email address')
            }
        }
    },
    password: {
        type: String,
        minlength: 6
    },
    cpassword: {
        type: String,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],

    anotherdata: Array

});

//  to hash the password before saving in to the database

ngoSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password , 12);
        this.cpassword = await bcrypt.hash(this.cpassword , 12);
    }

    next();
})


// token generate process

ngoSchema.methods.generateAuthToken = async function() {
    try {
        let token = jwt.sign({ _id: this._id }, secretkey);
        // console.log(this._id)
        // console.log(this.tokens);
        // console.log(token);
        this.tokens = this.tokens.concat({token});
        await this.save();
        console.log(this.tokens);
        return token;
    } catch (error) {
        console.log(error);
    }
}


// userSchema.methods.addcartdata = async function(cart){
//     try {
//         this.carts = this.carts.concat(cart);
//         await this.save();
//         return this.carts;
//     } catch (error) {
//         console.log(error);
//     }
// }

ngoSchema.methods.addngoinfo = async function(ngoData){
    try {
        this.anotherdata = this.anotherdata.concat(ngoData);
        await this.save();
        return this.anotherdata;
    } catch (error) {
        res.status(401).json({ error: 'Invalid details' });
    }
}


// Export the Models

const NGO = new mongoose.model('NGO',ngoSchema);

module.exports = NGO;