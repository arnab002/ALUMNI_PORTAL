import AboutModel from "../../models/About.js"

const AddAbout = async (req, res) => {
    try {
        const existingAbout = await AboutModel.findOne();

        if (existingAbout) {
            const updatedAbout = await AboutModel.findOneAndUpdate(
                {},
                { $set: req.body },
                { new: true }
            );

            res.status(200).json({ success: true, message: 'About Updated Successfully', data: updatedAbout });
        } else {
            const newAbout = await AboutModel.create(req.body);

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
    AboutModel.find()
        .then(about => res.json(about))
        .catch(err => res.json(err))
}

export default {AddAbout , AboutDetails};