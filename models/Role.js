//Role Schema
//Task 2: User Registration and Signup System
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters'],
        match: [/^[A-Za-z\s'-]+$/, 'Please enter a valid Full name']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['Admin', 'Chef', 'Manager'],
            message: 'Please select a valid role'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^(?:\+61|0)[2-478]\d{8}$/, 'Please enter a valid Australian phone number'] //reference: https://stackoverflow.com/questions/39990179/regex-for-australian-phone-number-validation
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Please Enter a valid password']
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

roleSchema.pre('save', async function (next) {
    if (this.isNew) { // this ensure only when creating a new inventory item

        const lastRole = await mongoose.model('Role').findOne({})
            .sort({ userId: -1 }) //sort the order
            .exec();

        let newId = 1; // this is for when there are no inventory
        if (lastRole && lastRole.userId) {
            const lastNumber = parseInt(lastRole.userId.split('-')[1]);
            newId = lastNumber + 1;
        }
        this.userId = "U-" + newId.toString().padStart(5, '0');
    }
    next();
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
