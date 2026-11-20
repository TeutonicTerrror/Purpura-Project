/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

/*
 * Available Tags (Tags are always followed by a colon):
 *   NEW, ADDITION, ADDED, REWORKED, OPTIMIZED, ADJUSTED, CHANGED, IMPROVED,
 *   FIX, FIXED, POTENTIALLY FIXED, REMOVED, RENAMED, SUB, SUB-TOGGLE, BETA, EXPERIMENTAL
 *
 * SUB marks a sub-toggle under the feature above it, for example:
 *   "  - SUB: **New Year's Eve Popup**, which ...; off by default."
 *
 * Available Browser-specific Pills:
 * (Chrome), (Firefox)
 *
 * Example Usage:
 * "- (Firefox) FIXED: **Logouts** when switching tabs."
 * Browser-Specific Pills are ALWAYS used on changes that are specific toward one browser engine.
 */
var PURPURA_CHANGELOG = [
    {
        version: "1.0.7",
        date: "2026-11-20",
        categories: [
            { key: "new-features", label: "New Features", icon: ":Purpura_Sparkles:" },
            { key: "optimizations", label: "Optimizations", icon: ":Purpura_Puzzle:" },
            { key: "bug-fixes", label: "Bug Fixes", icon: ":Purpura_Bug:" },
            { key: "notes", label: "Notes", icon: ":Purpura_Speaker:" }
        ],
        body: [
            "## :Purpura_Sparkles: New Features & Additions",
            "- NEW: **Server Regions Map** feature, which allows you to select regions for your Roblox Server on a map view.",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW: **Best Friends** feature, which allows you to pin your friends to the top of the friends list & carousel.",
            "  - SUB: Home Page Star, which shows the star button on the home page friends carousel; on by default.",
            "  - On by default.",
            "  - Found in the **Friends** section of Purpura Settings.",
            "- NEW: **Most Played** feature, which lets you view your most played games at a glance on the home page!",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW: **Game Blocker** feature, allowing you to block specific games from showing up!",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW: **Roblox Wrapped** feature, which allows you to review your Roblox year!",
            "  - SUB: New Year's Eve Popup, which makes it popup on New Year's Eve automatically; off by default.",
            "  - On by default.",
            "  - Found in the **Miscellaneous** section of Purpura Settings",
            "- NEW: **Verified badge** feature, which adds the Verified badge to your Roblox username across the Roblox site. This is only visible to you.",
            "  - Off by default.",
            "  - Found in the **Appearance** section of Purpura Settings.",
            "",
            "## :Purpura_Puzzle: Optimizations & Adjustments",
            "- REMOVED: **Marketplace Price Floor** due to Roblox API update breaking the method used for this feature.",
            "- ADJUSTED: **Manifest Description** to fit Purpura's brand identity more accurately.",
            "- IMPROVED: **Playtime** data is now account-separated.",
            "- IMPROVED: **Light Mode Support & Theme Editor Support** on **RoPro Playtime Import**, **Quick Settings Manager**, **Projected Warning**, **Item Explorer**, and **Purpura Donation Store**.",
          "",
            "## :Purpura_Bug: Bug Fixes",
            "- FIXED: **Infinite Avatar** causing classic shirts and pants to not equip properly.",
            "- FIXED: **Infinite Avatar** and **Reworked Sidebar** not working on the Avatar Editor page for select users who got an update to NextJS framework.",
            "",
            "## :Purpura_Speaker: Developer Notes",
            "Quite the update... I'm excited to see where this goes!",
            ""
        ].join('\n')
    }
];
