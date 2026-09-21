/** Site-wide identity and profile. Edit here; every page reads from it. */

export type SocialLink = {
  label: string;
  href: string;
  icon: "linkedin" | "github" | "substack" | "globe" | "mail";
};

export const site = {
  name: "Stupid Experiments",
  fullName: "Stupid Experiments and Public Findings Lab",
  tagline: "A personal public lab where curiosity turns into experiments, and experiments into writing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  notebookNumber: "04",
  location: "Bangalore",
} as const;

export const author = {
  name: "Samarth Saraswat",
  initials: "SS",
  role: "AI Engineer",
  bio: [
    "AI engineer at Tazapay, building fraud and anti-money-laundering detection for cross-border payments. Before that, three-plus years at Microsoft on LLM copilots and agents. IIT Guwahati. Occasionally holds a microphone and tells strangers jokes.",
  ],
  labStatement: "This lab is where I stop saying “someone should test that” and test it myself.",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com/in/s-samarth", icon: "linkedin" },
    { label: "GitHub", href: "https://github.com/s-samarth", icon: "github" },
    { label: "Substack", href: "https://samarthsaraswat.substack.com", icon: "substack" },
    { label: "samarthsaraswat.com", href: "https://samarthsaraswat.com", icon: "globe" },
    { label: "Email", href: "mailto:samarth.iitg@gmail.com", icon: "mail" },
  ] satisfies SocialLink[],
} as const;
