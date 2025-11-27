
# 🎫 Resell - Distributed Ticket Reselling Platform

**Resell** is a robust, microservices-based web application enabling users to list, purchase, and resell event tickets securely. It solves the problem of concurrency in ticket sales (preventing two people from buying the same ticket) using database transaction locking and event-driven architecture.

The system is deployed via **Kubernetes**, uses **NGINX Ingress** as a gateway, and relies on a custom-built **NPM library** for shared code across services.

---

## 📐 System Architecture

The application follows a strictly decoupled microservices pattern. 

* **Entry Point:** All traffic is routed through an **NGINX Ingress Controller**, which acts as a reverse proxy, directing requests to the specific frontend or backend service.
* **Communication:** Services communicate asynchronously using **NATS Streaming Server**.
* **Database:** Each service owns its own Database (MongoDB) to ensure loose coupling.



---

### Architecture Diagram

```mermaid
graph TD
    User((User/Browser))
    
    subgraph K8s_Cluster [Kubernetes Cluster]
        Ingress[NGINX Ingress Load Balancer]
        
        subgraph Services
            Client[Client UI - Next.js]
            Auth[Auth Service]
            Tickets[Tickets Service]
            Orders[Orders Service]
            Payments[Payments Service]
        end
        
        subgraph Async_Messaging
            NATS[NATS Streaming Server]
        end
        
        subgraph Workers
            Expiration[Expiration Service - Redis]
        end
    end

    User -->|HTTPS Request| Ingress
    
    Ingress -->|/| Client
    Ingress -->|/api/users| Auth
    Ingress -->|/api/tickets| Tickets
    Ingress -->|/api/orders| Orders
    Ingress -->|/api/payments| Payments

    Tickets <-->|Events| NATS
    Orders <-->|Events| NATS
    Payments <-->|Events| NATS
    Expiration <-->|Events| NATS
````

The application is composed of several independent services that communicate asynchronously via the **NATS Streaming Server**.

| Service | Description | Database |
| :--- | :--- | :--- |
| **Auth** | Handles user signup, signin, and signout (JWT-based). | MongoDB |
| **Tickets** | Manages ticket creation, editing, and retrieval. | MongoDB |
| **Orders** | Handles order creation and cancellation. | MongoDB |
| **Expiration** | A worker service that handles 15-minute order expiration timers. | Redis (Queue) |
| **Payments** | Processes payments using the Stripe API. | MongoDB |
| **Client** | Next.js frontend for interacting with the application. | - |
| **Common** | Shared NPM library containing error handling, middlewares, and events. | - |
-----

## 📦 Shared NPM Library

One of the unique engineering features of this project is the abstraction of common logic into a private NPM package.

  * **Package Name:** `@git-tix/common` (located in the `/common` directory)
  * **Purpose:** To prevent code duplication across microservices.
  * **What it handles:**
      * **Standardized Error Handling:** Uniform error responses (400, 401, 404) across all services.
      * **Middlewares:** `currentUser`, `requireAuth`, and `validateRequest` logic.
      * **Event Definitions:** Strictly typed interfaces for NATS events (e.g., `TicketCreatedEvent`) to ensure type safety across the distributed system.

-----

## 🧩 Service Breakdown (Simplified)

Here is what each microservice is responsible for:

### 1\. 🔐 Auth Service

**The Gatekeeper.**

  * Handles User Sign-up, Sign-in, and Sign-out.
  * Issues secure **JWTs (JSON Web Tokens)** via HTTP-only cookies.
  * Stores user credentials securely in its own database.

### 2\. 🎟️ Tickets Service

**The Inventory Manager.**

  * Allows users to create (list) new tickets for sale.
  * Allows users to edit ticket details (price/title).
  * Manages the "Locked" status of a ticket when it is currently being purchased by another user.

### 3\. 📝 Orders Service

**The Transaction Handler.**

  * Creates an "Order" when a user clicks "Buy".
  * Implements a 15-minute reservation window. If the user doesn't pay within 15 minutes, the order is cancelled and the ticket is released back to the pool.

### 4\. ⏳ Expiration Service

**The Timer.**

  * A specialized worker service using **Redis** and **Bull Queues**.
  * When an order is created, this service starts a 15-minute countdown.
  * Once the time is up, it emits an event to cancel the unpaid order.

### 5\. 💳 Payments Service

**The Banker.**

  * Integrates with the **Stripe API** to process credit card charges.
  * Listens for created orders and handles the financial transaction.
  * Updates the order status to "Complete" upon success.

### 6\. 💻 Client (Frontend)

**The Interface.**

  * Built with **Next.js** for Server Side Rendering (SSR).
  * Provides the dashboard for users to view available tickets, manage their listings, and see their purchase history.

-----

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, Bootstrap, Hooks |
| **Backend** | Node.js, Express, TypeScript |
| **Databases** | MongoDB (Mongoose), Redis |
| **Messaging** | NATS Streaming Server |
| **DevOps** | Docker, Kubernetes, Skaffold, GitHub Actions |
| **Testing** | Jest, Supertest |
| **Cloud** | DigitalOcean (k8s), Google Cloud (Storage) |



-----

## 🔧 Local Setup & Installation

This project relies on **Skaffold** to orchestrate the Docker containers in a local Kubernetes environment.

1.  **Prerequisites:**

      * Docker Desktop (Kubernetes enabled)
      * Ingress-Nginx Controller installed
      * Skaffold installed
      * Add `127.0.0.1 ticketing.dev` to your hosts file.

2.  **Secrets:**
    Create the necessary secrets for JWT and Stripe:

    ```bash
    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_string
    kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_key
    ```

3.  **Start:**

    ```bash
    skaffold dev
    ```

    *This will build all images and deploy the microservices network to your local cluster.*



## 🛠️ Key Features

- **Async Communication:** Services communicate via events (e.g., `TicketCreated`, `OrderCreated`) using NATS.
- **Concurrency Control:** Optimistic Concurrency Control (OCC) using version numbers to prevent race conditions during ticket updates.
- **Data Consistency:** Database transactions and event publishing are synchronized.
- **Shared Library:** A custom NPM package (`@git-tix/common`) shares types, errors, and middlewares across services.
- **Automated Testing:** Jest is used for unit and integration testing across all services.

---

## 🔧 Getting Started

### Prerequisites
Ensure you have the following installed on your local machine:
1. **Docker Desktop** (with Kubernetes enabled)
2. **Skaffold** (for handling the dev workflow)
3. **Ingress NGINX** (setup on your local K8s cluster)
4. A host entry in your `/etc/hosts` file:
   ```bash
   127.0.0.1 ticketing.dev


### Running Locally

This project uses **Skaffold** to handle building, pushing, and deploying all manifests to your local Kubernetes cluster automatically.

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/Nethmalwje/Ticketing-microServices.git](https://github.com/Nethmalwje/Ticketing-microServices.git)
    cd Ticketing-microServices
    ```

2.  **Create Secrets**
    You need to create Kubernetes secrets for JWT and Stripe.

    ```bash
    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
    kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_key
    ```

3.  **Start the App**

    ```bash
    skaffold dev
    ```

    *This will build the Docker images, deploy them to your local K8s cluster, and watch for file changes.*

4.  **Access the App**
    Open your browser and navigate to:
    [http ://ticketing.dev](http ://ticketing.dev)

-----

## 📂 Project Structure

```bash
Ticketing-microServices/
├── auth/            # Authentication service
├── client/          # Next.js Frontend
├── common/          # Shared library (published to NPM)
├── expiration/      # Redis-based job queue for timing out orders
├── infra/k8s/       # Kubernetes infrastructure manifests
├── orders/          # Order management service
├── payments/        # Payment processing service
├── tickets/         # Ticket inventory management
└── skaffold.yaml    # Skaffold configuration
```

## 🧪 CI/CD

The project includes a `.github/workflows` directory for CI/CD pipelines.

  - **Test on PR:** Runs unit tests when a Pull Request is opened.
  - **Deploy:** Builds and pushes Docker images to Docker Hub upon merging to `master`.

-----

