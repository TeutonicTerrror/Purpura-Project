/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
/*
  ── PurpuraEmoji Reference ──
  Use :emoji_name: in changelog body text to embed emoji images.

  Available (17):
  :Purpura_Bug: :Purpura_Checkmark: :Purpura_Dragon_Face: :Purpura_Eyes:
  :Purpura_Fire: :Purpura_Heart: :Purpura_Pray: :Purpura_Puzzle:
  :Purpura_Skull: :Purpura_Sparkles: :Purpura_Speaker: :Purpura_Thinking:
  :Purpura_Thumbs_Down: :Purpura_Thumbs_Up: :Purpura_Weary:
  :Purpura_Wilted_Rose: :Purpura_X_Mark:

  Example: ## :Purpura_Sparkles: New Features & Additions
*/
var PURPURA_CHANGELOG = [
    {
        version: "1.0.5",
        date: "2026-10-03",
        categories: [
            { key: "new-features", label: "New Features", icon: ":Purpura_Sparkles:" },
            { key: "optimizations", label: "Optimizations", icon: ":Purpura_Puzzle:" },
            { key: "bug-fixes", label: "Bug Fixes", icon: ":Purpura_Bug:" },
            { key: "notes", label: "Notes", icon: ":Purpura_Speaker:" }
        ],
        body: [
            "## :Purpura_Sparkles: New Features & Additions",
            "- NEW **Share Server Links** feature, allowing you to share a quick-link to join a specific Roblox server with anyone, even if they do not have Purpura installed.",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW **Game Reviews** feature, allowing you to review and rate games and share your reviews with other Purpura users. Reviews are fully anonymous.",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW **Community Server Regions** feature, allowing Purpura to anonymously share server information between users to provide more accurate region information for full servers.",
            "  - On by default.",
            "  - Found in the **Security** section of Purpura Settings.",
            "- NEW **Live Counters** feature, displaying live Favorites, Likes, Dislikes, Visits, and Players counts on Game Pages. Each counter can be individually toggled.",
            "  - On by default.",
            "  - Found in the **Games** section of Purpura Settings.",
            "- NEW **Projected Trade Value Warnings** feature, warning you when an item's value is suspected to be projected. Powered by Rolimons.",
            "  - On by default.",
            "  - Found in the **Security** section of Purpura Settings.",
            "- NEW **Unsafe Trade Protection** feature, automatically cancelling trades considered unsafe based on a customizable loss threshold.",
            "  - Off by default.",
            "  - Found in the **Security** section of Purpura Settings.",
            "- **Life-Time Transactions** now displays a loading indicator while scanning for transactions.",
            "- **Life-Time Transactions** now shows the total number of transactions as they are being processed.",
            "- Added a button for the Purpura Website on the extension popup.",
            "",
            "## :Purpura_Puzzle: Optimizations & Adjustments",
            "- **Free Roblox Plus Themes** has been moved into the **Experimental** settings category due to ongoing changes to how Roblox handles the feature.",
            "- **Server Info** has been wired to the Purpura API to provide more accurate region information and improve region loading speed as the Purpura community grows.",
            "- Improved **Home Page Tweaks** speed and performance. Home Page Tweaks now loads instantly after the initial page load.",
            "",
            "## :Purpura_Bug: Bug Fixes",
            "- Fixed an issue where **Ghost Profiles** code was being obfuscated during development builds.",
            "- Fixed **Free Robux Plus Themes** not working due to a Roblox update.",
            "- Fixed **Life-Time Transactions** sometimes reporting inaccurate data.",
            "- Fixed **Avatar Search Bar's \"Item Filters\"** toggle loading indefinitely.",
            "- Fixed **Chat Eligibility Tooltip** incorrectly indicating that you could speak with users you were unable to chat with.",
            "- Fixed **Game Outfits** incorrectly displaying **\"Failed\"** when attempting to equip an outfit.",
            "- Fixed **Purpura Store** loading on every game's store instead of only the intended store section.",
            "- Fixed **Ghost Profiles** not working due to a Roblox update.",
            "- Fixed **Quick Settings Manager** no longer loading in the Roblox top bar after a Roblox update.",
            "- Fixed **Play-Time Tracker** no longer loading in the Roblox top bar after a Roblox update.",
            "- Fixed certain country flags not loading properly in **Server Info**.",
            "- Fixed an issue where **Home Page Tweaks** could inject elements into the wrong parts of a page in rare cases.",
            "- Fixed **Uncorporatify's \"Create → Studio\"** text replacement applying to unrelated elements in the Roblox top bar.",
            "",
            "## :Purpura_Speaker: Developer Notes",
            "v1.0.5 is Purpura's largest updates yet. This release includes a major internal overhaul of Purpura's architecture in order to provide better updates, a lot of new features, and loads of improvements and bug fixes.",
            "",
            "Purpura has a new website, live at [purpura.page](https://purpura.page), providing a central home for Purpura, its features, documentation, and future services.",
            "",
            "Thank you to everyone who helped test the v1.0.5 beta builds!",
            ""
        ].join('\n')
    }
];


