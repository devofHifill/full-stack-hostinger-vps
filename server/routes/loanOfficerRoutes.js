import express from "express";
import LoanOfficer from "../models/LoanOfficer.js";

const router = express.Router();

/**
 * GET /api/loan-officers
 * Get all loan officers
 */
router.get("/", async (req, res) => {
  try {
    const officers = await LoanOfficer.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      count: officers.length,
      rows: officers,
    });
  } catch (error) {
    console.error("GET loan officers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officers",
    });
  }
});

/**
 * GET /api/loan-officers/html
 * Get generated HTML from DB records
 */
router.get("/html", async (req, res) => {
  try {
    const officers = await LoanOfficer.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 });

    const escapeHtml = (str = "") =>
      String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const items = officers
      .map(
        (officer) => `
  <li>
    <strong>${escapeHtml(officer.name)}</strong><br>
    ${escapeHtml(officer.title)}, NMLS ${escapeHtml(officer.nmls)}<br>
    <a href="${escapeHtml(officer.appointmentUrl)}" target="_blank" rel="noopener noreferrer">Make Your Appointment</a><br>
    <a href="${escapeHtml(officer.profileUrl)}" target="_blank" rel="noopener noreferrer">Know More</a>
  </li>`
      )
      .join("\n");

    const html = `<p><strong>Sure!</strong> Please select one of our loan officers to schedule your appointment:</p>
<ul>
${items}
</ul>`;

    res.json({
      success: true,
      html,
    });
  } catch (error) {
    console.error("GET loan officers HTML error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate HTML",
    });
  }
});

/**
 * GET /api/loan-officers/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const officer = await LoanOfficer.findById(req.params.id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Loan officer not found",
      });
    }

    res.json({
      success: true,
      row: officer,
    });
  } catch (error) {
    console.error("GET loan officer by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officer",
    });
  }
});

/**
 * POST /api/loan-officers
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      title,
      nmls,
      appointmentUrl,
      profileUrl,
      sortOrder,
      isActive,
    } = req.body;

    if (!name || !title || !nmls || !appointmentUrl || !profileUrl) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const officer = await LoanOfficer.create({
      name: name.trim(),
      title: title.trim(),
      nmls: nmls.trim(),
      appointmentUrl: appointmentUrl.trim(),
      profileUrl: profileUrl.trim(),
      sortOrder: Number(sortOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: "Loan officer created successfully",
      row: officer,
    });
  } catch (error) {
    console.error("POST loan officer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create loan officer",
    });
  }
});

/**
 * PUT /api/loan-officers/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      title,
      nmls,
      appointmentUrl,
      profileUrl,
      sortOrder,
      isActive,
    } = req.body;

    if (!name || !title || !nmls || !appointmentUrl || !profileUrl) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const officer = await LoanOfficer.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        title: title.trim(),
        nmls: nmls.trim(),
        appointmentUrl: appointmentUrl.trim(),
        profileUrl: profileUrl.trim(),
        sortOrder: Number(sortOrder || 0),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      { new: true, runValidators: true }
    );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Loan officer not found",
      });
    }

    res.json({
      success: true,
      message: "Loan officer updated successfully",
      row: officer,
    });
  } catch (error) {
    console.error("PUT loan officer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update loan officer",
    });
  }
});

/**
 * DELETE /api/loan-officers/:id
 * Soft delete
 */
router.delete("/:id", async (req, res) => {
  try {
    const officer = await LoanOfficer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Loan officer not found",
      });
    }

    res.json({
      success: true,
      message: "Loan officer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE loan officer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete loan officer",
    });
  }
});

export default router;