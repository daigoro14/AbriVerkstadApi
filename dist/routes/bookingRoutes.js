"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(['admin']), async (req, res) => {
    const { comment, carReg, fromDate, toDate } = req.body;
    if (!carReg || !fromDate || !toDate) {
        res.status(400).json({ error: 'Regnummer, från datum och till datum krävs' });
        return;
    }
    try {
        // Optional: prevent overlapping bookings
        const overlappingBooking = await bookingModel_1.default.findOne({
            carReg,
            $or: [
                { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
            ]
        });
        if (overlappingBooking) {
            res.status(400).json({ error: 'Bokningen överlappar med en annan bokning' });
            return;
        }
        const newBooking = new bookingModel_1.default({
            comment,
            carReg,
            fromDate,
            toDate,
            createdBy: req.user?.id,
        });
        await newBooking.save();
        res.status(201).json(newBooking);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(['admin', 'superAdmin']), async (req, res) => {
    try {
        const query = {};
        if (req.query.earliest && req.query.latest) {
            query.$and = [
                { fromDate: { $lte: req.query.latest } },
                { toDate: { $gte: req.query.earliest } },
            ];
        }
        else if (req.query.earliest) {
            query.toDate = { $gte: req.query.earliest };
        }
        else if (req.query.latest) {
            query.fromDate = { $lte: req.query.latest };
        }
        // Search: by carReg or comment
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { carReg: searchRegex },
                { comment: searchRegex },
            ];
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await bookingModel_1.default.countDocuments(query);
        const bookings = await bookingModel_1.default.find(query)
            .sort({ fromDate: 1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'fullName email roles');
        res.json({ bookings, total });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
    }
});
router.get('/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["admin", "superAdmin"]), async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await bookingModel_1.default.findById(id).populate('createdBy', 'fullName email');
        if (!booking) {
            res.status(404).json({ error: `Booking not found with ID: ${id}` });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.put("/:id", async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const updatedBooking = await bookingModel_1.default.findOneAndUpdate({ _id: id }, req.body, { new: true });
        if (!updatedBooking) {
            res.status(404).json({ error: "Booking not found for the specified date" });
            return;
        }
        res.json({ message: "Booking updated successfully", booking: updatedBooking });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBooking = await bookingModel_1.default.findOneAndDelete({ _id: id });
        if (!deletedBooking) {
            res.status(404).json({ error: `No booking found with ID: ${id}` });
            return;
        }
        res.json({ message: "Booking deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});
exports.default = router;
