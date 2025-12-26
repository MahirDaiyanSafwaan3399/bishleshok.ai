import React from "react";

function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="border-t border-[#7c3aed]/20 py-4 sm:py-6 mt-8 sm:mt-12">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <p className="text-sm text-[#e9e5f0] font-medium">
                        © {currentYear} Team Coconut Crew
                    </p>
                    <p className="text-xs text-[#6b8a9e] font-normal">
                        Powered by AI & Firebase
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;