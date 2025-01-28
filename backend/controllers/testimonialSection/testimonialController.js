import TestimonialModel from '../../models/Testimonial.js'

const AddTestimonial = async (req, res) => {
    try {
        const testimonial = await TestimonialModel.create(req.body);

        if (testimonial) {
            res.status(200).json({ success: true, message: 'Testimonial Created Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const TestimonialDetails = async (req, res) => {
    TestimonialModel.find()
        .then(testimonial => res.json(testimonial))
        .catch(err => res.json(err))
}

const SingleTestimonialDetails = async (req, res) => {
    TestimonialModel.findById(req.params.id)
        .then(testimonials => res.json(testimonials))
        .catch(err => res.json(err))
}

const EditTestimonial = async (req, res) => {
    try {
        const existingTestimonial = await TestimonialModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingTestimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        res.status(200).json({ success: true, message: 'Testimonial Updated Successfully' });

    } catch (error) {
        console.error('Error updating Testimonial:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteTestimonial = async (req, res) => {
    try {
        const deletedTestimonial = await TestimonialModel.findByIdAndDelete(req.params.id);

        if (!deletedTestimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        return res.status(200).json({ message: 'Testimonial deleted successfully' });

    } catch (error) {
        console.error('Error deleting Testimonial', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddTestimonial, TestimonialDetails, SingleTestimonialDetails, EditTestimonial, DeleteTestimonial};