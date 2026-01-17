import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Query: Get all monitors (real-time subscription)
export const getMonitors = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("monitors").collect();
    },
});

// Query: Get a single monitor by ID
export const getMonitor = query({
    args: { id: v.id("monitors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Query: Get logs for a specific monitor
export const getMonitorLogs = query({
    args: {
        monitorId: v.id("monitors"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        return await ctx.db
            .query("logs")
            .withIndex("by_monitor_timestamp", (q) => q.eq("monitorId", args.monitorId))
            .order("desc")
            .take(limit);
    },
});

// Mutation: Add a new monitor
export const addMonitor = mutation({
    args: {
        name: v.string(),
        url: v.string(),
        method: v.string(),
        headers: v.optional(v.string()),
        frequency: v.number(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const monitorId = await ctx.db.insert("monitors", {
            name: args.name,
            url: args.url,
            method: args.method,
            headers: args.headers,
            frequency: args.frequency,
            isActive: true,
            currentStatus: "PENDING",
            lastChecked: undefined,
            lastLatency: undefined,
            lastStatusCode: undefined,
            nextCheckAt: now, // Check immediately on creation
        });
        return monitorId;
    },
});

// Mutation: Update a monitor
export const updateMonitor = mutation({
    args: {
        id: v.id("monitors"),
        name: v.optional(v.string()),
        url: v.optional(v.string()),
        method: v.optional(v.string()),
        headers: v.optional(v.string()),
        frequency: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );
        await ctx.db.patch(id, filteredUpdates);
    },
});

// Mutation: Delete a monitor
export const deleteMonitor = mutation({
    args: { id: v.id("monitors") },
    handler: async (ctx, args) => {
        // Delete all logs for this monitor
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_monitor", (q) => q.eq("monitorId", args.id))
            .collect();

        for (const log of logs) {
            await ctx.db.delete(log._id);
        }

        // Delete the monitor
        await ctx.db.delete(args.id);
    },
});

// Internal Mutation: Update monitor status after health check
export const updateMonitorStatus = internalMutation({
    args: {
        monitorId: v.id("monitors"),
        status: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("DEGRADED")),
        latency: v.number(),
        statusCode: v.number(),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const monitor = await ctx.db.get(args.monitorId);

        if (!monitor) return;

        // Update monitor's current status
        await ctx.db.patch(args.monitorId, {
            currentStatus: args.status,
            lastChecked: now,
            lastLatency: args.latency,
            lastStatusCode: args.statusCode,
            nextCheckAt: now + monitor.frequency * 60 * 1000,
        });

        // Insert log entry
        await ctx.db.insert("logs", {
            monitorId: args.monitorId,
            timestamp: now,
            status: args.status,
            latency: args.latency,
            statusCode: args.statusCode,
            errorMessage: args.errorMessage,
        });
    },
});

// Query: Get dashboard stats
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const monitors = await ctx.db.query("monitors").collect();

        const total = monitors.length;
        const down = monitors.filter((m) => m.currentStatus === "DOWN").length;
        const degraded = monitors.filter((m) => m.currentStatus === "DEGRADED").length;

        const latencies = monitors
            .filter((m) => m.lastLatency !== undefined)
            .map((m) => m.lastLatency!);

        const avgLatency = latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : 0;

        return {
            total,
            down,
            degraded,
            avgLatency,
        };
    },
});
