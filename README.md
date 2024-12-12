# E-Commerce Microservices Project

This project implements two interdependent microservices for an e-commerce platform:

1. **Inventory Service**: Manages stock data.
2. **Order Service**: Manages orders and stock deduction.

The services communicate via RabbitMQ for event streaming and use Elasticsearch for logging.

---

## **Tech Stack**

- **Node.js** with **TypeScript**
- **MongoDB**: Primary database.
- **RabbitMQ**: Message broker for event-based communication.
- **Elasticsearch**: For logging.
- **Docker & Docker Compose**: Containerization and orchestration.
- **Jest and Supertes**: For testing.

---

## **Architecture**

### Inventory Service

- Add new items to inventory.
- Update stock levels.
- Publish **stock update events** to RabbitMQ.

### Order Service

- Create new orders after checking stock availability.
- Deduct item stock upon successful order creation.
- Listen for stock updates from the Inventory Service and log them.

---

## **Setup Instructions**

### Prerequisites

- Install **Docker** and **Docker Compose**.
- Ensure **Node.js v18+** and **npm** are installed.

---

### **Running the Project**

1. Clone the repository:

   ```
   git clone https://github.com/sarmhi/e-commerce-microservice.git
   ```

2. Start all services using Docker Compose:

   ```
   docker-compose up --build
   ```

3. Verify all services:

- Inventory Service: http://localhost:3001
- Order Service: http://localhost:3002
- RabbitMQ Management UI: http://localhost:15672 (Username: guest, Password: guest)
- Kibana (Elasticsearch UI): http://localhost:5601

---

### **API Endpoints**

**Inventory Service**:

1. _Add a New Item_:
   . Method: POST
   . URL: /api/items
   . Request Body:
   {
   "name": "Laptop",
   "description": "A powerful laptop",
   "quantity": 50,
   "price": 1200
   }

2. _Update Stock_:
   . Method: PATCH
   . URL: /api/items/:itemId
   . Request Body:
   {
   "quantity": 20
   }

3. _Get Item Stock_:
   . Method: GET
   . URL: /api/items/:itemId

**Order Service**:

1. _Create an Order_:
   . Method: POST
   . URL: /api/orders
   . Request Body:
   {
   "itemId": "123",
   "quantity": 2
   }

2. _Fetch All Orders_:
   . Method: GET
   . URL: /api/orders?page=1&limit=5

3. _Fetch an Order_:
   . Method: GET
   . URL: /api/orders/:orderId

---

### **Testing**

Run tests for each service individually:

1. **Inventory Service**:

   ```
   cd inventory-service
   npm test
   ```

2. **Order Service**:

   ```
   cd order-service
   npm test
   ```

3. **End-to-End Tests**:
   Run the E2E tests from the root directory of the whole project. Make sure all servcies are up first
   (run **docker-compose up --build** in the terminal)
   ```
   npm run test:e2e
   ```

---

### **Logs**

Logs for stock updates and errors are stored in Elasticsearch under the index:
_application-logs_.

Use Kibana to view and analyze logs:

Go to **http://localhost:5601**.
Create an index pattern for application-logs.
Search and visualize logs.

---

### **Design Considerations**

This project implements a microservice-based architecture while balancing simplicity and requirements.

**Codebase Simplicity**:

-The codebase was kept minimal to focus on meeting the test requirements. Extraneous complexity was avoided while ensuring core functionality works correctly.

**Communication Between Microservices**:

- I adopted a hybrid communication strategy for inter-service communication:

  **Event-Driven Communication:**

  - Stock updates (publishing events to the queue).
  - Ensures loose coupling as services rely on asynchronous events.

  **Request/Response Communication**:

  - For synchronous checks, such as validating whether an item exists in the Inventory Service during order creation.
  - This approach ensures immediate feedback, which is critical for workflows requiring real-time responses.
  - Using both strategies provides flexibility while ensuring performance and consistency in communication.

**Decoupling and Domain-Driven Design (DDD)**:

- I ensured the services remain as decoupled as possible:
  - Inventory Service manages all stock-related logic.
  - Order Service focuses on order creation and checks stock availability through a separate Inventory Service API.
- While not all microservices can be completely decoupled, effort was made to avoid tight integration (e.g., no shared database).
  -Each service aligns with Domain-Driven Design principles by focusing on its respective bounded context (Inventory for stock, Order for orders).

**Error Handling and Robustness**:

- Errors from external dependencies (e.g., Inventory Service or RabbitMQ) are caught and appropriately handled to ensure services remain reliable.
- Fallbacks include returning user-friendly error messages or logging failures for debugging.

**Event Streaming for Updates**

- RabbitMQ is used as the message broker for event-driven communication.
- When stock updates occur in the Inventory Service, an event is published to notify other services (e.g., for logging purposes or real-time updates).

**Trade-Offs**

- While the codebase adheres to best practices, certain decisions were made for simplicity:
- Request/Response communication is used alongside events to ensure critical checks (like stock availability) are immediate.
- Data duplication is minimized but could be further optimized for a production-grade system.

**Why These Choices?**

**Balancing Simplicity and Real-World Scalability**

- Real-world microservices often require a mix of synchronous and asynchronous communication depending on the workflow's needs.
- Using both strategies demonstrates the ability to handle real-world use cases effectively.

**DDD Alignment**

Each service focuses on a single domain:

- Inventory Service → Stock Management.
- Order Service → Order Lifecycle.
- Services interact through APIs or events, not shared databases, ensuring loose coupling.

**Future Enhancements**

- Additional services (e.g., Notification Service) can subscribe to the same stock update events.
- Request/Response communication can gradually be replaced with event sourcing where appropriate.
