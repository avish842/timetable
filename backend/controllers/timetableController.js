const Timetable = require("../models/Timetable");
const Room = require("../models/Room");
const { createTimetableWithSlots } = require("../services/timetableService");

/**
 * POST /api/timetable/create
 * Create timetable and auto-generate empty slots.
 */
exports.createTimetable = async (req, res, next) => {
  try {
    const { roomId, days, periodsPerDay, startTime, periodDuration } = req.body;

    // Validation
    if (!roomId || !days || !periodsPerDay || !startTime || !periodDuration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: roomId, days, periodsPerDay, startTime, periodDuration.",
      });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    // Check if timetable already exists for this room
    const existing = await Timetable.findOne({ roomId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A timetable already exists for this room. Delete it first to create a new one.",
      });
    }

    const timetable = await createTimetableWithSlots({
      roomId,
      days,
      periodsPerDay,
      startTime,
      periodDuration,
      createdBy: req.user.userId,
    });

    const populated = await Timetable.findById(timetable._id).populate("roomId", "name");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/timetable/:roomId
 * Get timetable by room ID.
 */
exports.getTimetableByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const timetable = await Timetable.findOne({ roomId })
      .populate("roomId", "name capacity")
      .populate("createdBy", "username");

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this room.",
      });
    }

    res.json({ success: true, data: timetable });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/timetable/:id
 * Delete a timetable and all its associated slots.
 */
exports.deleteTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found.",
      });
    }

    // Delete all slots first
    const Slot = require("../models/Slot");
    await Slot.deleteMany({ timetableId: timetable._id });

    // Delete the timetable
    await Timetable.findByIdAndDelete(id);

    res.json({ success: true, message: "Timetable deleted successfully" });
  } catch (error) {
    next(error);
  }
};

