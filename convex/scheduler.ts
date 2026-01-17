import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";

// Internal mutation to get monitors that need checking
export const getMonitorsDueForCheck = internalMutation({
    args: {},
    handler: async (ctx): Promise<Doc<"monitors">[]> => {
        const now = Date.now();
        const monitors = await ctx.db.query("monitors").collect();

        // Filter monitors that are active and due for a check
        return monitors.filter((monitor) => {
            if (!monitor.isActive) return false;
            if (!monitor.nextCheckAt) return true; // Never checked, check now
            return monitor.nextCheckAt <= now;
        });
    },
});

// Internal action to run scheduled health checks
export const runScheduledChecks = internalAction({
    args: {},
    handler: async (ctx): Promise<{ checked: number }> => {
        // Get all monitors due for a check
        const monitorsDue: Doc<"monitors">[] = await ctx.runMutation(internal.scheduler.getMonitorsDueForCheck);

        // Fire off health checks for each
        const checkPromises = monitorsDue.map((monitor: Doc<"monitors">) =>
            ctx.runAction(internal.actions.checkHealth, {
                monitorId: monitor._id,
                url: monitor.url,
                method: monitor.method,
                headers: monitor.headers,
            })
        );

        // Wait for all checks to complete
        await Promise.allSettled(checkPromises);

        return { checked: monitorsDue.length };
    },
});

// Action to manually trigger a health check for a specific monitor
export const triggerCheck = internalAction({
    args: {},
    handler: async (ctx): Promise<void> => {
        // This can be called after adding a new monitor
        await ctx.runAction(internal.scheduler.runScheduledChecks);
    },
});
