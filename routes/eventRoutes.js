const express = require('express');
const { getAllEvents, getEvents ,  createEvent, updateEvent, deleteEvent,getEventsByOrganizer,bookTicket } = require('../controllers/eventController');
const { verifyAdmin, verifyToken } = require('../middleware/auth');


const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEvents);
router.post('/', verifyAdmin, createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/organizer/:id',getEventsByOrganizer);

router.post('/book/:id',verifyToken, bookTicket);

module.exports = router;