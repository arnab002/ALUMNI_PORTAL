import TimetableModel from '../../models/Timetable.js'

const AddTimetable = async (req, res) => {
    try {
        const timetable = await TimetableModel.create(req.body);

        if (timetable) {
            res.status(200).json({ success: true, message: 'Timetable Published Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const TimetableDetails = async (req, res) => {
    TimetableModel.find()
        .then(timetable => res.json(timetable))
        .catch(err => res.json(err))
}

const FilteredTimetableDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let timetable = await TimetableModel.find(searchParams);
        if (!timetable) {
            return res.status(400).json({ success: false, message: "No Timetable Found" });
        }
        const data = {
            success: true,
            message: "Timetable Found!",
            timetable,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const SingleTimetableDetails = async (req, res) => {
    TimetableModel.findById(req.params.id)
        .then(timetable => res.json(timetable))
        .catch(err => res.json(err))
}

const TimetableCount = async (req, res) => {
    try {
        const searchParams = req.query;
        let timetables;

        if (Object.keys(searchParams).length === 0) {
            timetables = await TimetableModel.countDocuments();
        } else {
            timetables = await TimetableModel.countDocuments(searchParams);
        }

        const data = {
            success: true,
            message: "Count Successful!",
            timetables,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditTimetable = async (req, res) => {
    try {
        const existingTimetable = await TimetableModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingTimetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }

        res.status(200).json({ success: true, message: 'Timetable Updated Successfully' });

    } catch (error) {
        console.error('Error updating Timetable', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteTimetable = async (req, res) => {
    try {
        const deletedTimetable = await TimetableModel.findByIdAndDelete(req.params.id);

        if (!deletedTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        return res.status(200).json({ message: 'Timetable deleted successfully' });

    } catch (error) {
        console.error('Error deleting Timetable', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddTimetable, FilteredTimetableDetails, TimetableCount, TimetableDetails, SingleTimetableDetails, EditTimetable, DeleteTimetable};