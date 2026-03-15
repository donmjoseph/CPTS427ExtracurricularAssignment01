# Reflection — CrimsonCode Hackathon

## Activity Description

CrimsonCode is WSU's annual hackathon. This year's theme was "Reinvent the Wheel," which challenged participants to take something familiar and reimagine it in a meaningful way. Our team interpreted this as reinventing how everyday people interact with U.S. federal regulations. The federal rulemaking process is technically public, but navigating Regulations.gov is not intuitive for most people. We built the Regulations.gov Assistant, a conversational chat application where users can ask plain English questions and get answers pulled directly from live federal data. The goal was simple: make government policy accessible to anyone, not just policy professionals.

## Technical Decisions

The biggest technical question we had to answer was how to connect natural language input to a structured government API in a reliable way. We chose Google Gemini to handle intent parsing and determine which Regulations.gov endpoint to call based on what the user asked. The backend runs on Node.js with Express. One decision I feel good about was keeping all API keys strictly on the backend and proxying every Regulations.gov request through the server so nothing sensitive ever reaches the browser. For the frontend we used React with Vite, mostly because the fast dev server made iteration during a time-crunch event much more manageable. The AI tool-use loop inside server.js ended up being the most important piece of the whole app. It determined how well the assistant could understand a question and respond with something actually useful. Keeping the overall architecture simple with a clear separation between frontend and backend also helped us avoid stepping on each other during development.

## Contributions

I participated as part of a team that I formed at the event itself. My contributions were concentrated on the AI and backend side of the project. I built the Gemini integration, designed the tool-use loop that routes queries to the right API endpoints, and wrote most of the backend server logic. The AI layer was the core of what made the app work as a chat assistant rather than just a search form, so getting that right was where I spent most of my time and energy during the event.

## Quality Assessment

This was my first hackathon and honestly I did not know what I was walking into. The biggest thing that caught me off guard was how many teams came in already formed, with roles figured out and sometimes even a rough project idea ready to go. I formed my team at the event, which meant we spent the first stretch of time just getting to know each other and deciding what to build. That is time that more experienced participants were spending on actual development.

Even with that disadvantage I think we did well. The app works, it does something real, and the problem it solves is genuine. If I could redo it I would come in with a team already, align on a project the night before, and spend the first hour on architecture instead of introductions. I would also scope the project more aggressively upfront so we could finish every feature we planned instead of running out of time.

---
