# The Guzek UK website


![Guzek UK Tech Stack](https://github-readme-tech-stack.vercel.app/api/cards?title=Guzek+UK+Tech+Stack&align=center&lineCount=1&theme=tailwindcss&width=600&bg=%230f172a&badge=%231e293b&border=%231e293b&titleColor=%2338bdf8&line1=typescript%2Ctypescript%2Cauto%3Bnextdotjs%2Cnextjs%2Cauto%3Btailwindcss%2Ctailwind%2Cauto%3Blucide%2Clucide%2Cauto%3Bradixui%2Cradix+ui%2Cauto%3B)

## Intro

This repository contains the source code for [Guzek UK](https://www.guzek.uk/), which is the personal portfolio website of Konrad Guzek.
It serves as a showcase of projects as well as the homepage of [LiveSeries](https://www.guzek.uk/liveseries).

## Pages

The page contains standard portfolio website features, such as brief "about me" on the homepage as well as a "projects" page outlining some of the more recent apps I've been working on. It also features a tailor-made login system, with on-site account registration and secure credentials storage. The most interesting feature of the website is the "LiveSeries" page, which is explained in the next section.

## LiveSeries

LiveSeries started out as a personal project back in 2019 in the form of a C console app. In 2020, I restarted the project as LiveSeries 2 in C# using WinForms and the .NET framework. I ended up creating a fully-functional Windows desktop application, which automatically downloaded new releases of TV shows I watched. It had no "client" and "server" side, as it was all one application, just merged together in a single app.

However, after starting Guzek UK, I had the idea of migrating LiveSeries 2 to the web in order to allow cross-client use, and using a centralised server to host and save TV shows and other data. In 2024, I started work on LiveSeries Web, now known as [LiveSeries](https://www.guzek.uk/liveseries), and subsequently renamed LiveSeries 2 (the C# app) to LiveSeries Legacy. The repository is currently [archived but still publicly available](https://github.com/kguzek/LiveSeriesLegacy/) here on GitHub.

LiveSeries is now considered a finished product; I personally use it and it satisfies my needs. ~~However, the limitations of a centralised server are now becoming apparent: in order to allow other users to download content, they would need unrestricted access to my own personal server, which is not fesible as the storage space doesn't allow it. This is why the episode downloading functionality is currently limited to whitelisted accounts, but I will be looking into allowing public access in some form (e.g. a local server download to be able to set up decentralised servers, while still allowing the web client interface to access it).~~

If you wish to use LiveSeries to its full extent, you can now setup your own [LiveSeries server](https://github.com/kguzek/guzek-uk-liveseries-server)! Follow the installation instructions, and enjoy your favourite TV shows for free.

## Backend

The website features an authentication server hosted on [auth.guzek.uk](https://auth.guzek.uk/), a REST API on [api.guzek.uk](https://api.guzek.uk/), and a self-hosted LiveSeries server, which **every user can host for themself**. These are all open-source, and you can find them on GitHub.

- [https://github.com/kguzek/guzek-uk-api](https://github.com/kguzek/guzek-uk-api)
- [https://github.com/kguzek/guzek-uk-auth-server](https://github.com/kguzek/guzek-uk-auth-server)
- [https://github.com/kguzek/guzek-uk-liveseries-server](https://github.com/kguzek/guzek-uk-liveseries-server)

## Usage

This repository isn't really meant to be cloned or downloaded by anyone, it's just where I keep the source code so I can develop from different locations. If you read this README, say hi!
