import FooterModel from "../../models/Footer.js"

const AddFooterDetails = async (req, res) => {
    try {
        const existingFooter = await FooterModel.findOne();

        if (existingFooter) {
            const updatedFooter = await FooterModel.findOneAndUpdate(
                {},
                { $set: req.body },
                { new: true }
            );

            res.status(200).json({ success: true, message: 'Footer Updated Successfully', data: updatedFooter });
        } else {
            const newFooter = await FooterModel.create(req.body);

            if (newFooter) {
                res.status(200).json({ success: true, message: 'Footer Created Successfully', data: newFooter });
            } else {
                res.status(401).json({ success: false, message: 'Process Failed' });
            }
        }
    } catch (error) {
        console.error('Error during creation or update', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const FooterDetails = async (req, res) => {
    FooterModel.find()
        .then(footer => res.json(footer))
        .catch(err => res.json(err))
}

export default {AddFooterDetails, FooterDetails};