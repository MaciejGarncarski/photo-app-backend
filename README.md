<p align="center">
  <img width="192" height="192" src="https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/logo.png">
</p>

# PhotoApp - backend

- [PhotoApp - backend](#photoapp---backend)
  - [Overview](#overview)
  - [Live](#live)
  - [Installation \& running](#installation--running)
    - [Install node dependencies](#install-node-dependencies)
    - [Add .env](#add-env)
    - [Start dev server](#start-dev-server)
  - [Features](#features)
  - [Tech used](#tech-used)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Testing](#testing)
    - [Tools](#tools)
  - [Screenshots](#screenshots)
    - [Home](#home)
    - [Chat selection](#chat-selection)
    - [Chat room](#chat-room)
    - [Create post](#create-post)
    - [Profile](#profile)

## Overview

PhotoApp is social media application created in the modern tech stack.
In this app, you can create posts, comment them and chat with other users. It was my first attempt to create such a complicated app. It was tough expirence, but in the end I learned a lot of things.

## Live

<https://photoapp.maciej-garncarski.pl/>

## Installation & running

### Install node dependencies

```bash
yarn install
```

### Add .env

```
# .env 

DATABASE_URL=
SECRET=
IMG_KIT_PRIVATE=
IMG_KIT_PUBLIC=
IMG_KIT_ENDPOINT=
APP_URL=
BACKEND_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PRODUCTION=
```

### Start dev server

```bash
yarn dev
```

## Features

- Authentication
- Chat
- Uploading post system
- Post likes system
- Post comments system

## Tech used

### Frontend
[Frontend repo](https://github.com/MaciejGarncarski/photo-app)

- TypeScript
- SASS with css-modules
- [Next.js](https://nextjs.org/)
- [Tanstack Query React](https://tanstack.com/query/latest/docs/react/overview)
- [Tabler icons](https://tabler-icons.io/)

### Backend

- [Fastify](https://www.fastify.io/)
- [Planetscale database](https://planetscale.com/)
- Websockets server

### Testing

- Jest
- React Testing Library
- MSW

### Tools

- Eslint
- Prettier
- Husky
- Conventional Commits config
- Github Actions CI
- Vercel

## Screenshots


### Home
![home](https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/home.png)

### Chat selection
![chat](https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/chat.png)

### Chat room
![create post](https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/chat-room.png)

### Create post
![create post](https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/create-post.png)

### Profile
![profile](https://raw.githubusercontent.com/MaciejGarncarski/photo-app/main/.github/screenshots/profile.png)
