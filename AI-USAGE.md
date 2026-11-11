# AI Usage Report

## 1. AI Tools Used

I used the following AI tools during the development of this project:

| AI Tool            | Purpose                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT            | Requirement analysis, architectural discussions, technical decision-making, problem-solving, and reviewing implementation approaches. |
| Google Antigravity | Coding assistance, generating and refining code, frontend and backend implementation, and Docker configuration assistance.            |

## 2. How AI Was Used

**ChatGPT:**

- Analyzed assignment requirements and identified implementation priorities.
- Discussed architecture choices, including Clean Architecture and alternative architectural approaches.
- Evaluated technical solutions and helped troubleshoot development issues.
- Assisted in preparing project documentation.

**Google Antigravity:**

- Assisted with frontend component implementation and UI improvements.
- Helped implement backend functionality.
- Assisted with Dockerfile, Nginx, and Docker Compose configuration.
- Helped identify and fix implementation issues.

## 3. AI Mistakes and How I Identified Them

AI-generated suggestions were not always directly compatible with the existing project structure or configuration.

Some examples include:

- **Docker build configuration:** Initial Dockerfile instructions did not correctly account for the repository-root build context and `.dockerignore` rules. I identified the issue through Docker build warnings and error messages and corrected the configuration.
- **Dependency installation:** The Docker-based `npm ci` process failed. I investigated the issue and used a local frontend build as an alternative to produce the production assets.

## 4. My Responsibility

AI tools were used as development assistants, not as replacements for engineering decisions.

I reviewed the generated suggestions, evaluated them against the assignment requirements, made implementation decisions, corrected issues, and verified the resulting application through actual builds and tests.

**Final Note:** The responsibility for the final implementation, technical decisions, and submitted code remains mine.
