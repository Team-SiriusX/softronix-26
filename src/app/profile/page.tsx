"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Calendar,
    Shield,
    Camera,
    Loader2,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const session = useSession();
    const user = session.data?.user;
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    if (session.isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-lg px-4 py-24 text-center">
                <User className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <h2 className="mt-4 text-lg font-bold text-foreground">Sign in to view profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    You need to be signed in to access your profile.
                </p>
            </div>
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/auth/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                setSaved(true);
                setIsEditing(false);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error("Failed to update profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const memberSince = new Date(user.createdAt).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/products"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    My Profile
                </h1>
            </div>

            {/* Profile card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {/* Banner */}
                <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

                {/* Avatar + info */}
                <div className="px-6 pb-6">
                    <div className="-mt-14 flex items-end gap-4">
                        <div className="relative">
                            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-lg">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                        <span className="text-3xl font-bold text-primary">
                                            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    {saved && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Info grid */}
                    <div className="mt-6 space-y-4">
                        {/* Name (editable) */}
                        <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Name</p>
                                    {isEditing ? (
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-0.5 w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                                            {user.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setName(user.name ?? "");
                                        }}
                                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !name.trim()}
                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                                    >
                                        {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Email</p>
                                <p className="mt-0.5 text-sm font-semibold text-foreground">
                                    {user.email}
                                </p>
                            </div>
                            {user.emailVerified && (
                                <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Verified
                                </span>
                            )}
                        </div>

                        {/* Member since */}
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Member Since</p>
                                <p className="mt-0.5 text-sm font-semibold text-foreground">
                                    {memberSince}
                                </p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Role</p>
                                <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">
                                    {(user as any).role?.toLowerCase() ?? "user"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Link
                            href="/orders"
                            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            📦 My Orders
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            🛒 My Cart
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
