
### Task
***START**
**Introduction**
Welcome to Magic Transporters, the future of moving things easily. These super cool
transporters, powered by virtual magic, are here to make shipping stuff a breeze.
**Overview**
In the world of Magic Transporters, there are special people known as Magic
Movers. They use nifty gadgets to move important things. Fueled by virtual magic,
these Movers go on quick missions to carry items around.
A Magic Mover has:
• Weight limit (the most they can carry);
• Energy (their total magic power);
• Quest state (what they’re currently doing: resting, loading, on a mission, or
done).
Each Magic Item they carry has:
• Name (what it’s called);
• Weight (how much magic power it needs);
Develop a REST API to:
• add a Magic Mover;
• add a Magic Item;
• Load a Magic Mover with items, creating a log of this activitiy (loading state);
• Start a Mission — update the Magic Mover’s state to on a mission and stop
loading more, creating a log of this activitiy (on a mission);
• End a Mission — unload everything from the Magic Mover, creating a log of
this activitiy (mission complete / done);
• Check who completed the most missions with a simple list.
**Requirements**
Follow these simple rules:
**Functional requirements**
• Don’t give Magic Movers too much to carry for efficiency;
• Make a simple list showing who completed the most missions.
**Non-functional requirements**
• Make sure the project is easy to build and run;
• Set up any needed data before starting (like starting a video game);
• Use express in Node.js or nestjs framework.
• Use Typescript
**END***

**Prerequisites**

 - Install MongoDB From [here](https://www.mongodb.com/docs/manual/installation/) 
 - install NodeJS From [here](https://nodejs.org/en/download)
 - install Git
 
 **Install Project** 
 
 - Clone Code `git clone https://github.com/lemb0o/Magic-Transporters.git`
 - Create Database From [here](https://www.mongodb.com/basics/create-database)

**Configure Project**
Edit this line `mongoose.connect('mongodb://localhost:27017/{your database name}');` in index.js file

**install dependencies and Run Project**

 - install dependencies by this command using your terminl and make sure you're opening the project directory in terminal `npm install` 
 - run project `node index.js`

