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
            <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5c5c5c]" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
                <div className="mx-auto max-w-lg px-4 py-24 text-center">
                    <User className="mx-auto h-16 w-16 text-[#1c1c1c]/20" />
                    <h2 className="mt-4 font-gloock text-2xl text-[#1c1c1c]">Sign in to view profile</h2>
                    <p className="mt-1 text-sm text-[#5c5c5c]">
                        You need to be signed in to access your profile.
                    </p>
                </div>
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
        <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/products"
                        className="flex h-10 w-10 items-center justify-center border border-[#1c1c1c]/20 transition-colors hover:bg-[#e8e5df]"
                    >
                        <ArrowLeft className="h-4 w-4 text-[#1c1c1c]" />
                    </Link>
                    <h1 className="font-gloock text-2xl text-[#1c1c1c] sm:text-3xl">
                        My Profile
                    </h1>
                </div>

                {/* Profile card */}
                <div className="overflow-hidden border border-[#1c1c1c]/10 bg-[#f7f4f0] shadow-sm">
                    {/* Banner */}
                    <div className="relative h-32 bg-[#e8e5df]" />

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="-mt-14 flex items-end gap-4">
                            <div className="relative">
                                <div className="relative h-24 w-24 overflow-hidden border-4 border-[#f7f4f0] bg-[#e8e5df] shadow-lg">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[#1c1c1c]/5">
                                        <span className="font-gloock text-3xl text-[#1c1c1c]">
                                            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pb-1">
                            <h2 className="font-gloock text-xl text-[#1c1c1c]">{user.name}</h2>
                            <p className="text-sm text-[#5c5c5c]">{user.email}</p>
                        </div>
                    </div>

                    {saved && (
                        <div className="mt-4 flex items-center gap-2 border border-green-600/20 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Info grid */}
                    <div className="mt-6 space-y-4">
                        {/* Name (editable) */}
                        <div className="flex items-center justify-between border border-[#1c1c1c]/10 bg-[#f2efe9] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-[#5c5c5c]" />
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-widest text-[#5c5c5c]">Name</p>
                                    {isEditing ? (
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-0.5 w-full bg-transparent text-sm font-semibold text-[#1c1c1c] outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="mt-0.5 text-sm font-semibold text-[#1c1c1c]">
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
                                        className="border border-[#1c1c1c]/20 px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors hover:bg-[#e8e5df]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !name.trim()}
                                        className="flex items-center gap-1.5 border border-[#1c1c1c] bg-[#1c1c1c] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c] disabled:opacity-50"
                                    >
                                        {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="border border-[#1c1c1c]/20 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-[#5c5c5c] transition-colors hover:bg-[#e8e5df] hover:text-[#1c1c1c]"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 border border-[#1c1c1c]/10 bg-[#f2efe9] px-4 py-3">
                            <Mail className="h-4 w-4 text-[#5c5c5c]" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-[#5c5c5c]">Email</p>
                                <p className="mt-0.5 text-sm font-semibold text-[#1c1c1c]">
                                    {user.email}
                                </p>
                            </div>
                            {user.emailVerified && (
                                <span className="ml-auto bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-green-700">
                                    Verified
                                </span>
                            )}
                        </div>

                        {/* Member since */}
                        <div className="flex items-center gap-3 border border-[#1c1c1c]/10 bg-[#f2efe9] px-4 py-3">
                            <Calendar className="h-4 w-4 text-[#5c5c5c]" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-[#5c5c5c]">Member Since</p>
                                <p className="mt-0.5 text-sm font-semibold text-[#1c1c1c]">
                                    {memberSince}
                                </p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-3 border border-[#1c1c1c]/10 bg-[#f2efe9] px-4 py-3">
                            <Shield className="h-4 w-4 text-[#5c5c5c]" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-[#5c5c5c]">Role</p>
                                <p className="mt-0.5 text-sm font-semibold capitalize text-[#1c1c1c]">
                                    {(user as any).role?.toLowerCase() ?? "user"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Link
                            href="/orders"
                            className="flex items-center justify-center gap-2 border border-[#1c1c1c]/20 px-4 py-3 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-colors hover:bg-[#e8e5df]"
                        >
                            📦 My Orders
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center justify-center gap-2 border border-[#1c1c1c]/20 px-4 py-3 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-colors hover:bg-[#e8e5df]"
                        >
                            🛒 My Cart
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
