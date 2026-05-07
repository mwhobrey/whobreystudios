1. Executive App Overview
The Whobrey Studios app will serve as a comprehensive project management and client portal for a graphic design business. Its primary function is to streamline the entire client workflow from initial project request to final file delivery and payment, replacing communication via text and email. The target users are both the business owner ("Admin") and their clients.
2. Core Features & Logic
This is a dual-interface application with distinct "Admin" and "Client" roles, which will require role-based access control.
User/Project Initiation Flow:
- Client: Initiates a new project request via a form.
  - Inputs: Full Name, Business Name (optional), Phone Number, Email Address, Preferred Contact Method, Project Type (e.g., logo, vinyl decal, social media banner), Deadline, and a text field for special notes/instructions.
- System: On form submission, a new project record is created in the database with a "New Request" status.
- Backend: A push notification is sent to the Admin's device.
Quoting & Approval Flow:
- Admin: Views the new project request. Can schedule a follow-up meeting (phone, Zoom) outside the app or proceed directly to quoting.
- Admin: Creates an estimate/quote within the app.
  - Logic: This requires a "Quote Builder" interface where the Admin can add line items for products, labor, and materials. The system must calculate a total.
- Admin: Sends the quote to the client. The project status updates to "Quote Sent."
- Client: Receives a notification. Views the quote.
  - User Actions: Approve, Decline, or Send Message (for questions).
- System: If approved, the project status changes to "Approved." A notification is sent to the Admin. The client is prompted for a deposit payment.
- Backend Requirement: The app must track the state of each project (e.g., New Request, Quote Sent, Approved, In Progress, Final Revision, Completed).
Project Execution & Revision Flow:
- System (Future): Upon deposit payment, the project status updates to "In Progress."
- Admin: Uploads design drafts (files) to the project record for client review.
  - Logic: Each upload must be versioned (e.g., "Revision 1," "Revision 2").
- Client: Views the draft and provides feedback/notes.
- System: When the client requests a change on the second-to-last revision, a modal/pop-up must alert them: "This is your final revision. The next version sent will be the final one." This requires tracking the number of included revisions per project.
Project Completion & Delivery:
- Admin: After the final revision is approved, they can request the final payment.
- System: The app must gate access to the final files. The "Download Files" button for the client should be disabled until the finalpaymentstatus is "Paid."
- Admin: Uploads all final project files (e.g., .ai, .png, .svg).
- Client: After making the final payment, can log in and download all associated final files directly from the app.
Physical Product & E-commerce Logic:
- Client: Can browse a catalog of physical products (e.g., vinyl decals).
- Client: Selects product options like size and quantity.
- System: Adds items to a cart and proceeds through a standard checkout flow.
- Admin: Receives the order, processes it, and adds shipping/tracking details to the order record.
- Client: Can view the order status and tracking information within the app.
Backend Requirements:
- Database: A relational database (e.g., PostgreSQL, MySQL) is required to manage users, projects, quotes, revisions, files, messages, and orders.
- User Authentication: A secure login system for both Admin and Client roles.
- State Management: Robust tracking of project and order statuses.
- File Storage: A solution like AWS S3 or Google Cloud Storage is needed to handle uploading and storing design drafts and final project files.
- Push Notifications: A service (e.g., Firebase Cloud Messaging) to handle real-time alerts for both user types.
- Web API: A RESTful or GraphQL API to connect the mobile/web frontends to the backend services.
3. UI/UX & Graphic Assets
Specific Screens & Components Mentioned:
- Client Dashboard: Main view after login, showing current projects and their statuses.
- Admin Dashboard: Main view showing all projects, with a notification center for new requests and messages.
- New Project Request Form: A form with the specific input fields detailed in the logic section.
- Project Details View: A screen accessible by both user types that contains all project information:
  - Quote/Invoice details
  - A threaded messaging/communication log
  - A file-sharing section for revisions and final files
- Quote Builder (Admin): An interface to create and edit quotes with line items.
- File Uploader: A component for uploading draft and final files.
- E-commerce/Product View: A screen displaying physical products with options for size and quantity.
- Order Tracking View: A screen for clients to view shipping status and tracking numbers.
- Final Revision Alert: A pop-up/modal dialog box with specific warning text.
Graphic Asset Checklist (for Founder):
-  App Icon
-  Logo for use within the app (Splash screen, header)
-  UI Icons (e.g., for menus, upload, download, messages, approve, decline)
-  Any branding elements (color palette, typography choices) for the app's theme.
-  High-quality images for the physical product catalog.
4. Technical Ambiguities & Developer Decisions
- Platform Strategy: The speaker mentioned the app needs to be "web browser compatible" as well as a mobile app. Does this mean a responsive web app first, or native mobile apps (iOS/Android) alongside a web portal? A Progressive Web App (PWA) could be a viable all-in-one solution.
- Payment Integration: The speaker is deferring this but is working with a card merchant. What are the technical capabilities of this merchant's API? We need to know if their payment portal can be embedded or if we need to redirect, and how payment status can be communicated back to our app via webhooks.
- Data Structure for "Project Type": How should product/service types be defined? Should this be a hardcoded list, or a dynamic table in the database that the Admin can manage? The latter is more flexible for building quotes.
- Revision Limits: How is the number of included revisions for a project set? Is this a fixed global value, or does the Admin set it on a per-quote basis in the Quote Builder?
- File Management: What are the acceptable file types and size limits for uploads? How should files be organized in storage (e.g., per-project folders)?
- Real-time Communication: The speaker wants notifications for all communication. Does this imply a real-time chat feature within the project view, or a simpler messaging system? A WebSocket implementation could be considered for a true chat experience.
5. Immediate Action Items
1. Develop User Authentication & Roles: Build the core login/registration system that differentiates between "Admin" and "Client" users. This is foundational for the entire application.
2. Model the Project Database Schema: Define the database tables and relationships for Users, Projects, Quotes, and Messages. Create the initial API endpoints to create and view a new project request (POST /projects, GET /projects/:id).
3. Build the "New Project Request" MVP: Create the client-facing form to submit a new project and the corresponding admin-facing view to see the submitted request details. This creates the first end-to-end user flow and validates the core concept.

