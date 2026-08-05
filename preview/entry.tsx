/**
 * Entry point for the standalone preview bundle.
 *
 * Mounts the same <Site /> the Next.js route renders into a plain DOM node, so
 * the whole page can be shipped as one self-contained HTML file for review.
 * The deployed site does NOT use this file.
 */
import { createRoot } from "react-dom/client";

import { Site } from "@/components/site";

const host = document.getElementById("root");
if (host) createRoot(host).render(<Site />);
