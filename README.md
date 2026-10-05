# 🗓️ Global Calendar Module – Campus Infra Management

> **Developer:** Govindu Srimaan ([@Govindu1729](https://github.com/Govindu1729))  
> **Context:** Developed as the lead engineer for the Global Calendar module within the IIT Gandhinagar Campus Infrastructure Management platform.  
> **Original Project:** [Janil-ship-it/campus-infra-management](https://github.com/Janil-ship-it/campus-infra-management)

## 🚀 My Contributions
Designed and implemented the end-to-end Global Calendar system, transforming it from a basic concept into an enterprise-grade, role-based scheduling platform.

### Key Features Built:
- **Role-Based Access Control (RBAC):** Module-level permissions (View/Edit) tied to IITGN's official Faculty-in-Charge (FIC) hierarchy.
- **Real-World Data Integration:** Scraped and integrated 93 real IITGN office/room allocations and 35+ curated institutional events.
- **Smart Scheduling:** Real-time room conflict detection with alternative venue suggestions, plus iCal RRULE support for recurring events.
- **Personalized Dashboard:** Live IST clock, domain-scoped deadlines, and "My Meetings" views tailored to the logged-in official's department.
- **Production-Ready Infrastructure:** Multi-stage Docker containerization, Prisma ORM with MySQL, and comprehensive audit logging.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, FullCalendar.js, Lucide Icons
- **Backend:** Next.js API Routes, Prisma ORM, MySQL 8, Zod validation
- **Auth & Security:** HTTP-only JWT cookies, scrypt password hashing, middleware route protection
- **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD

## 🏗️ Architecture Highlights
- **Module-Agnostic Design:** Uses string-based module identifiers, allowing seamless future integration with other campus modules (e.g., Room Info, Finance) via service-key authenticated REST APIs.
- **Optimized Queries:** Indexed database lookups for fast calendar rendering, even with hundreds of concurrent events.

---
*This module is part of a larger collaborative effort. All original project credits belong to the Campus Infra Management team.*
