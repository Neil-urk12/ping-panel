import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // 1. Monitors: The configuration for each service
    monitors: defineTable({
        name: v.string(),
        url: v.string(),
        method: v.string(), // "GET", "POST"
        headers: v.optional(v.string()), // JSON stringified headers
        frequency: v.number(), // Interval in minutes (e.g., 1, 5, 10, 30)
        isActive: v.boolean(),

        // Latest snapshot (for fast Dashboard rendering)
        currentStatus: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("DEGRADED"), v.literal("PENDING")),
        lastChecked: v.optional(v.number()),
        lastLatency: v.optional(v.number()),
        lastStatusCode: v.optional(v.number()),
        nextCheckAt: v.optional(v.number()), // When the next check should occur
    }),

    // 2. Logs: Historical data for graphs
    logs: defineTable({
        monitorId: v.id("monitors"),
        timestamp: v.number(),
        status: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("DEGRADED")),
        latency: v.number(),
        statusCode: v.number(),
        errorMessage: v.optional(v.string()),
    }).index("by_monitor", ["monitorId"]).index("by_monitor_timestamp", ["monitorId", "timestamp"]),
});
