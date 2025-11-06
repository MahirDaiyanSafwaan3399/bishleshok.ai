import React from "react";


function LogoIcon({ className = "h-10 w-10" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="bishleshokLogoTitle"
        >

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

           
        </header>
    );
}

export default Header;
