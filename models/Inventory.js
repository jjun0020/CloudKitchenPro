//Inventory Schema

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    inventoryId: {
        type: String,
        unique: true,
        match: [/^I-\d{5}$/, 'Inventory Id must be I-XXXXX']
    },
    userId: [{ 
        type: mongoose.Schema.Types.ObjectId, //objectId is like a primary key
        ref: "Role" 
    }],
    ingredientName: {
        type: String,
        unique: true,
        required: [true, 'ingredientName is required'],
        minlength: [2, 'ingredientName must be at least 2 characters'],
        maxlength: [50, 'ingredientName cannot exceed 50 characters'],
        match: [/^[A-Za-z\s'-]+$/, 'Please enter a valid Ingredient name']
    },
    quantity: {
        type: Number,
        required: [true, 'quantity is required'],
        min: [0.001, "Quanitiy must be greater than 0"], // so user can enter 0.5
        max: [9999, "Quanitiy must be less than 9999"]
    },
    unit: {
        type: String,
        required: [true, 'unit is required'],
        enum: {
            values: ['pieces', 'kg', 'g', 'liters', 'cups', 'tbsp', 'tsp', 'dozen'],
            message: 'Please select a valid unit'
        }
    },
    category: {
        type: String,
        required: [true, 'category is required'],
        enum: {
            values: ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 'Beverages', 'Frozen', 'Canned', 'Other'],
            message: 'Please select a valid category'
        }
    },
    purchaseDate: {
        type: Date,
        required: [true, 'purchase is required'],
        validate: {
            validator: function (value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);  // reset time to midnight
                const purchase = new Date(value);
                purchase.setHours(0, 0, 0, 0);
                return purchase <= today;
            },
            message: "Purchase date cannot be in the future"
        }

    },
    expirationDate: {
        type: Date,
        required: [true, 'expirationDate is required'],
        validate: {
            validator: function (value) {
                return this.purchaseDate && value > this.purchaseDate;
            },
            message: "Expiration date should come after purchase date"
        }
    },
    location: {
        type: String,
        required: [true, 'location is required'],
        enum: {
            values: ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cupboard'],
            message: 'Please select a valid location'
        }
    },
    cost: {
        type: Number,
        required: [true, 'cost is required'],
        min: [0.01, 'Cost must be at least $0.01'],
        max: [999.99, 'Cost must not go up to 999.99']
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0.001, 'Stock must be at least $0.01'],
        max: [9999, 'Stock must not go up to 999.99']
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

//This generates a unique inventory ID
inventorySchema.pre('save', async function(next){
    if(this.isNew){ // this ensure only when creating a new inventory item

        const lastIngredient = await mongoose.model('Inventory').findOne({})
        .sort({inventoryId: -1}) //sort the order
        .exec(); 

        let newId = 1; // this is for when there are no inventory
        if(lastIngredient && lastIngredient.inventoryId){
            const lastNumber = parseInt(lastIngredient.inventoryId.split('-')[1]);
            newId = lastNumber + 1;
        }
        this.inventoryId = "I-" + newId.toString().padStart(5,'0');
    }
    next();
});

// Cross-collection data analysis
inventorySchema.index({ ingredientName: 1});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;

