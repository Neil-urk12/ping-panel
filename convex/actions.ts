"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const TIMEOUT_MS = 10000; // 10 second timeout
const DEGRADED_THRESHOLD_MS = 1000; // 1 second = degraded

// Internal Action: Check health of a URL
export const checkHealth = internalAction({
    args: {
        monitorId: v.id("monitors"),
        url: v.string(),
        method: v.string(),
        headers: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        let status: "UP" | "DOWN" | "DEGRADED" = "DOWN";
        let statusCode = 0;
        let latency = 0;
        let errorMessage: string | undefined;

        try {
            // Parse headers if provided
            const headersObj: Record<string, string> = args.headers
                ? JSON.parse(args.headers)
                : {};

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            const response = await fetch(args.url, {
                method: args.method,
                headers: headersObj,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            latency = Date.now() - startTime;
            statusCode = response.status;

            // Determine status based on response
            if (response.ok) {
                if (latency > DEGRADED_THRESHOLD_MS) {
                    status = "DEGRADED";
                } else {
                    status = "UP";
                }
            } else {
                status = "DOWN";
                errorMessage = `HTTP ${statusCode}: ${response.statusText}`;
            }
        } catch (error) {
            latency = Date.now() - startTime;
            status = "DOWN";

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    errorMessage = `Timeout after ${TIMEOUT_MS}ms`;
                } else {
                    errorMessage = error.message;
                }
            } else {
                errorMessage = "Unknown error occurred";
            }
        }

        // Update the monitor status
        await ctx.runMutation(internal.monitors.updateMonitorStatus, {
            monitorId: args.monitorId,
            status,
            latency,
            statusCode,
            errorMessage,
        });

        return { status, latency, statusCode, errorMessage };
    },
});
