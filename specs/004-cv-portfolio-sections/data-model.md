# Data Model: Professional CV Portfolio Sections

**Feature**: [spec.md](spec.md)  
**Date**: 2026-07-13  
**Status**: Phase 1 - Design

## Overview

This document defines the data entities and their structure for the Experience and Education portfolio sections. All entities are content-based (markdown files) rather than database records.

---

## Entity Definitions

### 1. Experience Entry

**Purpose**: Represents a single professional work position in the Experience section

**Attributes**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **Company Name** | Text (markdown heading) | Yes | Name of organization | "Acme Corporation" |
| **Job Title** | Text (markdown heading) | Yes | Role/position held | "Senior Software Engineer" |
| **Date Range** | Text (formatted date) | Yes | Employment period | "*January 2020 – Present*" or "*June 2018 – December 2019*" |
| **Location** | Text (formatted) | Optional | City, Country or Remote | "*Athens, Greece*" or "*Remote*" |
| **Responsibilities** | List (markdown bullets) | Yes | Key duties and achievements | Bullet list with • and nested ◦ |
| **Technologies** | Text (comma-separated) | Optional | Tech stack used | "Java, Spring Boot, Kubernetes" |
| **Impact** | List (arrows/bullets) | Optional | Measurable outcomes | "→ Increased throughput by 300%" |

**Markdown Structure**:
```markdown
### [Job Title] • [Company Name]

*[Location]* | *[Date Range]*

**Key Responsibilities:**
• [Primary responsibility 1]
• [Primary responsibility 2]
  ◦ [Sub-detail or achievement]
  ◦ [Sub-detail or achievement]
• [Primary responsibility 3]

**Technologies:** [Comma-separated list]

**Impact:**
→ [Measurable outcome 1]
→ [Measurable outcome 2]

---
```

**Ordering**: Chronological, most recent position first (reverse chronological)

**Relationships**: Multiple Experience Entries in a single Experience page (src/content/spec/experience.md)

---

### 2. Education Entry

**Purpose**: Represents a single academic credential or educational program in the Education section

**Attributes**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **Institution Name** | Text (markdown heading) | Yes | University/school name | "National Technical University of Athens" |
| **Degree/Program** | Text (markdown heading) | Yes | Degree earned or program | "Master of Science in Computer Science" or "Bachelor of Engineering" |
| **Field of Study** | Text | Optional | Specialization area | "Software Engineering", "Distributed Systems" |
| **Date Range** | Text (formatted date) | Yes | Study period | "*September 2015 – June 2019*" or "*2019*" (graduation year) |
| **Location** | Text (formatted) | Optional | City, Country | "*Athens, Greece*" |
| **GPA/Honors** | Text | Optional | Academic distinction | "GPA: 3.9/4.0" or "First Class Honours" |
| **Achievements** | List (markdown bullets) | Optional | Notable accomplishments | Bullet list of awards, projects, activities |
| **Relevant Coursework** | Text or List | Optional | Key courses taken | Comma-separated or bullet list |

**Markdown Structure**:
```markdown
### [Degree/Program] • [Institution Name]

*[Field of Study]* | *[Location]* | *[Date Range]*

**Honors:** [GPA or academic distinctions]

**Achievements:**
• [Award or achievement 1]
• [Thesis or capstone project]
• [Academic activity or recognition]

**Relevant Coursework:** [Course 1], [Course 2], [Course 3]

---
```

**Alternative Minimal Structure** (for entries without many details):
```markdown
### [Degree/Program] • [Institution Name]

*[Date Range]* | *[Location]*

---
```

**Ordering**: Chronological, most recent degree first (reverse chronological)

**Relationships**: Multiple Education Entries in a single Education page (src/content/spec/education.md)

---

### 3. Experience Page (Content Collection Entry)

**Purpose**: Container for all professional experience entries

**Attributes**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **slug** | String | Yes (auto) | URL slug: "experience" |
| **collection** | String | Yes (auto) | Collection name: "spec" |
| **body** | Markdown | Yes | Full markdown content with all Experience Entries |

**File Location**: `src/content/spec/experience.md`

**Frontmatter**: Optional (spec collection schema allows empty frontmatter)

**Structure**:
```markdown
# Experience

[Optional intro paragraph]

## Professional Experience

### [Most Recent Position]
[Details...]

---

### [Previous Position]
[Details...]

---

### [Earlier Position]
[Details...]
```

**Content Organization**:
- Single H1 heading at top: "Experience" or "Professional Experience"
- Optional H2 section headings for grouping (e.g., "Professional Experience", "Internships")
- H3 headings for individual entries (job title + company)
- Horizontal rules (---) to separate entries

---

### 4. Education Page (Content Collection Entry)

**Purpose**: Container for all educational background entries

**Attributes**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **slug** | String | Yes (auto) | URL slug: "education" |
| **collection** | String | Yes (auto) | Collection name: "spec" |
| **body** | Markdown | Yes | Full markdown content with all Education Entries |

**File Location**: `src/content/spec/education.md`

**Frontmatter**: Optional (spec collection schema allows empty frontmatter)

**Structure**:
```markdown
# Education

[Optional intro paragraph]

## Academic Background

### [Most Recent Degree]
[Details...]

---

### [Previous Degree]
[Details...]

---

### [Earlier Education]
[Details...]
```

**Content Organization**:
- Single H1 heading at top: "Education" or "Academic Background"
- Optional H2 section headings for grouping (e.g., "Academic Background", "Certifications")
- H3 headings for individual entries (degree + institution)
- Horizontal rules (---) to separate entries

---

## Validation Rules

### Experience Entry Validation:
- ✅ MUST have job title and company name
- ✅ MUST have date range
- ✅ MUST have at least one responsibility bullet point
- ✅ Date format should be consistent: "*Month YYYY – Month YYYY*" or "*Month YYYY – Present*"
- ✅ Chronological order (newest first)
- ⚠️ Optional fields can be omitted if not applicable

### Education Entry Validation:
- ✅ MUST have degree/program and institution name
- ✅ MUST have date range or graduation year
- ✅ Date format should be consistent
- ✅ Chronological order (newest first)
- ⚠️ Optional fields can be omitted if not applicable

### Markdown Formatting Validation:
- ✅ H3 headings for entry titles
- ✅ Italics for dates and locations: `*text*`
- ✅ Bold for section headers: `**text:**`
- ✅ Bullet symbols (•, ◦, ▪) for lists
- ✅ Arrows (→, ⇒) for impact statements
- ✅ Horizontal rules (---) between entries
- ✅ Proper indentation for nested bullets (2 spaces per level)

---

## Content Source Mapping

### From CV PDF to Experience Entry:

1. **Extract** from CV sections labeled "Work Experience", "Professional Experience", or "Employment"
2. **Map** each position to an Experience Entry structure
3. **Transform** plain text bullets into formatted markdown bullets with Unicode symbols
4. **Organize** in reverse chronological order
5. **Enrich** with visual formatting (emphasis, arrows for impact)

### From CV PDF to Education Entry:

1. **Extract** from CV sections labeled "Education", "Academic Background", or "Qualifications"
2. **Map** each degree/program to an Education Entry structure
3. **Transform** into formatted markdown with proper heading hierarchy
4. **Organize** in reverse chronological order
5. **Include** relevant details like honors, thesis work, or notable coursework

---

## State Transitions

**Content Lifecycle**: (Not applicable - content is static markdown files, no workflow states)

**Update Process**:
1. User edits markdown file directly in repository
2. Commit changes to version control
3. Rebuild site (automatic on deploy)
4. Changes reflected in production

---

## Notes

- **No Database**: All content stored in markdown files, no database schema needed
- **No API Layer**: Content consumed via Astro's `getEntry()` API at build time
- **Version Control**: Git provides history and change tracking
- **Extensibility**: New sections (e.g., "Certifications", "Projects") can follow same pattern
- **Schema Flexibility**: `spec` collection has empty schema, allowing any frontmatter structure if needed in future

---

## Example: Complete Experience Entry

```markdown
### Senior Software Engineer • TechCorp International

*Remote* | *March 2021 – Present*

**Key Responsibilities:**
• Architected and implemented distributed microservices platform serving 10M+ daily users
• Led cross-functional team of 8 engineers across 3 time zones
  ◦ Established CI/CD pipelines reducing deployment time by 75%
  ◦ Implemented monitoring and observability stack (Prometheus, Grafana)
• Designed event-driven architecture for real-time data processing
• Mentored 4 junior engineers, conducting code reviews and technical design sessions

**Technologies:** Java 17, Spring Boot, Kubernetes, Kafka, PostgreSQL, Redis, AWS

**Impact:**
→ Reduced API latency from 500ms to 50ms (90th percentile)
→ Improved system reliability from 99.5% to 99.95% uptime
→ Decreased infrastructure costs by 40% through optimization

---
```

## Example: Complete Education Entry

```markdown
### Master of Science in Computer Science • National Technical University of Athens

*Software Engineering & Distributed Systems* | *Athens, Greece* | *September 2017 – June 2019*

**Honors:** GPA 3.9/4.0 • Graduated with Distinction

**Achievements:**
• Master's Thesis: "Scalable Microservices Architecture Patterns" (Grade: A+)
• Published 2 papers in IEEE conferences on distributed systems
• Teaching Assistant for "Advanced Software Engineering" course
• Recipient of Academic Excellence Scholarship (2018-2019)

**Relevant Coursework:** Distributed Systems, Cloud Computing, Software Architecture, Advanced Algorithms, Machine Learning

---
```

---

## Phase 1 Completion Status

✅ Entity structures defined  
✅ Attributes and types documented  
✅ Markdown formatting patterns specified  
✅ Validation rules established  
✅ Content source mapping documented  
✅ Examples provided for both entities  

**Ready to proceed to Contracts definition**
