const bookletService = require("../services/bookletService");

const createBooklet = async (req, res) => {

    try {

        const booklet = await bookletService.createBooklet({
            ...req.body,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Booklet created successfully",
            booklet
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getBooklets = async (req, res) => {

    try {

        const booklets = await bookletService.getBooklets();

        res.status(200).json({
            booklets
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getBookletById = async (req, res) => {

    try {

        const booklet = await bookletService.getBookletById(
            req.params.id
        );

        res.status(200).json({
            booklet
        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const updateBooklet = async (req, res) => {

    try {

        const booklet = await bookletService.updateBooklet(
            req.params.id,
            req.body
        );

        res.status(200).json({

            message: "Booklet updated successfully",

            booklet

        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const deleteBooklet = async (req, res) => {

    try {

        await bookletService.deleteBooklet(
            req.params.id
        );

        res.status(200).json({
            message: "Booklet deleted successfully"
        });

    } catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

module.exports = {
    createBooklet,
    getBooklets,
    getBookletById,
    updateBooklet,
    deleteBooklet
};