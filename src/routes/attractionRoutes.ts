import express, { Request, Response } from 'express';
import Attraction from '../models/attractionModel'; // The model we will create
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import upload from '../middlewares/multerMiddleware';

const router = express.Router();

router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<void> => {

  console.log("teeest", req.body, req.file);
  try {
    // Retrieve form data from req.body
    const { name, description, city, tags } = req.body;

    // Check if all required fields are present and if an image is uploaded
    if (!name || !description || !city || !tags || !req.file) {
      res.status(400).json({ error: 'All fields are required, including the image' });
      return; // End the request here if validation fails
    }

    // Store the image URL (or file path) in your database (MongoDB in this case)
    const newAttraction = new Attraction({
      name,
      description,
      city,
      tags,
      imageUrl: req.file.path, // Store the file path or URL in MongoDB
    });

    await newAttraction.save(); // Wait for the attraction to be saved

    res.status(201).json({ message: 'Attraction created successfully', attraction: newAttraction });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error });
  }
});

// GET: List all attractions
router.get('/', authenticateJWT, authorizeRoles(['admin', 'superAdmin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const attractions = await Attraction.find();
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// GET: Fetch a specific attraction by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const attraction = await Attraction.findById(id);

    if (!attraction) {
      res.status(404).json({ error: 'Attraction not found' });
      return;
    }

    res.json(attraction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT: Update attraction by ID
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const updatedAttraction = await Attraction.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedAttraction) {
      res.status(404).json({ error: 'Attraction not found' });
      return;
    }

    res.json({ message: 'Attraction updated successfully', attraction: updatedAttraction });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE: Delete attraction by ID
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedAttraction = await Attraction.findByIdAndDelete(id);

    if (!deletedAttraction) {
      res.status(404).json({ error: 'Attraction not found' });
      return;
    }

    res.json({ message: 'Attraction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
