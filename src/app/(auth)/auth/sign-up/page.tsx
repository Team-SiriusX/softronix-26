"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, X, Upload } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";

export default function SignUp() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	return (
		<div className="relative w-full max-w-lg">
			{/* Glassmorphic Card */}
			<div className="relative rounded-2xl border border-neutral-800 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
				{/* Gradient Border Effect */}
				<div className="absolute -inset-px rounded-2xl bg-linear-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />

				<div className="relative space-y-6">
					{/* Header */}
					<div className="space-y-2 text-center">
						<h1 className="bg-linear-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-bold text-transparent">
							Create Account
						</h1>
						<p className="text-sm text-neutral-400">
							Join the campus job marketplace today
						</p>
					</div>

					{/* Form */}
					<div className="space-y-4">
						{/* Name Fields */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="first-name" className="text-neutral-300">
									First name
								</Label>
								<Input
									id="first-name"
									placeholder="John"
									required
									onChange={(e) => setFirstName(e.target.value)}
									value={firstName}
									className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="last-name" className="text-neutral-300">
									Last name
								</Label>
								<Input
									id="last-name"
									placeholder="Doe"
									required
									onChange={(e) => setLastName(e.target.value)}
									value={lastName}
									className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
								/>
							</div>
						</div>

						{/* Email */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-neutral-300">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								required
								onChange={(e) => setEmail(e.target.value)}
								value={email}
								className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
							/>
						</div>

						{/* Password */}
						<div className="space-y-2">
							<Label htmlFor="password" className="text-neutral-300">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="new-password"
								placeholder="••••••••"
								className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
							/>
						</div>

						{/* Confirm Password */}
						<div className="space-y-2">
							<Label htmlFor="password_confirmation" className="text-neutral-300">
								Confirm Password
							</Label>
							<Input
								id="password_confirmation"
								type="password"
								value={passwordConfirmation}
								onChange={(e) => setPasswordConfirmation(e.target.value)}
								autoComplete="new-password"
								placeholder="••••••••"
								className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
							/>
						</div>

						{/* Profile Image */}
						<div className="space-y-2">
							<Label htmlFor="image" className="text-neutral-300">
								Profile Image <span className="text-neutral-500">(optional)</span>
							</Label>
							<div className="flex items-center gap-4">
								{/* Image Preview */}
								{imageUrl ? (
									<div className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-700">
										<Image
											src={imageUrl}
											alt="Profile preview"
											fill
											className="object-cover"
										/>
										<button
											onClick={() => {
												setImageUrl(null);
											}}
											className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
										>
											<X size={14} />
										</button>
									</div>
								) : (
									<div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30">
										<Upload size={24} className="text-neutral-500" />
									</div>
								)}

								{/* UploadThing Button */}
								<div className="flex-1">
									<UploadButton
										endpoint="signUpAvatarUploader"
										onClientUploadComplete={(res) => {
											if (res?.[0]?.url) {
												setImageUrl(res[0].url);
												toast.success("Image uploaded successfully!");
											}
										}}
										onUploadError={(error: Error) => {
											toast.error(`Upload failed: ${error.message}`);
										}}
										appearance={{
											button:
												"ut-ready:bg-blue-500/10 ut-uploading:cursor-not-allowed ut-uploading:bg-blue-500/50 bg-blue-500/10 text-blue-400 px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-500/20 transition-colors w-full border border-neutral-700",
											container: "w-full",
											allowedContent: "hidden",
										}}
										content={{
											button({ ready, isUploading }) {
												if (isUploading) return "Uploading...";
												if (ready) return "Choose Image";
												return "Getting ready...";
											},
										}}
									/>
								</div>
							</div>
						</div>

						{/* Create Account Button */}
						<Button
							type="submit"
							className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400"
							disabled={loading}
							onClick={async () => {
								await signUp.email({
									email,
									password,
									name: `${firstName} ${lastName}`,
									image: imageUrl || "",
									callbackURL: "/",
									fetchOptions: {
										onResponse: () => {
											setLoading(false);
										},
										onRequest: () => {
											setLoading(true);
										},
										onError: (ctx) => {
											toast.error(ctx.error.message);
										},
										onSuccess: async () => {
											toast.success("Account created! Please check your email to verify your account.");
										router.push("/auth/verify-email");
										},
									},
								});
							}}
						>
							{loading ? (
								<Loader2 size={18} className="animate-spin" />
							) : (
								"Create Account"
							)}
						</Button>

						{/* Divider */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-neutral-800" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-black/40 px-2 text-neutral-500">
									Or continue with
								</span>
							</div>
						</div>

						{/* Social Login */}
						<div className="grid grid-cols-2 gap-3">
							<Button
								variant="outline"
								disabled={loading}
								className="border-neutral-700 bg-neutral-900/50 text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
								onClick={async () => {
									await signIn.social(
										{
											provider: "google",
											callbackURL: "/",
										},
										{
											onRequest: () => {
												setLoading(true);
											},
											onResponse: () => {
												setLoading(false);
											},
											onError: (ctx) => {
												toast.error(ctx.error?.message || "Failed to sign in with Google");
												setLoading(false);
											},
										}
									);
								}}
							>
								{loading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 256 262">
										<path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
										<path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
										<path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
										<path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
									</svg>
								)}
								Google
							</Button>
							<Button
								variant="outline"
								disabled={loading}
								className="border-neutral-700 bg-neutral-900/50 text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
								onClick={async () => {
									await signIn.social(
										{
											provider: "github",
											callbackURL: "/",
										},
										{
											onRequest: () => {
												setLoading(true);
											},
											onResponse: () => {
												setLoading(false);
											},
											onError: (ctx) => {
												toast.error(ctx.error?.message || "Failed to sign in with GitHub");
												setLoading(false);
											},
										}
									);
								}}
							>
								{loading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="mr-2 h-4 w-4"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
										/>
									</svg>
								)}
								GitHub
							</Button>
						</div>
					</div>

					{/* Footer */}
					<div className="pt-4 text-center text-sm text-neutral-400">
						Already have an account?{" "}
						<Link
							href="/auth/sign-in"
							className="font-medium text-blue-400 transition-colors hover:text-blue-300"
						>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
