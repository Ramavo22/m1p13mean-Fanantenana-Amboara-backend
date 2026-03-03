# Technical Documentation

## Architecture
The application is structured following the MVC (Model-View-Controller) design pattern. It utilizes Express.js as the framework for building the server-side business logic. The application is modularized to enhance maintainability and scalability.

### Key Components
1. **Routing**: The routing is handled through Express, allowing for the separation of concerns in the application.
2. **Middleware**: Various middleware functions, such as authentication and error handling, are implemented to manage the request-response cycle effectively.
3. **Database Integration**: The application connects to a database using the configurations provided in the `src/config/database.js` file.

## Implementation Details
### app.js
- The entry point of the application where the Express server is initiated.
- Middleware setup and routing are defined here.

### Database Configuration
- Located at `src/config/database.js`. This file contains the logic for connecting to the database, handling continued settings like URL, username, and password.

### Swagger Configuration
- Found in `src/config/swagger.js`, where the API documentation is set up using Swagger UI, aiding in the interactive documentation of the available endpoints.

### Supabase Configuration
- The file `src/config/supabase.js` contains configurations for connecting to the Supabase service, which facilitates database and storage management.

## Modules
The application consists of the following modules, each responsible for specific functionalities:
1. **Users**: Manages user authentication and profile.
2. **Boxes**: Contains functionalities related to storage boxes.
3. **Shops**: Handles shop-specific operations and data.
4. **Product-types**: Manages different product classifications.
5. **Products**: Contains CRUD operations for product entities.
6. **Transactions**: Manages transaction details and logic.
7. **Dashboard**: Provides a summary view of the application metrics.
8. **Rents**: Handles functionality related to rentals.
9. **Storage**: Manages file and data storage features.
10. **Panier**: Manages shopping cart functionalities.
11. **Command**: Handles command-related operations within the application.
12. **Coupons**: Manages discount coupon functionalities.