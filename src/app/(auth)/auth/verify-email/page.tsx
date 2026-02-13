"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");

	const getInitialStatus = (): "loading" | "success" | "error" => {
		if (error) return "error";
		if (!token) return "loading";
		return "success";
	};

	const getInitialMessage = (): string => {
		if (error) return error === "invalid_token" ? "Invalid or expired verification link" : "Verification failed";
		if (!token) return "Please check your email for the verification link";
		return "Your email has been verified successfully!";
	};

	const [status] = useState<"loading" | "success" | "error">(getInitialStatus);
	const [message] = useState(getInitialMessage);

	if (status === "loading") {
		return (
			<Card className="z-50 rounded-md max-w-md">
				<CardHeader>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4 mx-auto">
						<Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
					</div>
					<CardTitle className="text-lg md:text-xl text-center">
						Check Your Email
					</CardTitle>
					<CardDescription className="text-xs md:text-sm text-center">
						{message}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<p className="text-sm text-muted-foreground text-center">
							We&apos;ve sent a verification link to your email address. Click the link to verify your account.
						</p>
						<Link href="/auth/sign-in" className="w-full">
							<Button variant="outline" className="w-full">Back to Sign In</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (status === "error") {
		return (
			<Card className="z-50 rounded-md max-w-md">
				<CardHeader>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4 mx-auto">
						<XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
					<CardTitle className="text-lg md:text-xl text-center">
						Verification Failed
					</CardTitle>
					<CardDescription className="text-xs md:text-sm text-center">
						{message}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<p className="text-sm text-muted-foreground text-center">
							The verification link may have expired or is invalid. Please request a new verification email.
						</p>
						<Link href="/auth/sign-in" className="w-full">
							<Button className="w-full">Go to Sign In</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="z-50 rounded-md max-w-md">
			<CardHeader>
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4 mx-auto">
					<CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
				</div>
				<CardTitle className="text-lg md:text-xl text-center">
					Email Verified!
				</CardTitle>
				<CardDescription className="text-xs md:text-sm text-center">
					{message}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<p className="text-sm text-muted-foreground text-center">
						You can now sign in to your account with your credentials.
					</p>
					<Link href="/auth/sign-in" className="w-full">
						<Button className="w-full">Continue to Sign In</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

export default function VerifyEmail() {
	return (
		<Suspense fallback={
			<Card className="z-50 rounded-md max-w-md">
				<CardHeader>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4 mx-auto">
						<Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
					</div>
					<CardTitle className="text-lg md:text-xl text-center">
						Verifying your email...
					</CardTitle>
					<CardDescription className="text-xs md:text-sm text-center">
						Please wait while we verify your email address
					</CardDescription>
				</CardHeader>
			</Card>
		}>
			<VerifyEmailContent />
		</Suspense>
	);
}
