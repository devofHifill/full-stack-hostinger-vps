import express from "express";
import WorkflowExecutionLog from "../models/WorkflowExecutionLog.js";

const router = express.Router();

/**
 * POST /api/workflow-executions/start
 * Create an execution log entry
 */
router.post("/start", async (req, res) => {
  try {
    const {
      workflowKey,
      windowId,
      date,
      recordsAttempted = 0,
      notes = "",
    } = req.body;

    if (!workflowKey || !windowId || !date) {
      return res.status(400).json({
        error: "workflowKey, windowId, and date are required",
      });
    }

    const execution = await WorkflowExecutionLog.create({
      workflowKey,
      windowId,
      date,
      recordsAttempted,
      recordsProcessed: 0,
      status: "started",
      notes,
      startedAt: new Date(),
    });

    res.status(201).json(execution);
  } catch (error) {
    console.error("POST workflow execution start error:", error);
    res.status(500).json({ error: "Failed to start workflow execution log" });
  }
});

/**
 * POST /api/workflow-executions/complete
 * Complete an execution log entry
 */
router.post("/complete", async (req, res) => {
  try {
    const {
      executionId,
      recordsProcessed = 0,
      recordsAttempted = 0,
      status = "completed",
      notes = "",
    } = req.body;

    if (!executionId) {
      return res.status(400).json({ error: "executionId is required" });
    }

    const execution = await WorkflowExecutionLog.findByIdAndUpdate(
      executionId,
      {
        endedAt: new Date(),
        recordsProcessed,
        recordsAttempted,
        status,
        notes,
      },
      { new: true }
    );

    if (!execution) {
      return res.status(404).json({ error: "Execution log not found" });
    }

    res.json(execution);
  } catch (error) {
    console.error("POST workflow execution complete error:", error);
    res.status(500).json({ error: "Failed to complete workflow execution log" });
  }
});

/**
 * GET /api/workflow-executions/:workflowKey
 * Optional helper route to inspect logs
 */
router.get("/:workflowKey", async (req, res) => {
  try {
    const { workflowKey } = req.params;
    const { date, limit = 20 } = req.query;

    const query = { workflowKey };
    if (date) query.date = date;

    const logs = await WorkflowExecutionLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error) {
    console.error("GET workflow execution logs error:", error);
    res.status(500).json({ error: "Failed to fetch workflow execution logs" });
  }
});

export default router;