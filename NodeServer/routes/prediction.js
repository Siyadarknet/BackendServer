const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  SavePrediction,
  getPredictionHistory,
} = require("../controllers/prediction");

router.post("/predict", verifyToken, SavePrediction);
router.get("/predictions", verifyToken, getPredictionHistory);

module.exports = router;
