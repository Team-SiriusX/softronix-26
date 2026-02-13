import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Public avatar uploader for sign-up (no auth required)
  signUpAvatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // No authentication required for sign-up
      return { isPublic: true };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Sign-up avatar upload complete");
      console.log("📸 File URL:", file.url);

      return {
        url: file.url,
      };
    }),

  // Avatar image uploader (authenticated)
  avatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Authenticate using Better Auth
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) {
        throw new UploadThingError("Unauthorized - Please sign in to upload");
      }

      // Return user metadata for onUploadComplete
      return { userId: session.user.id, userName: session.user.name };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Avatar upload complete for user:", metadata.userId);
      console.log("📸 File URL:", file.url);

      // Return data to client
      return {
        uploadedBy: metadata.userId,
        url: file.url,
      };
    }),

  // Resume uploader
  resumeUploader: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) {
        throw new UploadThingError("Unauthorized - Please sign in to upload");
      }

      return { userId: session.user.id, userName: session.user.name };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Resume upload complete for user:", metadata.userId);
      console.log("📄 File URL:", file.url);

      return {
        uploadedBy: metadata.userId,
        url: file.url,
      };
    }),

  // Message attachment uploader
  messageAttachment: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) {
        throw new UploadThingError("Unauthorized - Please sign in to upload");
      }

      return { userId: session.user.id, userName: session.user.name };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Message attachment upload complete for user:", metadata.userId);
      console.log("📎 File:", file.name, "Size:", file.size, "Type:", file.type);
      console.log("🔗 File URL:", file.url);

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
