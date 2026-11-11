# Assumptions & Design Decisions

This document outlines the key assumptions and design decisions made while developing the School Admission System.

### 1. Overall System Approach

I approached this assignment by considering it as a complete School Admission System rather than implementing only the minimum required screens. Therefore, I added a navbar, footer, hero section, and other basic UI elements to provide a more complete and user-friendly frontend experience.

### 2. Minimal Implementation

After establishing the overall frontend structure, I focused on implementing the core admission workflow in a minimal and straightforward way. I avoided adding unnecessary features beyond the assignment requirements.

### 3. Architecture Decisions

I chose **Clean Architecture** to maintain separation of concerns, maintainability, and testability.

I considered more complex approaches, such as Modular Monolith with Vertical Slice Architecture or Microservices, but decided they would introduce unnecessary complexity for the scope and size of this assignment.

### 4. Admin Panel and Security

I intentionally did not implement a separate Admin Panel or authentication and authorization system.

- Class creation is accessible directly through the application without an admin login.
- No role-based access control was introduced.
- Student identification uses the provided Birth Registration Number through the `X-Student-Id` header.

This was a deliberate simplification to focus on the core admission workflow rather than building a complete administrative and security infrastructure.

**Note:** These choices are suitable only for the limited assignment scope. A production system would require proper authentication, authorization, and administrative access control.

### 5. Testing

I added integration tests to verify important backend functionality, including API behavior, admission workflows, and concurrent seat allocation.

The concurrency test specifically verifies that simultaneous admission requests cannot exceed the configured seat capacity.

---

**Development Philosophy:** Keep the implementation simple, maintainable, and focused on the assignment requirements while avoiding unnecessary architectural complexity.
