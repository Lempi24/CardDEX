# CardDEX – Your Virtual Pokémon TCG Album

**Live Demo:** [https://www.carddex.pl/](https://www.carddex.pl/)

CardDEX is a full-stack web application for Pokémon TCG enthusiasts. It lets users create a virtual album of their physical card collection, track real-time market prices, and trade with other trainers.

**Note:** This is a non-commercial, educational project. All data is fetched solely for portfolio and demonstration purposes.

---

## Tech Stack

- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Real-Time Communication:** Socket.IO
- **Authentication:** JSON Web Tokens (JWT)
- **Web Scraping:** Puppeteer

---

## Core Features

### Virtual Card Album

Users can create accounts and add Pokémon cards to their personal digital collection by typing the card's name.

### Real-Time Price Scraping

The app fetches current market prices from Cardmarket.com using a custom web scraper, letting users track their collection's value.

### Secure User Authentication

Complete token-based authentication (JWT) for user registration and login.

### Card Trading System

A 1-on-1 trading feature that allows users to:

- Mark cards in their collection as available for trade.
- Search for cards offered by other users.
- Propose, accept, or reject trade offers.

### Real-Time Chat

Once a trade offer is accepted, a private chat room is created between the two users to coordinate the exchange.

---

## Architectural Decisions & Project Evolution

### Refactoring the Card-Adding Feature

Originally, the application supported an OCR-based card-adding mechanism, allowing users to scan cards via their device camera.  
However, the supporting API required loading tens of thousands of card records on the client side, causing long load times and poor mobile performance.

The feature was refactored to use manual card name input, dramatically improving speed and responsiveness. This change prioritized usability over technical complexity. The original OCR implementation remains in the project’s commit history.
