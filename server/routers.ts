import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const MAX_AVATAR_BYTES = 512 * 1024;

export function decodeAvatarJpeg(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Avatar must be a resized JPEG image.",
    });
  }

  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length === 0 || bytes.length > MAX_AVATAR_BYTES) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "Avatar image is too large.",
    });
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Avatar must contain valid JPEG data.",
    });
  }
  return bytes;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  avatar: router({
    upload: publicProcedure
      .input(z.object({ dataUrl: z.string().max(750_000) }))
      .mutation(async ({ input }) => {
        const bytes = decodeAvatarJpeg(input.dataUrl);
        return storagePut(
          `hana-avatars/avatar-${Date.now()}.jpg`,
          bytes,
          "image/jpeg"
        );
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
