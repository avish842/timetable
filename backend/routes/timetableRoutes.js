const router = require("express").Router();
const { createTimetable, getTimetableByRoom, deleteTimetable } = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.post("/create", authMiddleware, allowRoles("SUPER_ADMIN"), createTimetable);
router.get("/:roomId", authMiddleware, getTimetableByRoom);
router.delete("/:id", authMiddleware, allowRoles("SUPER_ADMIN"), deleteTimetable);

module.exports = router;
