import ShowEventModel from '../../models/ShowEvent.js'

const AddEventBlog = async (req, res) => {
    try {
        const event = await ShowEventModel.create(req.body);

        if (event) {
            res.status(200).json({ success: true, message: 'Event added Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const EventBlogDetails = async (req, res) => {
    ShowEventModel.find()
        .then(events => res.json(events))
        .catch(err => res.json(err))
}

const SingleEventBlogDetails = async (req, res) => {
    ShowEventModel.findById(req.params.id)
        .then(event => res.json(event))
        .catch(err => res.json(err))
}

const EditEventBlog = async (req, res) => {
    try {
        const existingEvent = await ShowEventModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event Updated Successfully' });

    } catch (error) {
        console.error('Error updating Event', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteEventBlog = async (req, res) => {
    try {
        const deletedEvent = await ShowEventModel.findByIdAndDelete(req.params.id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Error deleting ShowEvent', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddEventBlog, EventBlogDetails, SingleEventBlogDetails, EditEventBlog, DeleteEventBlog};