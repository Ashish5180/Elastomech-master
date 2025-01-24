import express from 'express';
import Note from '../models/notesModal.js';

const router = express.Router();

// Create a new note
router.post('/', async (req, res) => {
  const { content } = req.body;
  try {
    const newNote = new Note({
      content,
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: 'Error creating note', error: err.message });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching notes', error: err.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (deletedNote) {
      res.status(200).json({ message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Error deleting note', error: err.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedNote = await Note.findByIdAndUpdate(id, { content }, { new: true });
    if (updatedNote) {
      res.status(200).json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Error updating note', error: err.message });
  }
});

export default router;
