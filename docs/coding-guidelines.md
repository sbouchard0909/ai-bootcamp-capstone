# Coding Guidelines

## Overview
This document outlines the coding standards and best practices for the AI Bootcamp Capstone project. These guidelines ensure consistency, maintainability, and code quality across the entire codebase.

## Coding Style

### Indentation
- **Use tabs for indentation**
- Tabs are more accessible and allow developers to configure their preferred visual width
- Never mix tabs and spaces

### Line Length
- Keep lines to a maximum of 100 characters
- Improves readability and reduces horizontal scrolling
- Exception: URLs or long strings that cannot be broken

### Semicolons
- Always use semicolons at the end of statements
- Semicolons prevent potential issues with automatic semicolon insertion

### Quotes
- Use double quotes (`"`) for strings
- Use backticks (`` ` ``) for template literals
- Maintain consistency throughout the codebase

### Variable Naming
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `API_BASE_URL`)
- **Variables and Functions**: `camelCase` (e.g., `userName`, `calculateTotal()`)
- **Classes and Components**: `PascalCase` (e.g., `UserProfile`, `VacationCard`)
- **Private Methods**: Prefix with underscore `_methodName()`
- Use descriptive names that clearly indicate purpose

### Comments
- Write clear, concise comments for complex logic
- Use single-line comments (`//`) for brief explanations
- Use block comments (`/* */`) for multi-line explanations
- Avoid redundant comments that restate the code
- Update comments when code changes

## Import Organization

### Order
Organize imports in the following order:

1. **Standard Library Imports** (e.g., `fs`, `path` in Node.js)
2. **Third-Party Dependencies** (e.g., `express`, `react`, `lodash`)
3. **Local/Internal Imports** (e.g., `./utils`, `../config`)

Within each group, sort imports **alphabetically**.

### Examples

**JavaScript/Node.js:**
```javascript
// Standard Library
const fs = require("fs");
const path = require("path");

// Third-Party Dependencies
const express = require("express");
const lodash = require("lodash");

// Local Imports
const config = require("./config");
const utils = require("./utils");
```

**ES6 Modules:**
```javascript
// Standard Library
import fs from "fs";
import path from "path";

// Third-Party Dependencies
import express from "express";
import React from "react";

// Local Imports
import config from "./config.js";
import { calculateTotal } from "./utils.js";
```

**React Components:**
```javascript
// Standard Library
import React from "react";

// Third-Party Dependencies
import axios from "axios";
import classNames from "classnames";

// Local Imports
import Button from "./Button.js";
import { useUser } from "../hooks/useUser.js";
```

### Guidelines
- No blank lines between groups (only one blank line separating groups)
- Use destructuring for named imports when appropriate
- Avoid importing entire modules unless necessary
- Alias imports only when necessary to avoid naming conflicts

## Formatting

### Spacing
- Use 2 blank lines between top-level functions and classes
- Use 1 blank line between methods within a class
- Use spaces around operators: `a + b`, not `a+b`
- No trailing whitespace

### Brackets and Braces
- Opening brace on the same line (One True Brace style)
- Consistent closing brace placement
- Always use braces for control structures, even single statements

**Example:**
```javascript
if (condition) {
	doSomething();
}

function calculateValue(x) {
	return x * 2;
}
```

### Function Parameters
- Limit to a maximum of 3-4 parameters
- Use object destructuring for multiple related parameters
- Add default parameters where appropriate

```javascript
// Good
function createVacation({ destination, startDate, endDate, budget }) {
	// implementation
}

// Avoid
function createVacation(destination, startDate, endDate, budget, notes, status, private) {
	// implementation
}
```

### Arrow Functions
- Use arrow functions for callbacks and short operations
- Use regular functions for methods and constructors
- Maintain consistency within the same file

## Linting

### Tools
- **JavaScript/Node.js**: ESLint
- **React**: ESLint with React plugin
- **CSS**: Stylelint

### Configuration
- Follow project's `.eslintrc` configuration
- Use recommended presets as a base
- Customize rules to match team standards
- Run linting before committing code

### Commands
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Pre-Commit Hooks
- Use husky or similar tools to run linting on staged files
- Prevent commits that violate linting rules
- Ensure code quality from the start

## DRY Principle (Don't Repeat Yourself)

### Definition
Avoid code duplication. Each piece of knowledge should exist in exactly one place.

### Application

#### Extract Common Logic
Create utility functions for repeated code:

**Before:**
```javascript
// User component
const userFullName = `${user.firstName} ${user.lastName}`;

// Vacation component
const ownerFullName = `${owner.firstName} ${owner.lastName}`;
```

**After:**
```javascript
// utils.js
export function formatFullName(firstName, lastName) {
	return `${firstName} ${lastName}`;
}

// Usage in components
const userFullName = formatFullName(user.firstName, user.lastName);
const ownerFullName = formatFullName(owner.firstName, owner.lastName);
```

#### Use Reusable Components
Build component libraries for UI elements:

```javascript
// Reusable Button component
export function Button({ label, onClick, variant = "primary" }) {
	return (
		<button className={`btn btn--${variant}`} onClick={onClick}>
			{label}
		</button>
	);
}

// Usage across the app
<Button label="Submit" onClick={handleSubmit} />
<Button label="Cancel" onClick={handleCancel} variant="secondary" />
```

#### Leverage Configuration
Use configuration files instead of hardcoding values:

```javascript
// config.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_RETRIES = 3;

// Usage in API calls
const fetchVacations = async () => {
	const response = await fetch(`${API_BASE_URL}/vacations`);
	return response.json();
};
```

#### Use Inheritance and Composition
Leverage class inheritance and function composition to avoid duplication:

```javascript
// Base class
class BaseAPI {
	constructor(baseURL) {
		this.baseURL = baseURL;
	}

	async get(endpoint) {
		const response = await fetch(`${this.baseURL}${endpoint}`);
		return response.json();
	}
}

// Specific API
class VacationAPI extends BaseAPI {
	getVacations() {
		return this.get("/vacations");
	}
}
```

### Benefits
- Easier maintenance: Fix bugs in one place
- Consistency: Same behavior across the app
- Scalability: Adding features doesn't compound complexity
- Readability: Clear intent and reduced cognitive load

## Code Quality Checklist

Before submitting code for review:

- [ ] Code passes all linting rules (`npm run lint`)
- [ ] No unnecessary duplication (DRY principle applied)
- [ ] Functions are focused and have single responsibility
- [ ] Variable and function names are descriptive
- [ ] Imports are organized alphabetically by group
- [ ] Comments explain "why", not "what"
- [ ] No console logs or debug code left in
- [ ] Code follows the formatting guidelines
- [ ] Tests are written and passing (where applicable)
- [ ] No hardcoded values (use configuration instead)

## Version Control

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove", "Refactor"
- Keep messages concise but informative

**Example:**
```
Add vacation creation form validation
Fix budget calculation error in vacation summary
Update user profile component styling
```

### Branch Naming
- Use lowercase with hyphens: `feature/vacation-planning`, `fix/api-error`
- Be descriptive but concise

## Performance Considerations

- Avoid unnecessary re-renders in React components
- Use memoization for expensive calculations
- Lazy load components and routes
- Optimize images and assets
- Minimize bundle size

## Security

- Never hardcode sensitive information (API keys, passwords)
- Use environment variables for configuration
- Validate and sanitize user input
- Use HTTPS for all communications
- Keep dependencies up to date
