# Gottado - User Guide

Gottado is an operations management app designed for teams — especially restaurant and hospitality teams. It helps you organize tasks, manage team sections, and run structured audits using the **PRESTO** framework for continuous improvement.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Tasks](#tasks)
4. [Sections](#sections)
5. [Audits & PRESTO Framework](#audits--presto-framework)
6. [Profile & Settings](#profile--settings)

---

## Getting Started

### Creating an Account

1. Open the app and tap **Create Account**
2. Enter your name, email, and password (minimum 6 characters)
3. You'll be logged in automatically

### Selecting an Organization

After logging in, you'll see a list of organizations you belong to. Tap one to enter it. If you don't have one yet, ask your team admin to add you.

All data in Gottado is scoped to an organization — tasks, sections, audits, and members are all tied to the org you're currently in.

### Switching Organizations

You can switch orgs at any time:
- From the **Dashboard**, tap the organization chip in the top-right corner
- From the **Profile** tab, tap **Change Organization**

---

## Dashboard

The Dashboard is your home screen. It gives you a quick overview of everything happening in your organization.

### Header Stats

Three cards at the top show:
- **Sections** — how many sections exist in your org
- **Pending Actions** — audit actions waiting to be addressed
- **Avg Score** — average audit score (last 5 audits by default)

### Score Averaging

By default, the average score is calculated from your **last 5 completed audits**. If you have more than 5 audits, you can change this:
- Tap one of the chips below the stats: **Last 5**, **Last 10**, **Last 20**, or **All**
- The "All" option shows the count of total audits (e.g., "All (12)")

### Quick Actions

Three shortcut cards let you jump to:
- **Tasks** — your task list
- **Audits** — audit templates and history
- **Sections** — team sections

### Tasks Overview

Shows how many tasks are pending and completed. Tap to go to the full task list.

### Zone Breakdown

If you've completed audits, this shows scores for each PRESTO zone with trend arrows showing improvement or decline compared to the previous audit.

### Recent Audits

Your last 5 completed audits with color-coded score pills:
- Green (80%+) — excellent
- Orange (50-79%) — needs attention
- Red (below 50%) — critical

### Upcoming Follow-ups

Scheduled follow-up dates for audit reviews.

---

## Tasks

Tasks are the core of daily operations. They're organized by section and support recurring schedules.

### Viewing Tasks

The Tasks tab shows all your tasks grouped by section. Each section card displays:
- Section name and completion count (e.g., "3/5")
- A progress bar
- Pending tasks (shown first)
- Completed tasks (collapsed by default — tap to expand)

Each task shows:
- A checkbox to mark complete
- The task title
- Recurrence label (if set) — e.g., "Daily", "Weekly"
- Due date (if set)

### Creating a Task

Tap the **New Task** button in the header. Fill in:

1. **Title** (required) — what needs to be done
2. **Description** (optional) — add details
3. **Due Date & Time** (optional)
   - Date in YYYY-MM-DD format
   - Time in HH:MM format (24-hour)
4. **Recurrence** (optional) — tap to select, tap again to deselect:
   - Daily, Weekly, Monthly, Quarterly, 6 Months, Yearly
5. **Section** (required) — choose which section this task belongs to
   - Only sections where you're an **owner** or **editor** are shown

Tap **Create Task** when ready.

### Completing Tasks

Tap the checkbox next to a task to mark it complete.

- **One-time tasks**: marked as done permanently
- **Recurring tasks**: automatically reset with the next due date. The completion is logged in the history.

### Task Snapshots

The Snapshot screen shows a daily view of task completions:
- Navigate between dates with arrows
- See how many tasks were completed on time, late, or had no deadline
- Each completion shows the exact time it was logged

---

## Sections

Sections are how you organize your team. Think of them as departments or areas: "Kitchen", "Front of House", "Admin", etc.

### Viewing Sections

The Sections tab groups your sections by your role:
- **My Sections** — sections you own
- **Shared with me** — you're an editor
- **Read Only** — you're a viewer
- **Archived** — deactivated sections

Each section shows your role badge and task count.

### Creating a Section

Tap **New Section** in the header. Enter a name (e.g., "Kitchen") and tap **Create Section**. You'll automatically become the owner.

### Managing Members

Tap a section to see its members. The screen shows two groups:
- **Members** — users currently in the section with their roles
- **Not Assigned** — org members not yet in this section

#### Changing a Member's Role

Tap any member (except the owner) to open the edit panel:
- Choose **Editor** or **Viewer** to change their role
- Tap **Remove from section** to remove them (with confirmation)

#### Adding a New Member

Tap any user in the "Not Assigned" list. A panel appears with two role cards:
- **Editor** — "Can create and edit tasks"
- **Viewer** — "Can view tasks only"

Tap a role card to immediately add that user with that role.

### Archiving & Restoring

Swipe left on an active section to archive it. Swipe left on an archived section to restore or permanently delete it.

### Roles Explained

| Role | Can View | Can Create/Edit Tasks | Can Manage Members |
|------|----------|----------------------|-------------------|
| Owner | Yes | Yes | Yes |
| Editor | Yes | Yes | No |
| Viewer | Yes | No | No |

---

## Audits & PRESTO Framework

The audit system helps you run structured operational assessments and track improvement over time.

### What is PRESTO?

PRESTO is a custom operations excellence framework with 6 zones:

| Zone | Focus Area |
|------|-----------|
| **P — People** | Staffing, training, energy, urgency, uniforms |
| **R — Routines** | Procedures, checklists, prep lists, FIFO, labeling, opening/closing |
| **E — Execution** | Product quality, food safety, presentation, menu availability |
| **S — Standards** | Cleanliness across all areas (dining, stations, bathrooms, kitchen, storage) |
| **T — Team Leadership** | Pre-shifts, focus areas, table visits, positive coaching |
| **O — Operations & Upkeep** | Maintenance issues, repairs, equipment condition (open-ended) |

### The PRESTO Lifecycle

1. **Run a PRESTO audit** — walk through each zone, score checkpoints
2. **Identify opportunities** — flag issues and low scores
3. **Create action plans** — decide what to fix and how
4. **Promote actions to tasks** — using the SMART framework
5. **Re-run PRESTO** — compare scores, see what improved
6. **Repeat** — continuous improvement loop

### Audit Templates

Templates define what you're checking. A PRESTO template comes pre-loaded with 35 checkpoints across 6 zones.

**To seed the PRESTO template:**
- Go to Audits > Templates
- Tap the seed/create option for PRESTO
- The template is created with all default checkpoints

**To create a custom template:**
- Tap the "+" button
- Name your template
- Add checkpoints with zones, labels, and scoring type (Score 0-5 or Pass/Fail)

### Conducting an Audit

1. Go to **Audits > Templates** and tap **Start Audit** on a template
2. You'll enter the conduct screen, organized by zone

**For each zone:**
- You'll see a list of checkpoints (findings)
- **Score-based checkpoints**: tap a number 0-5
- **Pass/Fail checkpoints**: tap Pass or Fail
- If a checkpoint **fails** or scores low, additional fields appear:
  - **Severity** (Low / Medium / High / Critical)
  - **Notes** — describe the issue
  - **Flag for Action** — marks it for the action plan

**Operations & Upkeep zone** is special:
- It starts empty
- Tap **Add Issue** to log maintenance/repair problems you discover
- Each issue gets a label, optional description, severity, and notes

**Navigation:**
- Use **Previous** / **Next Zone** buttons at the bottom
- Tap the colored progress segments at the top to jump between zones
- The progress bar shows which zones are complete

3. On the last zone, tap **Complete Audit**
4. Confirm to finalize — scores are calculated and the run is saved

### Scoring

- **Pass/Fail**: each checkpoint is worth 1 point (pass = 1, fail = 0)
- **Score (0-5)**: each checkpoint has 5 possible points
- **Overall Score** = (points earned / points possible) x 100%
- Zone scores are calculated the same way per-zone

### Action Plans

After completing an audit, go to the **Action Plan** screen:

1. You'll see flagged findings and low-scoring items
2. Tap **+ Create Action** on a finding to define:
   - Action title
   - Description
   - Priority (Low / Medium / High / Critical)
   - Recurrence (if it should repeat)
3. Once created, you can:
   - **Promote to Task** — converts the action into a real task using the SMART framework
   - **Dismiss** — mark it as not needed

### SMART Task Promotion

When promoting an action to a task, you're guided through:
- **S — Specific**: Title and detailed description (pre-filled, editable)
- **M — Measurable**: "How will you measure success?" (e.g., "100% uniform compliance on next audit")
- **A — Achievable**: Select which section to assign the task to
- **R — Relevant**: Auto-filled with the PRESTO zone name
- **T — Time-bound**: Set a due date

### Follow-ups

After completing an audit:
- Schedule a follow-up date for re-assessment
- When the date arrives, complete the follow-up with:
  - A re-assessment score
  - Review notes on how the action plan is progressing
- Compare original scores against new scores to measure improvement

### Viewing Audit History

Go to **Audits > View History** to see all past audit runs with:
- Template name
- Date completed
- Overall score (color-coded)
- Status (Completed / In Progress / Cancelled)

Tap any run to see the full breakdown of findings by zone.

---

## Profile & Settings

The **User** tab shows your profile:
- Your name and email
- **Change Organization** — switch to a different org
- **Log Out** — sign out of the app

---

## Tips for Best Results

1. **Run PRESTO audits regularly** — weekly or bi-weekly gives you the best trend data
2. **Always flag issues** — even small ones. The action plan helps you prioritize
3. **Use recurrence on tasks** — daily opening/closing checklists keep standards high
4. **Check the dashboard daily** — the zone breakdown shows where to focus
5. **Compare audits** — the trend arrows on the dashboard tell you if you're improving
6. **Use the O&U zone actively** — log every maintenance issue you spot during walkthroughs
7. **Promote actions to tasks** — the SMART framework ensures things actually get done
