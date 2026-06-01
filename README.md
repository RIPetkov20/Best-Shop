# Suitcase E-Shop – Multi-Page Web Application 
# Capstone project for completion of EPAM Front-End Fundamentals Program 

## 📌 Project Overview

This project is a fully responsive, multi-page e-commerce website for selling suitcases.
It is built using **HTML, SCSS (SASS), and TypeScript**, following a provided Figma design.

The application includes multiple pages such as Homepage, Catalog, Product Details, Cart, About Us, and Contact Us, and implements dynamic functionality using local JSON data.

---

## 🚀 Features

### 🏠 Homepage

* Product sliders and featured sections
* “Selected Products” and “New Products” loaded dynamically from JSON
* Add to Cart functionality

### 📦 Catalog Page

* Filtering (category, color, size, sales status)
* Sorting (price, popularity, rating)
* Search by product name
* Pagination (12 items per page)

### 🔍 Product Details Page

* Dynamic product data loading
* Quantity selector
* Add to Cart
* Related products section

### 🛒 Cart Page

* Add, update, remove products
* Real-time total price calculation
* Discount logic (10% over $3000)
* LocalStorage persistence

### ℹ️ Additional Pages

* About Us
* Contact Us (with validation)

---

## 🛠️ Technologies Used

* HTML5 (semantic structure)
* SCSS (SASS) for styling
* TypeScript (no frameworks)
* LocalStorage API
* JSON data source

---

## ⚙️ Prerequisites

* Node.js (v18 or higher)
* npm (comes with Node.js)

---

## ▶️ Setup & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Run the project

```bash
npm run dev
```

This command:

* Compiles SCSS → CSS into `/dist`
* Compiles TypeScript → JavaScript
* Starts a local development server

> ⚠️ The project should be run using only `npm install` and `npm run dev`.

---

## 📜 Scripts

### Development

* `npm run dev` – compile SCSS & TS + start dev server
* `npm run compile` – compile SCSS only
* `npm run ts-compile` – compile TypeScript

### Linting (Code Quality)

* `npm run lint` – run all linters
* `npm run lint:ts` – check TypeScript files
* `npm run lint:ts:fix` – fix TypeScript issues automatically
* `npm run lint:scss` – check SCSS files
* `npm run lint:scss:fix` – fix SCSS issues automatically
* `npm run lint:fix` – fix all lint issues

---

## 🔍 Code Quality (Linters)

This project uses linters to ensure consistent and maintainable code.

### ESLint (TypeScript)

Analyzes `.ts` files for errors and best practices.

```bash
npm run lint:ts
```

Auto-fix issues:

```bash
npm run lint:ts:fix
```

---

### Stylelint (SCSS)

Ensures consistent styling in `.scss` files.

```bash
npm run lint:scss
```

Auto-fix issues:

```bash
npm run lint:scss:fix
```

---

### Run all linters

```bash
npm run lint
```

Auto-fix everything:

```bash
npm run lint:fix
```

---

## 📁 Project Structure (simplified)

```
src/
 ├── assets/        # JSON data, images
 ├── html/          # HTML pages
 ├── scss/          # SCSS styles
 ├── ts/            # TypeScript logic
dist/               # Compiled CSS/JS
```

---

## 📦 Data Source

All product data is loaded from:

```
src/assets/data.json
```

---

## 🎯 Key Requirements Implemented

* Multi-page architecture
* Responsive design (mobile, tablet, desktop)
* Dynamic content loading
* Filtering, sorting, and pagination
* LocalStorage cart persistence
* Form validation
* Clean and maintainable code structure
* ESLint & Stylelint integration

---

## ✅ Final Notes

* The project follows the provided Figma design (not pixel-perfect).
* No external frameworks (React, Angular, Bootstrap) are used.
* Code is organized, reusable, and maintainable.
---
