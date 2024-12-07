const mongoose=require('mongoose')

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seats: {
        type: Number,
        required: true,
    },
    bookedSeats: { 
        type: Number, 
        default: 0 
    },
    pricePerSeat: { 
        type: Number, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports=mongoose.model('Event',EventSchema)