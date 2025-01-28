import StudentModel from '../../models/Student.js'

const AddStudent = async (req, res) => {
    try {
        let user = await StudentModel.findOne({
            enrollmentNo: req.body.enrollmentNo,
        });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Student With This Enrollment Already Exists",
            });
        }
        user = await StudentModel.create(req.body);
        const data = {
            success: true,
            message: "Student Details Added!",
            user,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredStudentDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let student = await StudentModel.find(searchParams);
        if (!student) {
            return res.status(400).json({ success: false, message: "No Student Found" });
        }
        const data = {
            success: true,
            message: "Student Details Found!",
            student,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredStudentDetailsByEnrollmentNo = async (req, res) => {
    const searchParams = req.body;
    try {
        let student = await StudentModel.find(searchParams);
        if (!student) {
            return res.status(400).json({ success: false, message: "No Student Found" });
        }
        const data = {
            success: true,
            message: "Student Details Found!",
            student,
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
        const existingUser = await StudentModel.findOne({ email: user });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await StudentModel.updateOne({ email: user }, { $set: { profile: fileDownloadURL } });

        res.status(200).json({ success: true, message: 'Profile Picture changed successfully' });
    } catch (error) {
        console.error('Error changing profile picture', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const StudentDetails = async (req, res) => {
    StudentModel.find()
        .then(students => res.json(students))
        .catch(err => res.json(err))
}

const SingleStudentDetails = async (req, res) => {
    StudentModel.findById(req.params.id)
        .then(students => res.json(students))
        .catch(err => res.json(err))
}

const StudentCount = async (req, res) => {
    try {
        let students = await StudentModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            students,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditStudent = async (req, res) => {
    try {
        const existingStudent = await StudentModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({ success: true, message: 'Student Updated Successfully' });

    } catch (error) {
        console.error('Error updating student', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteStudent = async (req, res) => {
    try {
        const deletedStudent = await StudentModel.findByIdAndDelete(req.params.id);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.status(200).json({ message: 'Student deleted successfully' });

    } catch (error) {
        console.error('Error deleting student', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddStudent, FilteredStudentDetails, FilteredStudentDetailsByEnrollmentNo, ChangeProfilePicture, StudentDetails, SingleStudentDetails, StudentCount, EditStudent, DeleteStudent};