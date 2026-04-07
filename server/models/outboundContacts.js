import express from "express";
import OutboundContact from "../models/OutboundContact.js";

const router = express.Router();

/**
 * GET /api/outbound-contacts
 * Query params:
 * - page
 * - limit
 * - search
 * - status
 */
router.get("/", async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
        const skip = (page - 1) * limit;

        const search = (req.query.search || "").trim();
        const status = (req.query.status || "").trim();

        const filter = { isDeleted: false };

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [rows, total] = await Promise.all([
            OutboundContact.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            OutboundContact.countDocuments(filter),
        ]);

        res.json({
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            rows,
        });
    } catch (error) {
        console.error("GET /api/outbound-contacts error:", error);
        res.status(500).json({ error: "Failed to fetch outbound contacts" });
    }
});

/**
 * GET /api/outbound-contacts/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const row = await OutboundContact.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!row) {
            return res.status(404).json({ error: "Outbound contact not found" });
        }

        res.json(row);
    } catch (error) {
        console.error("GET /api/outbound-contacts/:id error:", error);
        res.status(500).json({ error: "Failed to fetch outbound contact" });
    }
});

/**
 * POST /api/outbound-contacts
 */
router.post("/", async (req, res) => {
    try {
        const {
            firstName = "",
            lastName = "",
            email = "",
            phone = "",
            status = "new",
            notes = "",
            source = "manual",
            uploadBatchId = "",
        } = req.body;

        if (!firstName.trim() && !phone.trim()) {
            return res.status(400).json({
                error: "At least first name or phone is required",
            });
        }

        const row = await OutboundContact.create({
            firstName,
            lastName,
            email,
            phone,
            status,
            notes,
            source,
            uploadBatchId,
        });

        res.status(201).json(row);
    } catch (error) {
        console.error("POST /api/outbound-contacts error:", error);
        res.status(500).json({ error: "Failed to create outbound contact" });
    }
});

/**
 * PUT /api/outbound-contacts/:id
 */
router.put("/:id", async (req, res) => {
    try {
        const allowedFields = [
            "firstName",
            "lastName",
            "email",
            "phone",
            "status",
            "notes",
            "callAttempts",
            "lastCallAt",
            "n8nLocked",
            "n8nLockedAt",
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (field in req.body) updates[field] = req.body[field];
        }

        const row = await OutboundContact.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!row) {
            return res.status(404).json({ error: "Outbound contact not found" });
        }

        Object.assign(row, updates);
        await row.save();

        res.json(row);
    } catch (error) {
        console.error("PUT /api/outbound-contacts/:id error:", error);
        res.status(500).json({ error: "Failed to update outbound contact" });
    }
});

/**
 * DELETE /api/outbound-contacts/:id
 * Soft delete
 */
router.delete("/:id", async (req, res) => {
    try {
        const row = await OutboundContact.findById(req.params.id);

        if (!row || row.isDeleted) {
            return res.status(404).json({ error: "Outbound contact not found" });
        }

        row.isDeleted = true;
        await row.save();

        res.json({ success: true, message: "Outbound contact deleted" });
    } catch (error) {
        console.error("DELETE /api/outbound-contacts/:id error:", error);
        res.status(500).json({ error: "Failed to delete outbound contact" });
    }
});

/**
 * POST /api/outbound-contacts/bulk-delete
 * body: { ids: [] }
 */
router.post("/bulk-delete", async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

        if (!ids.length) {
            return res.status(400).json({ error: "No ids provided" });
        }

        const result = await OutboundContact.updateMany(
            { _id: { $in: ids } },
            { $set: { isDeleted: true } }
        );

        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("POST /api/outbound-contacts/bulk-delete error:", error);
        res.status(500).json({ error: "Failed to bulk delete outbound contacts" });
    }
});

/**
 * POST /api/outbound-contacts/bulk-status
 * body: { ids: [], status: "new" }
 */
router.post("/bulk-status", async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "queued",
            "calling",
            "called",
            "failed",
            "do_not_call",
        ];

        if (!ids.length) {
            return res.status(400).json({ error: "No ids provided" });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const result = await OutboundContact.updateMany(
            { _id: { $in: ids }, isDeleted: false },
            { $set: { status } }
        );

        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("POST /api/outbound-contacts/bulk-status error:", error);
        res.status(500).json({ error: "Failed to bulk update status" });
    }
});

export default router;