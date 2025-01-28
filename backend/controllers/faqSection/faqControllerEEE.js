import FaqEEEModel from '../../models/FaqEEE.js'

const AddFAQ = async (req, res) => {
    try {
        const FAQ = await FaqEEEModel.create(req.body);

        if (FAQ) {
            res.status(200).json({ success: true, message: 'FAQ Saved Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const FAQDetails = async (req, res) => {
    FaqEEEModel.find()
        .then(faqs => res.json(faqs))
        .catch(err => res.json(err))
}

const SingleFAQDetails = async (req, res) => {
    FaqEEEModel.findById(req.params.id)
        .then(faq => res.json(faq))
        .catch(err => res.json(err))
}

const EditFAQ = async (req, res) => {
    try {
        const existingFAQ = await FaqEEEModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingFAQ) {
            return res.status(404).json({ error: 'FAQ not found' });
        }

        res.status(200).json({ success: true, message: 'FAQ Updated Successfully' });

    } catch (error) {
        console.error('Error updating FAQ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteFAQ = async (req, res) => {
    try {
        const deletedFAQ = await FaqEEEModel.findByIdAndDelete(req.params.id);

        if (!deletedFAQ) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        return res.status(200).json({ message: 'FAQ deleted successfully' });

    } catch (error) {
        console.error('Error deleting FAQ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddFAQ, FAQDetails, SingleFAQDetails, EditFAQ, DeleteFAQ};