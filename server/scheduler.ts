import axios from "axios";
import { getDueScheduledDispatches, updateScheduledDispatchExecution, deleteScheduledDispatch } from "./db";

const WEBHOOK_URL = "https://n8n.pagluz.com.br/webhook/celesc-bot";

/**
 * Background scheduler that runs every minute to check for due dispatches
 */
export function startScheduler() {
  console.log("[Scheduler] Starting background scheduler");
  
  // Run immediately on start
  processScheduledDispatches();
  
  // Then run every minute
  setInterval(processScheduledDispatches, 60000);
}

async function processScheduledDispatches() {
  try {
    const currentTime = new Date();
    const dueDispatches = await getDueScheduledDispatches(currentTime);

    if (dueDispatches.length === 0) {
      return;
    }

    console.log(`[Scheduler] Processing ${dueDispatches.length} due dispatches`);

    // Process dispatches with intervals to avoid overloading WhatsApp
    for (let i = 0; i < dueDispatches.length; i++) {
      const dispatch = dueDispatches[i];
      
      // Add delay between dispatches (except for the first one)
      if (i > 0) {
        const delayMs = 3 * 60 * 1000; // 3 minutes default interval
        console.log(`[Scheduler] Waiting ${delayMs / 1000 / 60} minutes before next dispatch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      try {
        console.log(`[Scheduler] Executing dispatch ${dispatch.id} for UC ${dispatch.uc} (${i + 1}/${dueDispatches.length})`);

        // Execute the webhook request
        const response = await axios.post(
          WEBHOOK_URL,
          {
            uc: dispatch.uc,
            cpfCnpj: dispatch.cpfCnpj,
            birthDate: dispatch.birthDate,
          },
          {
            timeout: 120000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(`[Scheduler] Dispatch ${dispatch.id} completed successfully`);

        // Update execution time
        const now = new Date();
        
        if (dispatch.scheduleType === "daily") {
          // Schedule next execution for tomorrow at the same time
          const nextExecution = new Date(dispatch.scheduledTime);
          nextExecution.setDate(nextExecution.getDate() + 1);
          
          await updateScheduledDispatchExecution(dispatch.id, now, nextExecution);
          console.log(`[Scheduler] Daily dispatch ${dispatch.id} rescheduled for ${nextExecution}`);
        } else {
          // One-time dispatch, mark as executed and deactivate
          await deleteScheduledDispatch(dispatch.id);
          console.log(`[Scheduler] One-time dispatch ${dispatch.id} completed and removed`);
        }

        // Note: Push notifications are handled client-side via the Notification API
        // The client will poll for updates or use WebSocket in production
        
      } catch (error: any) {
        console.error(`[Scheduler] Error executing dispatch ${dispatch.id}:`, error.message);
        
        // Update last executed time even on error to prevent retry loops
        const now = new Date();
        if (dispatch.scheduleType === "daily") {
          const nextExecution = new Date(dispatch.scheduledTime);
          nextExecution.setDate(nextExecution.getDate() + 1);
          await updateScheduledDispatchExecution(dispatch.id, now, nextExecution);
        } else {
          // For one-time dispatches that fail, we still remove them
          // In production, you might want to retry or notify the user
          await deleteScheduledDispatch(dispatch.id);
        }
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error in processScheduledDispatches:", error);
  }
}
