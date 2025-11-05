import React from "react";

/*
  HeaderWithBLogo.jsx
  - A polished React Header component with a cooler, modern "B" SVG logo for bishleshok.ai
  - Uses an SVG gradient, soft drop shadow, and crisp geometric/rounded "B" shape.
  - Export: default Header
*/

function LogoIcon({ className = "h-10 w-10" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="bishleshokLogoTitle"
        >
            <title id="bishleshokLogoTitle">
                bishleshok.ai logo (solid white)
            </title>

            {/* Solid background with rounded corners */}
            <rect x="6" y="6" width="52" height="52" rx="13" fill="#ffffff" />

            {/* Bold "B" shape cutout */}
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
                fill="#000000ff"
            />
        </svg>
    );
}


function Header() {
    return (
        <header className="flex justify-between items-center p-5 glass-panel panel-fade-in">
            <div className="flex items-center space-x-3">
                <LogoIcon />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-300 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                    bishleshok.ai
                </h1>
            </div>

            <nav>
                <ul className="flex items-center space-x-2 sm:space-x-4">
                    <li>
                        <a
                            href="#"
                            className="hidden sm:block text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg"
                        >
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="hidden md:block text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg"
                        >
                            Trends
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="text-sm sm:text-base bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-400 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            My Profile
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
