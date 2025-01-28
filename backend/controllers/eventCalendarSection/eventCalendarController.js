import EventModel from "../../models/Event.js"

const AddEvent = async (req, res) => {
    try {
        const event = await EventModel.create(req.body);

        if (event) {
            res.status(200).json({ success: true, message: 'Event Saved Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const EventDetails = async (req, res) => {
    EventModel.find()
        .then(events => res.json(events))
        .catch(err => res.json(err))
}

const DeleteEvent = async (req, res) => {
    try {
        const { title, start } = req.body;

        const deletedEvent = await EventModel.findOneAndDelete({ title, start });

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(200).json({ message: 'Event deleted successfully', deletedEvent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddEvent, EventDetails, DeleteEvent};