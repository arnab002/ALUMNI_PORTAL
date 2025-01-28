import BookModel from '../../../models/Book.js'

const AddBook = async (req, res) => {
    try {
        let book = await BookModel.findOne({
            isbnNo: req.body.isbnNo,
        });
        if (book) {
            return res.status(400).json({
                success: false,
                message: "Book With This ISBN No. Already Exists",
            });
        }
        book = await BookModel.create(req.body);
        const data = {
            success: true,
            message: "Book Details Added!",
            book,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const BookDetails = async (req, res) => {
    BookModel.find()
        .then(books => res.json(books))
        .catch(err => res.json(err))
}

const SingleBookDetails = async (req, res) => {
    BookModel.findById(req.params.id)
        .then(books => res.json(books))
        .catch(err => res.json(err))
}

const BookCount = async (req, res) => {
    try {
        let books = await BookModel.countDocuments();
        const data = {
            success: true,
            message: "Count Successfull!",
            books,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredBookDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let book = await BookModel.find(searchParams);
        if (!book) {
            return res.status(400).json({ success: false, message: "No book Found" });
        }
        const data = {
            success: true,
            message: "book Details Found!",
            book,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditBook = async (req, res) => {
    try {
        const existingBook = await BookModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ success: true, message: 'Book Updated Successfully' });

    } catch (error) {
        console.error('Error updating Book', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteBook = async (req, res) => {
    try {
        const deletedBook = await BookModel.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        return res.status(200).json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Error deleting Book', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const BookStockStatus = async (req, res) => {
    const { bookId } = req.params;
    const { status } = req.body;

    try {
        const updatedBook = await BookModel.findByIdAndUpdate(
            bookId,
            { status },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(updatedBook);
    } catch (error) {
        console.error('Error updating book status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default {AddBook, BookDetails, SingleBookDetails, BookCount, FilteredBookDetails, EditBook, DeleteBook, BookStockStatus};