import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import OutboundContact from "../models/OutboundContact.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

function normalizeHeader(header = "") {
  return String(header).trim().toLowerCase().replace(/\s+/g, " ");
}

function mapRowKeys(rawRow) {
  const mapped = {};

  for (const [key, value] of Object.entries(rawRow || {})) {
    const h = normalizeHeader(key);

    if (["first name", "firstname", "first_name", "fname"].includes(h)) {
      mapped.firstName = value;
    } else if (["last name", "lastname", "last_name", "lname"].includes(h)) {
      mapped.lastName = value;
    } else if (["email", "email address", "emailaddress"].includes(h)) {
      mapped.email = value;
    } else if (
      ["phone", "phone number", "phonenumber", "mobile", "mobile number", "number"].includes(h)
    ) {
      mapped.phone = value;
    }
  }

  return mapped;
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "").trim();
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = "") {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildPreviewRow(rawRow, index) {
  const mapped = mapRowKeys(rawRow);

  const firstName = String(mapped.firstName || "").trim();
  const lastName = String(mapped.lastName || "").trim();
  const email = normalizeEmail(mapped.email || "");
  const phone = normalizePhone(mapped.phone || "");
  const fullName = `${firstName} ${lastName}`.trim();

  const errors = [];

  if (!firstName) errors.push("Missing first name");
  if (!phone) errors.push("Missing phone");
  if (email && !isValidEmail(email)) errors.push("Invalid email");
  if (phone && phone.length < 10) errors.push("Invalid phone");

  return {
    rowNumber: index + 2,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    emailValid: email ? isValidEmail(email) : false,
    phoneValid: phone ? phone.length >= 10 : false,
    duplicateKey: phone || email || "",
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * POST /api/outbound-contacts/upload-preview
 * multipart/form-data
 * field name: file
 */
router.post("/upload-preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({ error: "No worksheet found in file" });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!jsonRows.length) {
      return res.status(400).json({ error: "Uploaded file is empty" });
    }

    const previewRows = jsonRows.map((row, index) => buildPreviewRow(row, index));

    const duplicateKeys = previewRows
      .map((row) => row.duplicateKey)
      .filter(Boolean);

    const existingContacts = duplicateKeys.length
      ? await OutboundContact.find({
          duplicateKey: { $in: duplicateKeys },
          isDeleted: false,
        }).select("_id duplicateKey firstName lastName email phone")
      : [];

    const existingKeySet = new Set(existingContacts.map((doc) => doc.duplicateKey));

    const seenInFile = new Set();

    const rows = previewRows.map((row) => {
      const errors = [...row.errors];
      let isDuplicateInFile = false;
      let isDuplicateInDb = false;

      if (row.duplicateKey) {
        if (seenInFile.has(row.duplicateKey)) {
          isDuplicateInFile = true;
          errors.push("Duplicate in uploaded file");
        } else {
          seenInFile.add(row.duplicateKey);
        }

        if (existingKeySet.has(row.duplicateKey)) {
          isDuplicateInDb = true;
          errors.push("Duplicate in database");
        }
      }

      return {
        ...row,
        isDuplicateInFile,
        isDuplicateInDb,
        isValid: errors.length === 0,
        errors,
      };
    });

    const totalRows = rows.length;
    const validRows = rows.filter((r) => r.isValid).length;
    const invalidRows = totalRows - validRows;
    const duplicateInFileCount = rows.filter((r) => r.isDuplicateInFile).length;
    const duplicateInDbCount = rows.filter((r) => r.isDuplicateInDb).length;

    return res.json({
      fileName: req.file.originalname,
      totalRows,
      validRows,
      invalidRows,
      duplicateInFileCount,
      duplicateInDbCount,
      rows,
    });
  } catch (error) {
    console.error("POST /api/outbound-contacts/upload-preview error:", error);
    return res.status(500).json({
      error: "Failed to preview uploaded file",
      details: error.message,
    });
  }
});

/**
 * POST /api/outbound-contacts/import
 * body: {
 *   rows: [...preview rows...],
 *   duplicateMode: "skip" | "import_all"
 * }
 */
router.post("/import", async (req, res) => {
  try {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    const duplicateMode = req.body.duplicateMode || "skip";

    if (!rows.length) {
      return res.status(400).json({ error: "No rows provided for import" });
    }

    const uploadBatchId = `batch_${Date.now()}`;

    // Normalize all incoming rows first
    const normalizedRows = rows.map((row) => {
      const firstName = String(row.firstName || "").trim();
      const lastName = String(row.lastName || "").trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const email = normalizeEmail(row.email || "");
      const phone = normalizePhone(row.phone || "");
      const duplicateKey = phone || email || "";
      const emailValid = email ? isValidEmail(email) : false;
      const phoneValid = phone ? phone.length >= 10 : false;

      const errors = [];
      if (!firstName) errors.push("Missing first name");
      if (!phone) errors.push("Missing phone");
      if (email && !emailValid) errors.push("Invalid email");
      if (phone && !phoneValid) errors.push("Invalid phone");

      return {
        firstName,
        lastName,
        fullName,
        email,
        phone,
        status: "new",
        source: "upload",
        uploadBatchId,
        notes: "",
        callAttempts: 0,
        lastCallAt: null,
        emailValid,
        phoneValid,
        duplicateKey,
        n8nLocked: false,
        n8nLockedAt: null,
        isDeleted: false,
        errors,
      };
    });

    // Get all duplicate keys from uploaded data
    const incomingKeys = normalizedRows
      .map((row) => row.duplicateKey)
      .filter(Boolean);

    // Find existing keys in DB once
    const existingContacts = incomingKeys.length
      ? await OutboundContact.find({
          duplicateKey: { $in: incomingKeys },
          isDeleted: false,
        }).select("duplicateKey")
      : [];

    const existingKeySet = new Set(existingContacts.map((doc) => doc.duplicateKey));
    const seenInImport = new Set();

    const toInsert = [];
    let skippedInvalid = 0;
    let skippedDuplicateInDb = 0;
    let skippedDuplicateInFile = 0;

    for (const row of normalizedRows) {
      // Skip invalid rows
      if (row.errors.length > 0) {
        skippedInvalid++;
        continue;
      }

      if (duplicateMode === "skip") {
        // Skip duplicates already in DB
        if (row.duplicateKey && existingKeySet.has(row.duplicateKey)) {
          skippedDuplicateInDb++;
          continue;
        }

        // Skip duplicates inside same import file
        if (row.duplicateKey && seenInImport.has(row.duplicateKey)) {
          skippedDuplicateInFile++;
          continue;
        }
      }

      if (row.duplicateKey) {
        seenInImport.add(row.duplicateKey);
      }

      toInsert.push(row);
    }

    if (!toInsert.length) {
      return res.json({
        success: true,
        uploadBatchId,
        insertedCount: 0,
        skippedCount: rows.length,
        skippedInvalid,
        skippedDuplicateInDb,
        skippedDuplicateInFile,
        message: "No valid new rows were imported",
      });
    }

    const inserted = await OutboundContact.insertMany(toInsert, { ordered: false });

    return res.json({
      success: true,
      uploadBatchId,
      insertedCount: inserted.length,
      skippedCount: rows.length - inserted.length,
      skippedInvalid,
      skippedDuplicateInDb,
      skippedDuplicateInFile,
    });
  } catch (error) {
    console.error("POST /api/outbound-contacts/import error:", error);
    return res.status(500).json({
      error: "Failed to import rows",
      details: error.message,
    });
  }
});

export default router;