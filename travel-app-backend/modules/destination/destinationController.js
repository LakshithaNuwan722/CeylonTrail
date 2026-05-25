const Destination = require("./destinationModel");

// ─── @desc    Create New Destination
// ─── @route   POST /api/destinations
// ─── @access  Admin Only
const createDestination = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      country,
      category,
      entryFee,
      bestTimeToVisit,
      climate,
      popularAttractions,
    } = req.body;

    if (!name || !description || !location || !country || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, location, country, and category are required",
      });
    }

    // Handle multiple images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path.replace(/\\/g, "/"));
    }

    // Parse popularAttractions if sent as string
    let attractions = popularAttractions;
    if (typeof popularAttractions === "string") {
      attractions = popularAttractions.split(",").map((a) => a.trim());
    }

    const destination = await Destination.create({
      name,
      description,
      location,
      country,
      category,
      images: imagePaths,
      entryFee: entryFee || 0,
      bestTimeToVisit,
      climate,
      popularAttractions: attractions || [],
      createdBy: req.admin?._id,
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get All Destinations
// ─── @route   GET /api/destinations
// ─── @access  Public
const getAllDestinations = async (req, res) => {
  try {
    const { category, country, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (country) filter.country = { $regex: country, $options: "i" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Destination.countDocuments(filter);
    const destinations = await Destination.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: destinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Single Destination
// ─── @route   GET /api/destinations/:id
// ─── @access  Public
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Update Destination
// ─── @route   PUT /api/destinations/:id
// ─── @access  Admin Only
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const {
      name,
      description,
      location,
      country,
      category,
      entryFee,
      bestTimeToVisit,
      climate,
      popularAttractions,
      isActive,
    } = req.body;

    // Handle new images
    let imagePaths = destination.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path.replace(/\\/g, "/"));
      imagePaths = [...imagePaths, ...newImages];
    }

    // Parse popularAttractions
    let attractions = popularAttractions;
    if (typeof popularAttractions === "string") {
      attractions = popularAttractions.split(",").map((a) => a.trim());
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      {
        name: name || destination.name,
        description: description || destination.description,
        location: location || destination.location,
        country: country || destination.country,
        category: category || destination.category,
        images: imagePaths,
        entryFee: entryFee !== undefined ? entryFee : destination.entryFee,
        bestTimeToVisit: bestTimeToVisit || destination.bestTimeToVisit,
        climate: climate || destination.climate,
        popularAttractions: attractions || destination.popularAttractions,
        isActive: isActive !== undefined ? isActive : destination.isActive,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Delete Destination
// ─── @route   DELETE /api/destinations/:id
// ─── @access  Admin Only
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    await Destination.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};