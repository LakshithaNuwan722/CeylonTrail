const Driver = require("./driverModel");

// ─── @desc    Add New Driver
// ─── @route   POST /api/drivers
// ─── @access  Admin Only
const createDriver = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      licenseNumber,
      vehicleType,
      vehicleName,
      vehicleModel,
      plateNumber,
      capacity,
      pricePerDay,
    } = req.body;

    if (!fullName || !email || !phone || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, phone, and licenseNumber are required",
      });
    }

    // Check duplicate email or license
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { licenseNumber }],
    });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver with this email or license number already exists",
      });
    }

    // Handle file uploads
    let profileImagePath = null;
    let licenseImagePath = null;
    let vehicleImagePath = null;

    if (req.files) {
      if (req.files.profileImage) {
        profileImagePath = req.files.profileImage[0].path.replace(/\\/g, "/");
      }
      if (req.files.licenseImage) {
        licenseImagePath = req.files.licenseImage[0].path.replace(/\\/g, "/");
      }
      if (req.files.vehicleImage) {
        vehicleImagePath = req.files.vehicleImage[0].path.replace(/\\/g, "/");
      }
    }

    const driver = await Driver.create({
      fullName,
      email,
      phone,
      licenseNumber,
      profileImage: profileImagePath,
      licenseImage: licenseImagePath,
      vehicle: {
        vehicleType,
        vehicleName,
        vehicleModel,
        plateNumber,
        vehicleImage: vehicleImagePath,
        capacity: Number(capacity),
        pricePerDay: Number(pricePerDay),
      },
    });

    res.status(201).json({
      success: true,
      message: "Driver added successfully",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get All Drivers
// ─── @route   GET /api/drivers
// ─── @access  Public
const getAllDrivers = async (req, res) => {
  try {
    const { vehicleType, availability, status } = req.query;

    let filter = {};
    if (vehicleType) filter["vehicle.vehicleType"] = vehicleType;
    if (availability !== undefined) filter.availability = availability === "true";
    if (status) filter.status = status;

    const drivers = await Driver.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Single Driver
// ─── @route   GET /api/drivers/:id
// ─── @access  Public
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Update Driver
// ─── @route   PUT /api/drivers/:id
// ─── @access  Admin Only
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const {
      fullName,
      phone,
      vehicleType,
      vehicleName,
      vehicleModel,
      plateNumber,
      capacity,
      pricePerDay,
      availability,
      status,
    } = req.body;

    // Handle file uploads
    let profileImagePath = driver.profileImage;
    let licenseImagePath = driver.licenseImage;
    let vehicleImagePath = driver.vehicle.vehicleImage;

    if (req.files) {
      if (req.files.profileImage) {
        profileImagePath = req.files.profileImage[0].path.replace(/\\/g, "/");
      }
      if (req.files.licenseImage) {
        licenseImagePath = req.files.licenseImage[0].path.replace(/\\/g, "/");
      }
      if (req.files.vehicleImage) {
        vehicleImagePath = req.files.vehicleImage[0].path.replace(/\\/g, "/");
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        fullName: fullName || driver.fullName,
        phone: phone || driver.phone,
        profileImage: profileImagePath,
        licenseImage: licenseImagePath,
        availability: availability !== undefined ? availability : driver.availability,
        status: status || driver.status,
        vehicle: {
          vehicleType: vehicleType || driver.vehicle.vehicleType,
          vehicleName: vehicleName || driver.vehicle.vehicleName,
          vehicleModel: vehicleModel || driver.vehicle.vehicleModel,
          plateNumber: plateNumber || driver.vehicle.plateNumber,
          vehicleImage: vehicleImagePath,
          capacity: capacity ? Number(capacity) : driver.vehicle.capacity,
          pricePerDay: pricePerDay ? Number(pricePerDay) : driver.vehicle.pricePerDay,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Delete Driver
// ─── @route   DELETE /api/drivers/:id
// ─── @access  Admin Only
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Toggle Driver Availability
// ─── @route   PATCH /api/drivers/:id/availability
// ─── @access  Admin Only
const toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.availability = !driver.availability;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver is now ${driver.availability ? "available" : "unavailable"}`,
      data: driver,
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
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  toggleAvailability,
};