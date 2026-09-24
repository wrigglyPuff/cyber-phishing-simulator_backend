# **🎣GonePhishin' Backend**

## **📖Project Description**
GonePhishin' is a cyber security training portal that teaches people to recognise phishing and other social engineering attacks. It is made up of three parts: an Angular frontend, this NestJS backend, and a separate AI service. The backend is a RESTful API built with NestJS, Prisma and MySQL, secured with JWT authentication. Deployment is achieved with AWS using Docker and GitHub Actions.

Learners work through fictional phishing scenarios inside the portal. For each scenario, they choose what to do and pick out the warning signs. The backend records every attempt and returns their score.

Trainers create modules and scenarios, assign them to learners in their organisation and track progress through reports and a dashboard. Global admins manage organisations across the whole platform.

The AI service uses Ollama to generate realistic phishing scenarios and to evaluate learner responses with constructive feedback. Because the platform produces realistic phishing content, the API only accepts fictional sender addresses and blocks unsafe text in scenarios, and the database includes a log for reviewing AI output and flagging anything unsafe.

## **🧩Features**

<ul>
  <li>RESTful API design</li>
  <li>Role based access control (LEARNER,TRAINER, GLOBAL_ADMIN) with organisation scoping. GLOBAL_ADMIN can reach across organisations</li>
  <li>Secure password hashing</li>
  <li>Training modules containing scenarios with category and difficulty</li>
  <li>Trainers assign modules to individual learners by user ID</li>
  <li>Per module results with a pass mark of 80%</li>
  <li>Improvement tracking (first, latest and best scores)</li>
  <li>Trainer dashboard and reports (completion rate, average score and pass rate by module, per learner breakdown with at risk flags)</li>
  <li>Error handling and validation</li>
  <li>Scenario text is checked for SQL injection patterns</li>
  <li>Request bodies are validated and unknown fields are rejected</li>
  <li>Swagger API documentation at `/api`</li>
</ul>

## **🧑‍💻Tech Stack**

<ul>
  <li><strong>Language:</strong>Typescript</li>
  <li><strong>Framework:</strong>NestJS 11</li>
  <li><strong>Database:</strong>MySQL</li>
  <li><strong>ORM:</strong>Prisma 7 with the MariaDB adapter</li>
  <li><strong>Authentication:</strong>JWT + Passport.js, with bcrypt for password hashing</li>
  <li><strong>Docs:</strong>Swagger (`@nestjs/swagger`)</li>
  <li><strong>Testing:</strong>Jest</li>
  <li><strong>Deployment</strong>Docker</li>
</ul>

## **🧰Other Tools**

<ul>
  <li><strong>Project Management:</strong>Jira</li>
  <li><strong>Design and Prototyping:</strong>Figma</li>
</ul>

## **📁Project Structure**

```text
src/
  auth/              Login, register, refresh tokens, password reset, JWT guards
  users/             User accounts
  organisations/     Organisations (every user belongs to one)
  training-modules/  Training modules and learner assignment
  scenarios/         Phishing scenarios inside modules
  attempts/          Learner attempts at modules and scenarios
  results/           Scores and progress
  dashboard/         Trainer dashboard data
  reports/           Trainer reports and export
  analytics/         Analytics service
  common/            Shared validators and the organisation access check
prisma/              schema.prisma, migrations, seed.ts
test/                End-to-end tests
```


# **🔌API Endpoints**
A valid JWT is needed for "any logged-in user". 
"Trainer/Admin" means the TRAINER or GLOBAL_ADMIN role. 
Users are also restricted to their own organisation (with the exception of GLOBAL_ADMIN)

---
## **🔐Authentication** (`/auth`)

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/register</td>
    <td>Register a new learner</td>
    <td>Public</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/login</td>
    <td>Login user and return JWT (access and refresh token)</td>
    <td>Public</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/logout</td>
    <td>Log out (revoke the refresh token)</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/refresh</td>
    <td>Get a new access token</td>
    <td>Public (needs refresh token)</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/forgot-password</td>
    <td>Start a password reset</td>
    <td>Public</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/reset-password</td>
    <td>Finish a password reset</td>
    <td>Public (needs reset token)</td>
  </tr>
</table>

---

## **🧑‍🤝‍🧑Users** (`/users`)

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users/me</td>
    <td>Get my own profile</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users/learners</td>
    <td>List learners</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users/trainers</td>
    <td>List trainers</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/users</td>
    <td>Create a user</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users/:id</td>
    <td>Get a user</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>PATCH</strong></td>
    <td>/users/:id</td>
    <td>Update user details</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>DELETE</strong></td>
    <td>/users/:id</td>
    <td>Delete user</td>
    <td>Trainer/Admin</td>
  </tr>
</table>

---


## **💼Organisations** (`/organisations`)
<table>
<tr>
<th>Method</th>
<th>Endpoint</th>
<th>Description</th>
<th>Access</th>
</tr>
<tr>
<td><strong>POST</strong></td>
<td>/organisations</td>
    <td>Create an organisation</td>
    <td>Global admin</td>
  </tr>
  <tr>
<td><strong>GET</strong></td>
<td>/organisations/:id</td>
    <td>Get an organisation</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
<td><strong>PATCH</strong></td>
<td>/organisations/:id</td>
    <td>Update an organisation</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
<td><strong>DELETE</strong></td>
<td>/organisations/:id</td>
    <td>Delete an organisation</td>
    <td>Global admin</td>
  </tr>
</table>

---
## **📚Training Modules** (`/training-modules`)
<table>
<tr>
<th>Method</th> 
<th>Endpoint</th> 
<th>Description</th> 
<th>Access</th> 
</tr>
<tr>
<td><strong>POST</strong></td>  
<td>/training-modules</td>  
<td>Create a module</td> 
<td>Trainer/Admin</td>
</tr>
<tr>
<td><strong>GET</strong></td>  
<td>/training-modules</td>  
<td>List modules</td> 
<td>Any logged-in user</td>
</tr>
<tr>
<td><strong>GET</strong></td>  
<td>/training-modules/:id</td> 
<td>Get a module</td>
<td>Any logged-in user</td>
</tr>
<tr>
<td><strong>PATCH</strong></td>
<td>/training-modules/:id</td> 
<td>Update a module</td> 
<td>Trainer/Admin</td>
</tr>
<tr>
<td><strong>DELETE</strong></td>
<td>/training-modules/:id</td> 
<td>Delete a module</td> 
<td>Trainer/Admin</td>
</tr>
<tr>
<td><strong>POST</strong></td>  
<td>/training-modules/:moduleId/assignments</td> 
<td>Assign a learner to a module</td>
<td>Trainer/Admin</td>
</tr>
<tr>
<td><strong>DELETE</strong></td>  
<td>/training-modules/:moduleId/assignments/:userId</td>
<td>Remove a learner from a module</td>
<td>Trainer/Admin</td>
</tr>
</table>

---


## **🎞️Scenarios** (`/scenarios`)

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
    <tr>
    <td><strong>POST</strong></td>
    <td>/scenarios</td>
    <td>Create a new scenario</td>
    <td>Trainer/Admin</td>
  </tr>
      <tr>
    <td><strong>GET</strong></td>
    <td>/scenarios</td>
    <td>List scenarios</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/scenarios/:id</td>
    <td>Get a scenario</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>PATCH</strong></td>
    <td>/scenarios/:id</td>
    <td>Update a scenario</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>DELETE</strong></td>
    <td>/scenarios/:id</td>
    <td>Delete a scenario</td>
    <td>Trainer/Admin</td>
  </tr>
</table>

---


## **🔄Attempts (`/attempts`)**

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/attempts</td>
    <td>Start a module attempt</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/attempts/:id/scenario-attempts</td>
    <td>Submit an answer for a scenario</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/attempts</td>
    <td>List attempts</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/attempts/:id</td>
    <td>Get one attempt</td>
    <td>Any logged-in user</td>
  </tr>
</table>

---

## **📈Results** (`/results`)

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
  <td><strong>POST</strong></td>
  <td>/results/attempts/:attemptId/finalise</td>
  <td>Finish an attempt and calculate the score</td>
  <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/results/me</td>
    <td>My results</td>
    <td>Any logged-in user</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/results/user/:userId</td>
    <td>Results for one learner</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/results/module/:moduleId</td>
    <td>Results for one module</td>
    <td>Trainer/Admin</td>
  </tr>
</table>

---


## **📊Trainer Dashboard** (`/organisations/:orgId/trainer-dashboard`)

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/organisations/:orgId/trainer-dashboard</td>
    <td>Dashboard overview</td>
    <td>Trainer/Admin</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/organisations/:orgId/trainer-dashboard/activity</td>
    <td>Recent activity</td>
    <td>Trainer/Admin</td>
  </tr>
</table>

---

## **📝Reports** (`/organisations/:orgId/reports`)
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Access</th>
  </tr>
  <tr>
  <td><strong>GET</strong></td>
  <td>/organisations/:orgId/reports/overview</td>
  <td>Organisation overview</td>
  <td>Trainer/Admin</td>
  </tr>
  <tr>
  <td><strong>GET</strong></td>
  <td>/organisations/:orgId/reports/modules</td>
  <td>Breakdown by module</td>
  <td>Trainer/Admin</td>
  </tr>
  <tr>
  <td><strong>GET</strong></td>
  <td>/organisations/:orgId/reports/modules/:moduleId</td>
  <td>Detail for one module</td>
  <td>Trainer/Admin</td>
  </tr>
  <tr>
  <td><strong>GET</strong></td>
  <td>/organisations/:orgId/reports/users </td>
  <td>Breakdown by user </td>
  <td>Trainer/Admin</td>
  </tr>
  <tr>
  <td><strong>GET</strong></td>
  <td>/organisations/:orgId/reports/users/:userId</td>
  <td>Detail for one user</td>
  <td>Trainer/Admin</td>
  </tr>
  <tr>
  <td><strong>GET</strong></td> 
  <td>/organisations/:orgId/reports/export</td>
  <td>Export report data</td>
  <td>Trainer/Admin</td>
  </tr>
  </table>

  ---

  ## **⚕️Health check**
  <table>
  <tr>
  <th>Method</th> 
  <th>Endpoint</th> 
  <th>Description</th> 
  <th>Access</th>
  </tr>
  <tr>
  <td><strong>GET</strong></td> 
  <td>/</td> 
  <td>Check the API is running</td>
  <td>Public</td> 
  </tr>
  </table>


# **⚙️Installation**

## **🛠️Prerequisites**

Before running the application, ensure you have the following installed on your local machine:

- Node.js
- npm
- MySQL

---

## **🗄️MySQL Setup**

Create a local MySQL database for the application.

You will need the following details:

- Host
- Port
- Username
- Password
- Database Name

---
## **🌳Environment Variables**

Confirm your .env file in the project root contains the following values:

```bash
DATABASE_URL="mysql://yourUser:yourPassword@127.0.0.1:3306/yourDatabaseName"
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=yourUser        
DB_PASSWORD=yourPassword
DB_NAME=yourDatabaseName
JWT_SECRET="yourSecret"
```
Optional settings (default is in brackets): `ACCESS_TOKEN_TTL` [12h], `REFRESH_TOKEN_TTL_DAYS` [7], `RESET_TOKEN_TTL_MINUTES` [30].

## **📦Install Dependencies**

Run the following command to install all required packages:

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Create the database tables

```bash
npx prisma migrate deploy
```

Add test data

```bash
npm run seed
```
## **🏁Start the Application**

Run the NestJS application in development mode:

```bash
npm run start:dev
```
Start the API on http://localhost:3000

Swagger API docs are at http://localhost:3000/api

## **🏃‍♀️🧪Run tests**

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## **🔑Test Logins** (development only, generated by the seed)

<table>
  <tr>
  <th>Role</th> 
  <th>Email</th> 
  <th>Password</th> 
  </tr>
  <tr>
  <td>Global admin</td> 
  <td>admin@test.com</td>
  <td>Password1!</td>
  </tr>
  <tr> 
  <td>Trainer</td>
  <td>trainer@test.com</td>
  <td>Password1!</td> 
  </tr>
  <tr>
  <td>Learner</td>
  <td>learner@test.com</td>
  <td>newPassword1!</td>
  </tr>
  </table>



# **🤝Contributing**

This project is a part of a university software development project. As of 2026, only group members may contribute and make improvements.

## **🪪License**

UNLICENSED. This is a university group project and only group members can contribute.
