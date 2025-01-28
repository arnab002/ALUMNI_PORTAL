import SubjectModel from '../../models/Subject.js'

const AddSubject = async (req, res) => {
    try {
        let subjects = await SubjectModel.findOne({
            subname: req.body.subname,
        });
        if (subjects) {
            const data = {
                success: false,
                message: "Already Exists!",
            };
            res.status(400).json(data);
        } else {
            await SubjectModel.create(req.body);
            const data = {
                success: true,
                message: "Subject Added!",
            };
            res.status(200).json(data);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const SubjectDetails = async (req, res) => {
    SubjectModel.find()
        .then(subjects => res.json(subjects))
        .catch(err => res.json(err))
}

const FilteredSubjectDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let subject = await SubjectModel.find(searchParams);
        if (!subject) {
            return res.status(400).json({ success: false, message: "No Subject Found" });
        }
        const data = {
            success: true,
            message: "Subject Details Found!",
            subject,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const SingleSubjectDetails = async (req, res) => {
    SubjectModel.findById(req.params.id)
        .then(subject => res.json(subject))
        .catch(err => res.json(err))
}

const SubjectCount = async (req, res) => {
    try {
        const searchParams = req.query;
        let subjects;

        if (Object.keys(searchParams).length === 0) {
            subjects = await SubjectModel.countDocuments();
        } else {
            subjects = await SubjectModel.countDocuments(searchParams);
        }

        const data = {
            success: true,
            message: "Count Successful!",
            subjects,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditSubject = async (req, res) => {
    try {
        const existingSubject = await SubjectModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({ success: true, message: 'Subject Updated Successfully' });

    } catch (error) {
        console.error('Error updating Subject', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteSubject = async (req, res) => {
    try {
        const deletedSubject = await SubjectModel.findByIdAndDelete(req.params.id);

        if (!deletedSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        return res.status(200).json({ message: 'Subject deleted successfully' });

    } catch (error) {
        console.error('Error deleting Subject', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddSubject, SubjectDetails, FilteredSubjectDetails, SingleSubjectDetails, SubjectCount, EditSubject, DeleteSubject};