import express, { Request, Response } from "express";
import Booking from "../models/bookingModel";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";


const router = express.Router();

router.post('/', authenticateJWT, authorizeRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  const { comment, carReg, fromDate, toDate } = req.body;

  if (!carReg || !fromDate || !toDate) {
    res.status(400).json({ error: 'Regnummer, från datum och till datum krävs' });
    return;
  }

  try {
    // Optional: prevent overlapping bookings
    const overlappingBooking = await Booking.findOne({
      carReg,
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlappingBooking) {
      res.status(400).json({ error: 'Bokningen överlappar med en annan bokning' });
      return;
    }

    const newBooking = new Booking({
      comment,
      carReg,
      fromDate,
      toDate,
      createdBy: req.user?.id,
    });

    await newBooking.save();

    res.status(201).json(newBooking);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/', authenticateJWT, authorizeRoles(['admin', 'superAdmin']), async (req: Request, res: Response): Promise<void> => {
    try {
      const query: any = {};

      if (req.query.earliest && req.query.latest) {
        query.$and = [
          { fromDate: { $lte: req.query.latest } },
          { toDate: { $gte: req.query.earliest } },
        ];
      } else if (req.query.earliest) {
        query.toDate = { $gte: req.query.earliest };
      } else if (req.query.latest) {
        query.fromDate = { $lte: req.query.latest };
      }

      // Search: by carReg or comment
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        query.$or = [
          { carReg: searchRegex },
          { comment: searchRegex },
        ];
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .sort({ fromDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName email roles');

      res.json({ bookings, total });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error });
    }
  }
);

router.get('/:id', authenticateJWT, authorizeRoles(["admin", "superAdmin"]), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate('createdBy', 'fullName email');

    if (!booking) {
      res.status(404).json({ error: `Booking not found with ID: ${id}` });
      return;
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.params)
    const { id } = req.params;

    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true }
    );

    if (!updatedBooking) {
      res.status(404).json({ error: "Booking not found for the specified date" });
      return;
    }

    res.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});


router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedBooking = await Booking.findOneAndDelete({ _id: id });

    if (!deletedBooking) {
      res.status(404).json({ error: `No booking found with ID: ${id}` });
      return;
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});



export default router;
