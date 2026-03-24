# **🎣GonePhishin' Backend**
## **Project Description**
This is the prototype of an AI-powered Cyber Phishing simulator and training portal. Built using a RESTful API, NestJS and JWT. Gone Phishin' backend will manage user authentications, simulation scenarios, training modules and performance tracking

This backend will also enable trainers to see what learners have completed and their scores.

## **🧩Features**
<ul>
  <li>RESTful API design</li>
  <li>Rose based access control (learner vs trainer)</li>
  <li>Secure password hashing</li>
  <li>Training module delivery</li>
  <li>Quiz and results tracking</li>
  <li>Error handling and validation</li> 
</ul>

## **🧑‍💻Tech Stack**
<ul>
  <li><strong>Language:</strong>Typescript</li>
  <li><strong>Framework:</strong>NestJS</li>
  <li><strong>Database:</strong>MySQL</li>
  <li><strong>ORM:</strong>Prisma</li>
  <li><strong>Authentication:</strong>JWT + Passport.js</li>
</ul>

## **🧰Other Tools**
<ul>
  <li><strong>Project Management:</strong>Jira</li>
  <li><strong>Design and Prototyping:</strong>Figma</li>
</ul>

## **Project Structure**
🚧👷‍♀️🚧
<ul>
</ul>

# **🔌API Endpoints**
## **Authentication**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/register</td>
    <td>Register a new learner or trainer</td>
    <td>No</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/auth/login</td>
    <td>Login user and return JWT token</td>
    <td>No</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/auth/me</td>
    <td>Get current logged-in user</td>
    <td>Yes</td>
  </tr>
</table>

---

## **🧑‍🤝‍🧑Users**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users</td>
    <td>Get all users (trainer view)</td>
    <td>Yes (Trainer)</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/users/:id</td>
    <td>Get user profile and results</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>PATCH</strong></td>
    <td>/users/:id</td>
    <td>Update user details</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>DELETE</strong></td>
    <td>/users/:id</td>
    <td>Delete user</td>
    <td>Yes (Trainer)</td>
  </tr>
</table>

---

## **🎞️Scenarios**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/scenarios</td>
    <td>Get assigned training scenarios</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/scenarios/:id</td>
    <td>Get scenario details</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/scenarios</td>
    <td>Create a new scenario</td>
    <td>Yes (Trainer)</td>
  </tr>
  <tr>
    <td><strong>PATCH</strong></td>
    <td>/scenarios/:id</td>
    <td>Update a scenario</td>
    <td>Yes (Trainer)</td>
  </tr>
  <tr>
    <td><strong>DELETE</strong></td>
    <td>/scenarios/:id</td>
    <td>Delete a scenario</td>
    <td>Yes (Trainer)</td>
  </tr>
</table>

---

## **Attempts (Learner Actions)**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/attempts</td>
    <td>Submit learner decision for a scenario</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/attempts/user/:id</td>
    <td>Get all attempts for a user</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/attempts/:id</td>
    <td>Get specific attempt details</td>
    <td>Yes</td>
  </tr>
</table>

---

## **Feedback**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/feedback/:attemptId</td>
    <td>Get feedback for a specific attempt</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>POST</strong></td>
    <td>/feedback</td>
    <td>Create feedback (manual or AI-generated)</td>
    <td>Yes</td>
  </tr>
</table>

---

## **Results / Progress Tracking**
<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
    <th>Auth Required</th>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/results/user/:id</td>
    <td>Get summary of user performance</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td><strong>GET</strong></td>
    <td>/results</td>
    <td>Get all results (trainer dashboard)</td>
    <td>Yes (Trainer)</td>
  </tr>
</table>

# **🔏Contributing**
This project is a part of a university software development project. As of 2026, only group members may contribute and make improvements.


## **Installation**
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Install Prisma
<mark> NB: schema provided </mark>

```bash
#install dependencies
npm install @prisma/client      //runtime library for Prisma
npm install prisma --save-dev  //CLI for generating client, migrations, and database introspection
```
<mark>Create your own .env file in the root folder OR add the following: </mark><br>
```bash
DATABASE_URL="mysql://username:password@localhost:3306/db_name"
```
## Generate a prisma client
```bash
npx prisma generate
```

## Update local database
```bash
npx prisma migrate dev
```

🚧👷🚧 BELOW
## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
