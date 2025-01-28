import FacultyModel from '../../models/Faculty.js'

const AddFaculty = async (req, res) => {
    try {
        let user = await FacultyModel.findOne({
            facultyId: req.body.facultyId,
        });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Faculty With This Enrollment Already Exists",
            });
        }
        user = await FacultyModel.create(req.body);
        const data = {
            success: true,
            message: "Faculty Details Added!",
            user,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredFacultyDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let faculty = await FacultyModel.find(searchParams);
        if (!faculty) {
            return res.status(400).json({ success: false, message: "No Faculty Found" });
        }
        const data = {
            success: true,
            message: "Faculty Details Found!",
            faculty,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const ChangeProfilePicture = async (req, res) => {
    const { fileDownloadURL } = req.body;
    const { user } = req.params;

    try {
        const existingUser = await FacultyModel.findOne({ email: user });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await FacultyModel.updateOne({ email: user }, { $set: { profile: fileDownloadURL } });

        res.status(200).json({ success: true, message: 'Profile Picture changed successfully' });
    } catch (error) {
        console.error('Error changing profile picture', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const FacultyDetails = async (req, res) => {
    FacultyModel.find()
        .then(faculties => res.json(faculties))
        .catch(err => res.json(err))
}

const SingleFacultyDetails = async (req, res) => {
    FacultyModel.findById(req.params.id)
        .then(faculties => res.json(faculties))
        .catch(err => res.json(err))
}

const FacultyCount = async (req, res) => {
    try {
        let faculties = await FacultyModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            faculties,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditFaculty = async (req, res) => {
    try {
        const existingFaculty = await FacultyModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingFaculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        res.status(200).json({ success: true, message: 'Faculty Updated Successfully' });

    } catch (error) {
        console.error('Error updating Faculty', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteFaculty = async (req, res) => {
    try {
        const deletedFaculty = await FacultyModel.findByIdAndDelete(req.params.id);

        if (!deletedFaculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        return res.status(200).json({ message: 'Faculty deleted successfully' });

    } catch (error) {
        console.error('Error deleting Faculty', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddFaculty, FilteredFacultyDetails, ChangeProfilePicture, FacultyDetails, SingleFacultyDetails, FacultyCount, EditFaculty, DeleteFaculty};