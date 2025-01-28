import StaffModel from '../../models/Staff.js'

const AddStaff = async (req, res) => {
    try {
        let user = await StaffModel.findOne({
            staffId: req.body.staffId,
        });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Staff With This Staff ID Already Exists",
            });
        }
        user = await StaffModel.create(req.body);
        const data = {
            success: true,
            message: "Staff Details Added!",
            user,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredStaffDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let staff = await StaffModel.find(searchParams);
        if (!staff) {
            return res.status(400).json({ success: false, message: "No Staff Found" });
        }
        const data = {
            success: true,
            message: "Staff Details Found!",
            staff,
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
        const existingUser = await StaffModel.findOne({ email: user });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await StaffModel.updateOne({ email: user }, { $set: { profile: fileDownloadURL } });

        res.status(200).json({ success: true, message: 'Profile Picture changed successfully' });
    } catch (error) {
        console.error('Error changing profile picture', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const StaffDetails = async (req, res) => {
    StaffModel.find()
        .then(staffs => res.json(staffs))
        .catch(err => res.json(err))
}

const SingleStaffDetails = async (req, res) => {
    StaffModel.findById(req.params.id)
        .then(staffs => res.json(staffs))
        .catch(err => res.json(err))
}

const StaffCount = async (req, res) => {
    try {
        let staffs = await StaffModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            staffs,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditStaff = async (req, res) => {
    try {
        const existingStaff = await StaffModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingStaff) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        res.status(200).json({ success: true, message: 'Staff Updated Successfully' });

    } catch (error) {
        console.error('Error updating Staff', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteStaff = async (req, res) => {
    try {
        const deletedStaff = await StaffModel.findByIdAndDelete(req.params.id);

        if (!deletedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        return res.status(200).json({ message: 'Staff deleted successfully' });

    } catch (error) {
        console.error('Error deleting Staff', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 

export default {AddStaff, FilteredStaffDetails, ChangeProfilePicture, StaffDetails, SingleStaffDetails, StaffCount, EditStaff, DeleteStaff};