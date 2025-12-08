import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";
import {
  createScheduledDispatch,
  getActiveScheduledDispatches,
  deleteScheduledDispatch,
  toggleScheduledDispatch,
  getAllGeneratedPdfs,
  deleteGeneratedPdf,
} from "./db";

const WEBHOOK_URL = "https://n8n.pagluz.com.br/webhook/celesc-bot";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  invoice: router({
    // Request invoice from CELESC bot via n8n webhook
    request: publicProcedure
      .input(
        z.object({
          uc: z.string().min(1, "UC é obrigatório"),
          cpfCnpj: z.string().min(11, "CPF/CNPJ é obrigatório"),
          birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await axios.post(
            WEBHOOK_URL,
            {
              uc: input.uc,
              cpfCnpj: input.cpfCnpj,
              birthDate: input.birthDate,
            },
            {
              timeout: 120000, // 2 minutes timeout
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          return {
            success: true,
            data: response.data,
          };
        } catch (error: any) {
          console.error("Webhook error:", error);
          return {
            success: false,
            error: error.response?.data?.message || error.message || "Erro ao processar solicitação",
          };
        }
      }),

    // Schedule a dispatch (supports multiple dispatches with intervals)
    schedule: publicProcedure
      .input(
        z.object({
          uc: z.string().min(1),
          cpfCnpj: z.string().min(11),
          birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
          scheduleType: z.enum(["once", "daily"]),
          scheduledTime: z.date(),
          multipleCount: z.number().min(1).max(20).optional().default(1),
          intervalMinutes: z.number().min(2).max(10).optional().default(3),
        })
      )
      .mutation(async ({ input }) => {
        const count = input.multipleCount || 1;
        const intervalMs = (input.intervalMinutes || 3) * 60 * 1000; // Convert to milliseconds
        const dispatches = [];

        // Create multiple dispatches with intervals
        for (let i = 0; i < count; i++) {
          const scheduledTime = new Date(input.scheduledTime.getTime() + (i * intervalMs));
          
          const dispatch = await createScheduledDispatch({
            uc: input.uc,
            cpfCnpj: input.cpfCnpj,
            birthDate: input.birthDate,
            scheduleType: input.scheduleType,
            scheduledTime: scheduledTime,
            isActive: true,
          });

          dispatches.push(dispatch);
        }

        return {
          success: true,
          dispatch: dispatches[0], // Return first for compatibility
          dispatches,
          count: dispatches.length,
        };
      }),

    // Get all active scheduled dispatches
    listScheduled: publicProcedure.query(async () => {
      const dispatches = await getActiveScheduledDispatches();
      return dispatches;
    }),

    // Delete a scheduled dispatch
    deleteScheduled: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteScheduledDispatch(input.id);
        return { success: true };
      }),

    // Toggle scheduled dispatch active status
    toggleScheduled: publicProcedure
      .input(
        z.object({
          id: z.number(),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await toggleScheduledDispatch(input.id, input.isActive);
        return { success: true };
      }),
  }),

  pdf: router({
    // Get all generated PDFs
    list: publicProcedure.query(async () => {
      const pdfs = await getAllGeneratedPdfs();
      return pdfs;
    }),

    // Delete a PDF
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGeneratedPdf(input.id);
        return { success: true };
      }),

    // Get download URL for a PDF (use proxy endpoint)
    getUrl: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const pdfs = await getAllGeneratedPdfs();
        const pdf = pdfs.find(p => p.id === input.id);
        if (!pdf) {
          throw new Error("PDF not found");
        }
        // Return proxy URL instead of direct Supabase URL
        // Use the request protocol and host to build the URL
        const protocol = ctx.req.protocol || "http";
        const host = ctx.req.get("host") || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;
        return { url: `${baseUrl}/api/pdf/${input.id}` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
