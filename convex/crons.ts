import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every minute to check which monitors need to be checked
crons.interval(
    "check monitors",
    { minutes: 1 },
    internal.scheduler.runScheduledChecks,
);

export default crons;
