import EnquiryModel from '../../models/Enquiry.js'

const SubmitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        const savedContact = await EnquiryModel.create(req.body);

        res.status(200).json({ message: 'Form submitted successfully', data: savedContact });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const EnquiryDetails = async (req, res) => {
    EnquiryModel.find()
        .then(enquiries => res.json(enquiries))
        .catch(err => res.json(err))
}

const DeleteEnquiry = async (req, res) => {
    try {
        const deletedEnquiry = await EnquiryModel.findByIdAndDelete(req.params.id);

        if (!deletedEnquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        return res.status(200).json({ message: 'Enquiry deleted successfully' });

    } catch (error) {
        console.error('Error deleting Enquiry', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const EnquiryCount = async (req, res) => {
    try {
        let enquiries = await EnquiryModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            enquiries,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export default {SubmitContactForm, EnquiryDetails, EnquiryCount, DeleteEnquiry};