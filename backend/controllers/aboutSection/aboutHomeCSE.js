import AboutCSEModel from '../../models/AboutCSE.js'

const AddAboutDetails = async (req, res) => {
    try {
        const existingAbout = await AboutCSEModel.findOne();

        if (existingAbout) {
            const updatedAbout = await AboutCSEModel.findOneAndUpdate(
                {},
                { $set: req.body },
                { new: true }
            );

            res.status(200).json({ success: true, message: 'About Updated Successfully', data: updatedAbout });
        } else {
            const newAbout = await AboutCSEModel.create(req.body);

            if (newAbout) {
                res.status(200).json({ success: true, message: 'About Created Successfully', data: newAbout });
            } else {
                res.status(401).json({ success: false, message: 'Process Failed' });
            }
        }
    } catch (error) {
        console.error('Error during creation or update', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const AboutDetails = async (req, res) => {
    AboutCSEModel.find()
        .then(about => res.json(about))
        .catch(err => res.json(err))
}

export default {AddAboutDetails, AboutDetails};