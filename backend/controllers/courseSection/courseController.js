import CourseModel from '../../models/Course.js'

const AddCourse = async (req, res) => {
    try {
        const course = await CourseModel.create(req.body);

        if (course) {
            res.status(200).json({ success: true, message: 'Course Created Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const CourseDetails = async (req, res) => {
    CourseModel.find()
        .then(course => res.json(course))
        .catch(err => res.json(err))
}

const SingleCourseDetails = async (req, res) => {
    CourseModel.findById(req.params.id)
        .then(courses => res.json(courses))
        .catch(err => res.json(err))
}

const EditCourseDetails = async (req, res) => {
    try {
        const existingCourse = await CourseModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingCourse) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({ success: true, message: 'Course Updated Successfully' });

    } catch (error) {
        console.error('Error updating Course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteCourse = async (req, res) => {
    try {
        const deletedCourse = await CourseModel.findByIdAndDelete(req.params.id);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        return res.status(200).json({ message: 'Course deleted successfully' });

    } catch (error) {
        console.error('Error deleting Course', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddCourse, CourseDetails, SingleCourseDetails, EditCourseDetails, DeleteCourse};