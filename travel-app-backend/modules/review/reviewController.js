const Review = require("./reviewModel");
const Transaction = require("../finance/financeModel");
const Driver = require("../driver/driverModel");

// ─── Helper: Update Driver Average Rating ───────────────────────────────────
const updateDriverRating = async (driverId) => {
  const reviews = await Review.find({ driverId, isApproved: true });
  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, r) => sum + r.ratings.overallRating, 0) /
      reviews.length;
    await Driver.findByIdAndUpdate(driverId, {
      rating: parseFloat(avgRating.toFixed(1)),
    });
  }
};

// ─── @desc    Submit Review
// ─── @route   POST /api/reviews
// ─── @access  Protected
const createReview = async (req, res) => {
  try {
    const {
      driverId,
      destinationId,
      transactionId,
      overallRating,
      driverRating,
      destinationRating,
      valueForMoney,
      reviewTitle,
      reviewText,
    } = req.body;

    if (!driverId || !transactionId || !overallRating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: "driverId, transactionId, overallRating, and reviewText are required",
      });
    }

    // Verify transaction is completed
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.bookingStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed trips",
      });
    }

    // Verify the transaction belongs to this user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This transaction does not belong to you",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ transactionId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this trip",
      });
    }

    // Handle review images
    let reviewImagePaths = [];
    if (req.files && req.files.length > 0) {
      reviewImagePaths = req.files.map((file) => file.path.replace(/\\/g, "/"));
    }

    const review = await Review.create({
      userId: req.user._id,
      driverId,
      destinationId,
      transactionId,
      ratings: {
        overallRating: Number(overallRating),
        driverRating: Number(driverRating) || undefined,
        destinationRating: Number(destinationRating) || undefined,
        valueForMoney: Number(valueForMoney) || undefined,
      },
      reviewTitle,
      reviewText,
      reviewImages: reviewImagePaths,
      isVerified: true,
    });

    // Update driver rating
    await updateDriverRating(driverId);

    const populated = await Review.findById(review._id)
      .populate("userId", "fullName profileImage")
      .populate("driverId", "fullName")
      .populate("destinationId", "name");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get All Reviews
// ─── @route   GET /api/reviews
// ─── @access  Public
const getAllReviews = async (req, res) => {
  try {
    const { sort = "-createdAt", page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const total = await Review.countDocuments({ isApproved: true });

    const reviews = await Review.find({ isApproved: true })
      .populate("userId", "fullName profileImage")
      .populate("driverId", "fullName")
      .populate("destinationId", "name")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Reviews By Driver
// ─── @route   GET /api/reviews/driver/:driverId
// ─── @access  Public
const getDriverReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      driverId: req.params.driverId,
      isApproved: true,
    })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Get Reviews By Destination
// ─── @route   GET /api/reviews/destination/:destinationId
// ─── @access  Public
const getDestinationReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      destinationId: req.params.destinationId,
      isApproved: true,
    })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Get User Reviews
// ─── @route   GET /api/reviews/user/:userId
// ─── @access  Protected
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .populate("driverId", "fullName")
      .populate("destinationId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Get Single Review
// ─── @route   GET /api/reviews/:id
// ─── @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "fullName profileImage")
      .populate("driverId", "fullName")
      .populate("destinationId", "name");

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Update Review
// ─── @route   PUT /api/reviews/:id
// ─── @access  Protected (own review)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this review" });
    }

    const { overallRating, driverRating, destinationRating, valueForMoney, reviewTitle, reviewText } = req.body;

    let reviewImagePaths = review.reviewImages;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path.replace(/\\/g, "/"));
      reviewImagePaths = [...reviewImagePaths, ...newImages];
    }

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      {
        "ratings.overallRating": overallRating || review.ratings.overallRating,
        "ratings.driverRating": driverRating || review.ratings.driverRating,
        "ratings.destinationRating": destinationRating || review.ratings.destinationRating,
        "ratings.valueForMoney": valueForMoney || review.ratings.valueForMoney,
        reviewTitle: reviewTitle || review.reviewTitle,
        reviewText: reviewText || review.reviewText,
        reviewImages: reviewImagePaths,
      },
      { new: true }
    ).populate("userId", "fullName profileImage");

    await updateDriverRating(review.driverId);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Delete Review
// ─── @route   DELETE /api/reviews/:id
// ─── @access  Protected / Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await Review.findByIdAndDelete(req.params.id);
    await updateDriverRating(review.driverId);

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Approve / Reject Review
// ─── @route   PATCH /api/reviews/:id/approve
// ─── @access  Admin Only
const approveReview = async (req, res) => {
  try {
    const { isApproved, adminNote } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isApproved = isApproved;
    if (adminNote) review.adminNote = adminNote;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? "approved" : "rejected"}`,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Mark Review as Helpful
// ─── @route   PATCH /api/reviews/:id/helpful
// ─── @access  Protected
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Marked as helpful",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getDriverReviews,
  getDestinationReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  markHelpful,
};