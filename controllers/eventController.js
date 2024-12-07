const Event = require("../models/Event");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const User = require("../models/userModel");


dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP,   
  },
});


const sendBookingConfirmationEmail = async (userEmail, userName, event, ticketCount) => {
  const mailOptions = {
    to: userEmail, 
    subject: 'Your Ticket Booking Confirmation',
    text: `
      Dear ${userName},

      We are pleased to confirm your ticket booking for the upcoming event:

      Event: ${event.name}
      Tickets Booked: ${ticketCount} ticket(s)
      Date: ${new Date(event.date).toLocaleDateString()}
      Time: ${new Date(event.date).toLocaleTimeString()}
      Location: ${event.location}

      Your booking has been successfully processed, and your tickets are now secured. Please keep this email as a reference for your records.
 Should you need any further assistance, feel free to contact us. We look forward to seeing you at the event!

      Best regards,
      Your Event Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent!');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};



exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events.", error });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const events = await Event.findById(id);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events.", error });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      organizer,
      seats,
      date,
      time,
      location,
      price,
    } = req.body;

    const seatsNumber = parseInt(seats, 10);
    if (isNaN(seatsNumber)) {
      return res.status(400).json({ message: "Seats must be a valid number." });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const event = await Event.create({
      name: title,
      description,
      organizer,
      seats: seatsNumber,
      date: eventDate,
      pricePerSeat: price,
      time,
      location,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res
      .status(400)
      .json({ message: "Error creating event.", error: error.message });
  }
};
``;

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: "Error updating event.", error });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Error deleting event.", error });
  }
};

exports.getEventsByOrganizer = async (req, res) => {
  try {
    const { id } = req.params; 
    const events = await Event.find({ organizer: id });

    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this organizer." });
    }

    res.status(200).json(events); 
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Error fetching events", error });
  }
};

exports.bookTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketCount, paymentMethodId } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.seats < ticketCount) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const totalPrice = ticketCount * event.pricePerSeat;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    event.seats -= ticketCount;
    await event.save();

    const user = await User.findById(userId); 
    await sendBookingConfirmationEmail(user.email, user.name, event, ticketCount);
    console.log("Email sent successfully!");

    res.status(200).json({
      message: `Successfully booked ${ticketCount} ticket(s) for Rs. ${totalPrice}`,
      remainingSeats: event.seats,
      paymentStatus: paymentIntent.status,
    });
  } catch (err) {
    console.error("Error booking tickets:", err);

    if (err.type === "StripeCardError") {
      return res.status(400).json({ message: "Payment failed, card declined" });
    }

    res.status(500).json({ message: "Server error" });
  }
};
