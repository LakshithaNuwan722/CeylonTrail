const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// ─── Import Models ───────────────────────────────────────────────────────────
const User = require("../modules/user/userModel");
const Driver = require("../modules/driver/driverModel");
const Destination = require("../modules/destination/destinationModel");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("🌱 Seeding demo data...\n");

    // ─── Create Demo Users ───────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(12);

    const existingUser = await User.findOne({ email: "demo@traveler.com" });
    if (!existingUser) {
      await User.create({
        fullName: "Demo Traveler",
        email: "demo@traveler.com",
        password: await bcrypt.hash("Demo@123", salt),
        phone: "+94771234567",
        role: "traveler",
      });
      console.log("✅ Demo User created");
      console.log("   Email: demo@traveler.com | Password: Demo@123");
    } else {
      console.log("⚠️  Demo User already exists");
    }

    // ─── Create Demo Destinations ────────────────────────────────────────────
    const destCount = await Destination.countDocuments();
    if (destCount === 0) {
      const destinations = [
        {
          name: "Sigiriya Rock Fortress",
          description:
            "An ancient rock fortress and palace ruin in the central Matale District. A UNESCO World Heritage Site surrounded by gardens, ponds and alleys.",
          location: "Sigiriya",
          country: "Sri Lanka",
          category: "cultural",
          entryFee: 30,
          bestTimeToVisit: "November to April",
          climate: "Tropical",
          popularAttractions: ["Rock Fortress", "Frescoes", "Lion Gate", "Mirror Wall"],
          isActive: true,
        },
        {
          name: "Mirissa Beach",
          description:
            "A stunning beach on the southern coast of Sri Lanka, famous for whale watching, surfing and beautiful sunsets.",
          location: "Mirissa",
          country: "Sri Lanka",
          category: "beach",
          entryFee: 0,
          bestTimeToVisit: "November to April",
          climate: "Tropical",
          popularAttractions: ["Whale Watching", "Surfing", "Coconut Tree Hill"],
          isActive: true,
        },
        {
          name: "Ella Rock",
          description:
            "A scenic mountain hike offering breathtaking views of tea plantations and the surrounding hills.",
          location: "Ella",
          country: "Sri Lanka",
          category: "mountain",
          entryFee: 0,
          bestTimeToVisit: "January to April",
          climate: "Cool & Misty",
          popularAttractions: ["Ella Rock Hike", "Nine Arch Bridge", "Little Adam Peak"],
          isActive: true,
        },
        {
          name: "Galle Fort",
          description:
            "A historic fortification on the southwestern tip of Sri Lanka, built by the Portuguese and later fortified by the Dutch.",
          location: "Galle",
          country: "Sri Lanka",
          category: "cultural",
          entryFee: 0,
          bestTimeToVisit: "December to March",
          climate: "Warm",
          popularAttractions: ["Dutch Fort", "Lighthouse", "Churches", "Museums"],
          isActive: true,
        },
        {
          name: "Yala National Park",
          description:
            "Sri Lanka's most visited national park, home to leopards, elephants, crocodiles and hundreds of bird species.",
          location: "Yala",
          country: "Sri Lanka",
          category: "wildlife",
          entryFee: 25,
          bestTimeToVisit: "February to July",
          climate: "Dry",
          popularAttractions: ["Leopard Safari", "Bird Watching", "Elephants", "Crocodiles"],
          isActive: true,
        },
      ];

      await Destination.insertMany(destinations);
      console.log(`✅ ${destinations.length} Demo Destinations created`);
    } else {
      console.log(`⚠️  ${destCount} Destinations already exist`);
    }

    // ─── Create Demo Drivers ─────────────────────────────────────────────────
    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      const drivers = [
        {
          fullName: "Kamal Perera",
          email: "kamal@driver.com",
          phone: "+94771111111",
          licenseNumber: "LIC-2024-001",
          vehicle: {
            vehicleType: "car",
            vehicleName: "Toyota Camry",
            vehicleModel: "2022",
            plateNumber: "CAR-1234",
            capacity: 4,
            pricePerDay: 80,
          },
          availability: true,
          status: "active",
          rating: 4.5,
          totalTrips: 45,
        },
        {
          fullName: "Nimal Silva",
          email: "nimal@driver.com",
          phone: "+94772222222",
          licenseNumber: "LIC-2024-002",
          vehicle: {
            vehicleType: "van",
            vehicleName: "Toyota HiAce",
            vehicleModel: "2021",
            plateNumber: "VAN-5678",
            capacity: 8,
            pricePerDay: 120,
          },
          availability: true,
          status: "active",
          rating: 4.8,
          totalTrips: 78,
        },
        {
          fullName: "Ruwan Fernando",
          email: "ruwan@driver.com",
          phone: "+94773333333",
          licenseNumber: "LIC-2024-003",
          vehicle: {
            vehicleType: "SUV",
            vehicleName: "Toyota Land Cruiser",
            vehicleModel: "2023",
            plateNumber: "SUV-9012",
            capacity: 6,
            pricePerDay: 150,
          },
          availability: true,
          status: "active",
          rating: 4.2,
          totalTrips: 32,
        },
        {
          fullName: "Suresh Kumar",
          email: "suresh@driver.com",
          phone: "+94774444444",
          licenseNumber: "LIC-2024-004",
          vehicle: {
            vehicleType: "bus",
            vehicleName: "Ashok Leyland",
            vehicleModel: "2020",
            plateNumber: "BUS-3456",
            capacity: 25,
            pricePerDay: 200,
          },
          availability: false,
          status: "active",
          rating: 4.0,
          totalTrips: 120,
        },
      ];

      await Driver.insertMany(drivers);
      console.log(`✅ ${drivers.length} Demo Drivers created`);
    } else {
      console.log(`⚠️  ${driverCount} Drivers already exist`);
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("   🎉 Demo Data Seeding Complete!");
    console.log("═══════════════════════════════════════════════");
    console.log("\n   DEMO LOGIN CREDENTIALS:");
    console.log("   ─────────────────────────────────────────");
    console.log("   👤 User:       demo@traveler.com / Demo@123");
    console.log("   🛡️  SuperAdmin: superadmin@travelapp.com / Admin@123456");
    console.log("   ─────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();