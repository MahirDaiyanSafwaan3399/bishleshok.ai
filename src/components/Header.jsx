import React, { useState, useEffect } from "react";

function LogoIcon({ className = "h-9 w-9" }) {
    return (
        <div className="relative">
            <svg
                className={className}
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-labelledby="bishleshokLogoTitle"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <rect x="6" y="6" width="52" height="52" rx="13" fill="url(#logoGradient)" />
                <path
                    d={`M22 12
                    H32
                    C39 12 44 17 44 23
                    C44 28 40 32 34 33
                    C40 34 46 38 46 44
                    C46 50 40 54 33 54
                    H22
                    V12
                    Z`}
                    fill="#1e1b2e"
                />
            </svg>
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-[#a78bfa] rounded-full border-2 border-[#1e1b2e] animate-pulse shadow-lg shadow-[#a78bfa]/50"></div>
        </div>
    );
}

function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`bg-[#1a1625]/95 backdrop-blur-xl border-b transition-all duration-300 sticky top-0 z-50 ${
                scrolled
                    ? "border-[#7c3aed]/30 shadow-lg shadow-black/20"
                    : "border-[#7c3aed]/20 shadow-md shadow-black/10"
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 group cursor-pointer">
                        <div className="transform transition-transform duration-300 group-hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
                            <LogoIcon />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                                bishleshok.ai
                            </h1>
                            <p className="text-xs text-[#e9e5f0] hidden sm:block font-medium">
                                Business Intelligence Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-3 lg:space-x-6">
                        {/* Status Badge */}
                        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-[#4c1d95]/30 border border-[#a78bfa]/40 rounded-full backdrop-blur-sm hover:border-[#a78bfa]/60 transition-all duration-200 shadow-lg shadow-[#a78bfa]/20">
                            <div className="relative">
                                <div className="h-2 w-2 bg-[#a78bfa] rounded-full"></div>
                                <div className="absolute inset-0 h-2 w-2 bg-[#a78bfa] rounded-full animate-ping opacity-75"></div>
                            </div>
                            <span className="text-xs font-semibold text-[#a78bfa]">Live</span>
                        </div>

                        {/* User/Action Menu */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Notifications Icon */}
                            <button
                                className="relative p-1.5 sm:p-2 text-[#e9e5f0] hover:text-[#a78bfa] hover:bg-[#4c1d95]/30 rounded-lg transition-all duration-200 group"
                                aria-label="Notifications"
                            >
                                <svg
                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#7c3aed] rounded-full border-2 border-[#1e1b2e]"></span>
                            </button>

                            {/* Settings Icon */}
                            <button
                                className="p-2 text-[#e9e5f0] hover:text-[#a78bfa] hover:bg-[#4c1d95]/30 rounded-lg transition-all duration-200"
                                aria-label="Settings"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </button>

                            {/* User Avatar */}
                            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-[#7c3aed]/20">
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-[#ffffff] font-bold text-sm shadow-lg shadow-[#7c3aed]/30">
                                        B
                                    </div>
                                    <div className="hidden lg:block">
                                        <p className="text-sm font-semibold text-white tracking-tight">Dashboard</p>
                                        <p className="text-xs text-[#e9e5f0] font-medium">Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;