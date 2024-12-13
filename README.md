# The Guzek UK website

## Intro

This repository contains the source code for [Guzek UK](https://www.guzek.uk/), which is the personal portfolio website of Konrad Guzek.
It serves as a showcase of projects as well as the homepage of [LiveSeries](https://www.guzek.uk/liveseries).

## Pages

The page contains standard portfolio website features, such as brief "about me" on the homepage as well as a "projects" page outlining some of the more recent apps I've been working on. The most interesting feature of the website is the "LiveSeries" page, which is explained in the next section.

## LiveSeries

LiveSeries started out as a personal project back in 2019 in the form of a C console app. In 2020, I restarted the project as LiveSeries 2 in C# using WinForms and the .NET framework. I ended up creating a fully-functional Windows desktop application, which automatically downloaded new releases of TV shows I watched. It had no "client" and "server" side, as it was all one application, just merged together in a single app. However, after starting Guzek UK, I had the idea of migrating LiveSeries 2 to the web in order to allow cross-client use, and using a centralised server to host and save TV shows and other data. In 2024, I started work on LiveSeries Web, now known as [LiveSeries](https://www.guzek.uk/liveseries), and subsequently renamed LiveSeries 2 (the C# app) to LiveSeries Legacy. The repository is currently [archived but still publicly available](https://github.com/kguzek/LiveSeriesLegacy/) here on GitHub.

LiveSeries is now considered a finished product; I personally use it and it satisfies my needs. However, the limitations of a centralised server are now becoming apparent: in order to allow other users to download content, they would need unrestricted access to my own personal server, which is not fesible as the storage space doesn't allow it. This is why the episode downloading functionality is currently limited to whitelisted accounts, but I will be looking into allowing public access in some form (e.g. a local server download to be able to set up decentralised servers, while still allowing the web client interface to access it).

## API

The website features a back-end hosted on [api.guzek.uk](https://api.guzek.uk/), with JWT authentication and custom authorisation middleware. It provides user registration, website content editing, user profile and detail editing, and of course the LiveSeries API.

Fun fact: its first implementation was as a JSON file serving as the database, and raw Node.JS http server code. It's now a MySQL (specifically mariadb) database operated by [Sequelize](https://sequelize.org/), an ORM for JS/TS -- yes, it's still based on Node.JS.

## Usage

This repository isn't really meant to be cloned or downloaded by anyone, it's just where I keep the source code so I can develop from different locations. If you read this README, say hi!
