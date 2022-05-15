# Guzek UK version 2: The Guzek UK website, reborn using React!

## Intro
This repository contains the source code for [Guzek UK](https://www.guzek.uk/), which is the personal website of Konrad Guzek.

## Background
This website was written originally in JavaScript, however was later migrated to TypeScript.
The [original guzek-uk project](https://github.com/MagicalCornFlake/guzek-uk) was written using traditional HTML, JS and CSS, with no fancy frameworks.
This time the website was designed completely differently, with a SPA design build with React, albeit retaining the original look, feel and style of the Guzek UK website.

## API
The website serves as a medium for posting temporary projects, private proof-of-concepts as well as being the domain for @guzek.uk email addresses.
It features a back-end hosted on https://api.guzek.uk/, which was created as a starter project to learn the ropes of REST API implementation.
At the time of writing, the Guzek UK API contains only the `pages` endpoint, which is queried on each page load of Guzek UK and contains the information pertaining to each website subdirectory.
Its first implementation was as a JSON database written in Node.js from scratch, however it's currently in the process of being migrated to a MySQL database.
