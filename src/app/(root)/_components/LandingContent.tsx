"use client";

import { useEffect, useRef } from 'react';
import Image from "next/image";

const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
    const elementsRef = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        elementsRef.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [options]);

    return elementsRef;
};

const LOGOS = [
    { name: "OpenAI", src: "/logos/openai.png" },
    { name: "Anthropic", src: "/logos/anthropic.png" },
    { name: "Google", src: "/logos/google.png" },
    { name: "Meta", src: "/logos/meta.png" },
    { name: "Cohere", src: "/logos/cohere.png" },
    { name: "Hugging Face", src: "/logos/huggingface.png" }
];

export default function LandingContent() {
    const elementsRef = useIntersectionObserver({ threshold: 0.1 });

    return (
        <section className="relative z-20 bg-white w-full py-32 px-6 md:px-12 lg:px-24 overflow-hidden selection:bg-cyan-100">

            {/* Subtle Background Gradients - Teal/Cyan Theme from Hero */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] rounded-full mix-blend-multiply translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 blur-[120px] rounded-full mix-blend-multiply -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <div className="max-w-screen-2xl mx-auto space-y-48 relative z-10">

                {/* LOGO CAROUSEL - Bigger, Transparent Logos */}
                <div className="w-full space-y-10">
                    <div className="flex items-center justify-center gap-4 opacity-40">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-black/20 to-black/20" />
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-400">Trusted Worldwide</p>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent via-black/20 to-black/20" />
                    </div>

                    <div className="relative w-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                        <div className="flex w-max animate-marquee pause-on-hover items-center">
                            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
                                <div key={i} className="mx-20 flex items-center gap-5 opacity-35 hover:opacity-100 transition-all duration-700 cursor-default group">
                                    <div className="relative h-16 w-16 transition-all duration-700">
                                        <Image
                                            src={logo.src}
                                            alt={logo.name}
                                            width={64}
                                            height={64}
                                            className="object-contain mix-blend-darken"
                                        />
                                    </div>
                                    <span className="text-lg font-medium tracking-wide text-black geist-mono-regular hidden lg:block transition-colors duration-700">
                                        {logo.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PREMIUM SPLIT LAYOUT */}
                <div
                    ref={(el) => { if (elementsRef.current) elementsRef.current[0] = el; }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
                >
                    <div className="lg:col-span-7 space-y-14">
                        <div className="space-y-8">
                            <h2 className="text-6xl md:text-8xl font-light tracking-tighter text-gray-900 leading-[0.95]">
                                Security that <br />
                                <span className="text-black font-normal">
                                    understands context
                                </span>
                            </h2>
                            <div className="h-px w-24 bg-gradient-to-r from-cyan-500/30 to-transparent" />
                        </div>

                        <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
                            <strong className="text-gray-900 font-semibold">Entropy</strong> is the intelligence layer between your users and your LLMs.
                            We intercept, analyze, and neutralize threats in <span className="text-gray-900 font-normal relative inline-block group">
                                real-time
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </span>.
                        </p>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-end gap-10 pb-4">
                        {[
                            { label: "Accuracy", value: "99.9%" },
                            { label: "Latency", value: "~2ms" },
                            { label: "Coverage", value: "4 Engines" }
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                ref={(el) => { if (elementsRef.current) elementsRef.current[idx + 1] = el; }}
                                className="group border-b border-gray-100 pb-7 flex justify-between items-end hover:border-cyan-200 transition-all duration-700 opacity-0 translate-y-10"
                                style={{ transitionDelay: `${idx * 150}ms` }}
                            >
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-400 group-hover:text-cyan-600 transition-colors duration-500">{stat.label}</span>
                                <span className="text-4xl font-extralight tracking-tight text-gray-900 group-hover:scale-105 transition-transform duration-500 origin-right">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FEATURE CARDS */}
                <div className="space-y-16">
                    <div
                        ref={(el) => { if (elementsRef.current) elementsRef.current[4] = el; }}
                        className="flex items-end justify-between border-b border-black/5 pb-10 opacity-0 translate-y-10 transition-all duration-1000"
                    >
                        <h3 className="text-3xl font-extralight text-gray-900 tracking-tight">Core Capabilities</h3>
                        <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-4 py-1.5 rounded-full tracking-wider">Production Ready</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Semantic Entropy Detection",
                                desc: "Detects hallucinations by analyzing semantic variance across multiple generated responses using advanced embedding clustering."
                            },
                            {
                                title: "Real-time Defense Engine",
                                desc: "Immediate identification and blocking of prompt injections, jailbreaks, and toxic inputs through lightweight ML classifiers."
                            },
                            {
                                title: "Adversarial Red Team",
                                desc: "Automated stress-testing with sophisticated attack patterns to discover vulnerabilities before they reach production."
                            }
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                ref={(el) => { if (elementsRef.current) elementsRef.current[idx + 5] = el; }}
                                className="group relative p-10 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white hover:from-white hover:to-gray-50/30 border border-gray-100/50 hover:border-cyan-100 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-700 opacity-0 translate-y-10"
                                style={{ transitionDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-teal-500/[0.02] opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-700" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <h4 className="text-xl font-medium text-gray-900 tracking-tight leading-snug pr-4">{feature.title}</h4>
                                        <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-cyan-500 transition-colors duration-500 mt-1.5 flex-shrink-0" />
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CODE INTEGRATION */}
                <div
                    ref={(el) => { if (elementsRef.current) elementsRef.current[8] = el; }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl ring-1 ring-black/5 opacity-0 translate-y-10 transition-all duration-1000"
                >
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                        <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.3">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 md:p-16 space-y-10 flex flex-col justify-center border-r border-white/5 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur">
                            <div className="space-y-5">
                                <h4 className="text-white text-3xl font-extralight tracking-tight leading-tight">One line.<br />Total protection.</h4>
                                <p className="text-gray-400 font-light leading-relaxed text-base">
                                    Designed for the modern stack. Whether you use LangChain, Vercel AI, or raw OpenAI calls—Entropy wraps your inference with a single SDK call.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button className="text-sm px-7 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/10">
                                    Documentation
                                </button>
                                <button className="text-sm px-7 py-3 bg-white/5 text-white border border-white/10 font-medium rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                    Get API Key
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0D0D0D] p-12 md:p-16 font-mono text-sm relative overflow-hidden group">
                            <div className="space-y-1.5 text-gray-500 relative z-10 transition-transform duration-1000 group-hover:translate-x-3">
                                <div className="flex gap-3"><span className="text-gray-700 select-none">1</span> <span className="text-purple-400">import</span> <span className="text-gray-300">{`{`} <span className="text-yellow-300">Entropy</span> {`}`}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'@entropy/sdk'</span>;</div>
                                <div className="flex gap-3"><span className="text-gray-800 select-none">2</span></div>
                                <div className="flex gap-3"><span className="text-gray-700 select-none">3</span> <span className="text-purple-400">const</span> <span className="text-blue-300">client</span> <span className="text-gray-400">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-300">Entropy</span>({`({`}</div>
                                <div className="flex gap-3"><span className="text-gray-800 select-none">4</span>   <span className="text-blue-300">apiKey</span>: <span className="text-blue-300">process</span>.<span className="text-blue-300">env</span>.<span className="text-orange-300">ENTROPY_KEY</span></div>
                                <div className="flex gap-3"><span className="text-gray-700 select-none">5</span> {`});`}</div>
                                <div className="flex gap-3"><span className="text-gray-800 select-none">6</span></div>
                                <div className="flex gap-3"><span className="text-gray-700 select-none">7</span> <span className="text-gray-600">// Wrap any LLM call</span></div>
                                <div className="flex gap-3"><span className="text-purple-400 select-none">8</span> <span className="text-purple-400">const</span> <span className="text-blue-300">result</span> <span className="text-gray-400">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">client</span>.<span className="text-yellow-300">protect</span>(</div>
                                <div className="flex gap-3"><span className="text-gray-700 select-none">9</span>   <span className="text-blue-300">openai</span>.<span className="text-blue-300">chat</span>.<span className="text-blue-300">completions</span>.<span className="text-yellow-300">create</span>(params)</div>
                                <div className="flex gap-3"><span className="text-gray-700 select-none">10</span> );</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400 pt-16 pb-12 border-t border-black/5 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">E</span>
                        </div>
                        <span className="text-black tracking-widest uppercase font-semibold">Entropy</span>
                        <span className="text-gray-300">© 2026</span>
                    </div>

                    <div className="flex gap-10 tracking-wide">
                        <a href="#" className="hover:text-black transition-colors duration-300">Privacy</a>
                        <a href="#" className="hover:text-black transition-colors duration-300">Terms</a>
                        <a href="#" className="hover:text-black transition-colors duration-300">Twitter</a>
                        <a href="#" className="hover:text-black transition-colors duration-300">GitHub</a>
                    </div>
                </div>

            </div>
        </section>
    );
}
