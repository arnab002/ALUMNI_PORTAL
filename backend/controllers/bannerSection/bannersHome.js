import BannerModel from "../../models/Banner.js"

const AddBanner = async (req, res) => {
    try {
        const banner = await BannerModel.create(req.body);

        if (banner) {
            res.status(200).json({ success: true, message: 'Banner Created Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const BannersDetails = async (req, res) => {
    BannerModel.find()
        .then(banners => res.json(banners))
        .catch(err => res.json(err))
}

const SingleBannerDetails = async (req, res) => {
    BannerModel.findById(req.params.id)
        .then(banners => res.json(banners))
        .catch(err => res.json(err))
}

const EditBannerDetails = async (req, res) => {
    try {
        const existingBanner = await BannerModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingBanner) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({ success: true, message: 'Banner Updated Successfully' });

    } catch (error) {
        console.error('Error updating Banner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteBannerDetails = async (req, res) => {
    try {
        const deletedBanner = await BannerModel.findByIdAndDelete(req.params.id);

        if (!deletedBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        return res.status(200).json({ message: 'Banner deleted successfully' });

    } catch (error) {
        console.error('Error deleting Banner', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default { AddBanner, BannersDetails, SingleBannerDetails, EditBannerDetails, DeleteBannerDetails };