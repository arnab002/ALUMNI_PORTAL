import DepartmentModel from '../../models/Department.js'

const AddDepartment = async (req, res) => {
    try {
        let departments = await DepartmentModel.findOne({
            deptname: req.body.deptname,
        });
        if (departments) {
            const data = {
                success: false,
                message: "Already Exists!",
            };
            res.status(400).json(data);
        } else {
            await DepartmentModel.create(req.body);
            const data = {
                success: true,
                message: "Department Added!",
            };
            res.status(200).json(data);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const DepartmentDetails = async (req, res) => {
    DepartmentModel.find()
        .then(departments => res.json(departments))
        .catch(err => res.json(err))
}

const SingleDepartmentDetails = async (req, res) => {
    DepartmentModel.findById(req.params.id)
        .then(departments => res.json(departments))
        .catch(err => res.json(err))
}

const DepartmentCount = async (req, res) => {
    try {
        let departments = await DepartmentModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            departments,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditDepartment = async (req, res) => {
    try {
        const existingDepartment = await DepartmentModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.status(200).json({ success: true, message: 'Department Updated Successfully' });

    } catch (error) {
        console.error('Error updating Department', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteDepartment = async (req, res) => {
    try {
        const deletedDepartment = await DepartmentModel.findByIdAndDelete(req.params.id);

        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.status(200).json({ message: 'Department deleted successfully' });

    } catch (error) {
        console.error('Error deleting Department', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddDepartment, DepartmentDetails, SingleDepartmentDetails, DepartmentCount, EditDepartment, DeleteDepartment};