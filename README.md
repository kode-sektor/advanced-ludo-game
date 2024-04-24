# ADVANCED LUDO GAME

---

## Introduction

<img src="/public/images/ludo-cover.jpg">

### Purpose

The aim of this project is to create a digital version of the famous and ancient Ludo game, with online multiplayer and computer modes.

### Objectives

To code a Ludo game that runs on two-dice throw and all four houses utilised. Computer mode additionally would be more feature-rich by making use of advanced probability.

### Background Information

History of Ludo Game

The Ludo game is an old traditional board game usually played by 2, 3 or 4 players. The origin of the game remains unclear but sources tend to point to either India or Britain. And like other things, it has spread all over the world and has taken up native names like Parcheesi, Chopad, Chatush Pada, Non t'arrabbiare, Fia med knuff, Loto, Jeu des petits chevaux etc. From country to country, expect slight variations in the spellings of the Ludo game, usually with changes to the 'u' and 'o' alphabets in the name or sometimes a change and / or duplicate of these alphabets.

---

GamePlay

The Ludo game involves 2 to 4 players taking turns to roll two dice (cube shape), each die having a value of 1 to 6 on each side. So in other words, a dice throw results in a minimum value of "1-1", with the maximum being "6-6". It is a dice throw that determines a move. The game pieces that the players move are called tokens, and sometimes seeds. You could think of them as pawns associated with the chess game. One difference though is that no token has any special feature. All move the same way.

The game board is made up of cells and differently coloured bases, otherwise known as camp or house. The different colours are necessary to differentiate the players. The tokens associated with the bases also match the same colour. All tokens start out the game from inside the camp. Only a 6 throw can enable a breakaway from the base. Only a whole '6' on either die or even on both can enact a breakaway. A combination of dice value like '3' and '3', '4' and '2' or '5' and '1' which all equate to '6', though, do not enact a breakaway and the player would wait for a next turn after his opponent rolls the dice, seeking for their own breakaway. The dice values can be applied separately to any token or combined to advance just one token. The start positions are unique to every base and a breakaway for any token must begin from the start position attached to his camp. So, without doubt a '6' die value is central to having an edge in this game.

In real life and all else equal, there is no proven method of rolling a '6' or in fact, any particular die number and you can guarantee that holds true for this digital Advanced Ludo Game. As seen in the image, the cells form a path and the arrows on the board indicate the direction of travel which is clockwise. Remember a '6' die value enacts a breakaway from the camp. This starts the journey. If all player's tokens are inactive (in-camp), a '6' throw must initiate a breakaway. However, once a token is active (out-of-camp), it no longer remains mandatory that a '6' initiates a breakaway. The player could decide to allot the '6' value to the active token with the sole exception being when all active tokens have successfully made a round trip and enters their respective portals, which at that point a '6' move is no longer possible because a portal contains only 5 cells. More on the portal later.

The idea of the game should be clear by now: Make your inactive tokens become active by getting a '6' throw on at least a die. If player plays against COM, it would be 8 vs 8 tokens (2 camps each). If 3 or 4 players, only 1 camp can serve each player; thus 4 tokens. Depending on the scenario, first player to move all their tokens round the path and into their portal and clear, wins the game. But that's not all. In the process of a token making a round trip, player can actively dislodge enemy token by landing on occupied cell by opponent. If this happens, the player's token is completely taken out of play, eliminating then need of completing a round trip. At the same time, the opponent token is sent back home and can only break out with a '6' again. One thing should be taken into account though: to dislodge an opponent token, the sum of both dice value must land player's token onto cell occupied by opponent token, or only with the value of one die as long as the value of the second die can be assigned to a token. To explain, if player has only one active token and rolls dice value of "5-3" and opponent token is 5 cells ahead, the first die value of "5" could dislodge the opponent token but because user has no other active token to assign the "3" value, he would have to advance past the enemy token by assigning both dice value, which becomes 8, to the single active token. For the player to successfully dislodge the opponent token in this scenario, he would need to roll either of these values: "1-4", "4-1", "2-3", "3-2", "5-6" or "6-5".

As a beginner you may think only luck counts in the game but it does not get too long before discovering your decisions, risk estimation and anticipation of your opponent are equally crucial.

Double Six

If the player casts a double-six ("6-6"), the opponents' turns get suspended and player has another chance to toss. In the unlikely circumstance player rolls another "6-6", then player will toss again until player rolls any value other than "6-6". And when this happens, the sumtotal of the dice values in this series of dice toss are all attributable to player's qualified tokens.

Portal

If a token makes a journey round the cellpath, token would enter its portal. Once inside the portal, token cannot be attacked. Token also cannot exit. To make a clearance, token must advance the number of portal cells in front of it plus the cell it occupies. And unlike any token within the cellpath, a token inside its portal can make a clearance with one die value only, regardless of if there is no qualified token to assign second die value to.

Gameplay Variations

- As with most things, you should expect variations in the gameplay you may encounter elsewhere. Sometimes, game rules are not hard and fast and having this in your subconscious may prepare you for any niggling surprises.

1. One house vs One house

- Although the Ludo game has four houses, some Ludo games may allow only 1 house vs 1 house.

2. One die roll

- You are probably used to 2 dice roll but do not get surprised if you encounter a Ludo setting that caters for only one die. With one die roll per throw, the provision for double-six is usually, for all intents and purposes, eliminated.

3. Token dislodge

- Some Ludo games may have no provision of a token dislodging opponent token.

Terms & Definitions

Camp
: Where the seeds are housed

Camped
: Describes seeds that are in their base

In-play
: Describes seeds that are out of their base. "Active" may be used as substitute

Out-of-play
: Describes seeds that have dislodged opponent token or cleared through portal

Mode
: Defines the motive of each active seed

Siege
: Scenario when camp is surrounded by opponent tokens

Lair
: The first 5 cells from opponent starting position

Breakout
: Art of seed leaving its camp

Odyssey
: Process of seed making a full cycle round the cell paths, when there is no intent of fleeing from opponent seed or dislodging an opponent seed

Portal
: The last 5 possible cells after a seed has made a complete odyssey

Siege zone
: Last 5 cells behind seed's breakout position

Right of Way
: Defines priority for which token gets to move

Die Value
: 1 die roll

Dice Value
: Total dice roll (and also accounts for the case of double 6)

Vantage Point / Sweet Spot
: Cell right before starting position

Exclave / Outpost
: 5th and 6th cell before starting position.

Portal Bank
: Cell right before portal

Clearance
: Art of seed inside portal proceeding through house and exiting

### Methods

### For Developers

Note: Wireframes, mockups and rough work that are uploaded as regards this project, many that you will see from here on in, are meant to highlight the guiding thought process in the course of development. While not exactly the fibre of the project, they can intimate you on reasons for particular techniques, aid visualisation, expound on comments and quickly spot patterns.

Also take note that the final production as regards the methods, names, styles, coding conventions etc. may differ from these visual aids, albeit -- slightly most times.

---

LAYING THE GRID

<img src="/public/images/laying-the-grid.jpg">

CELLPATH MOVEMENT SKETCH

<img src="/public/images/determining-token-direction.jpg">

DIE ROLL SEQUENCING 

<img src="/public/images/die-roll-sequencing-1.jpg">
<img src="/public/images/die-roll-sequencing-2.jpg">

- Developer: Code-Sector (Ibiyemi Olagoke Kayode)
- Technology: HTML5, CSS3, React
- Platforms: Browser (desktop, mobile, tablet)
- Classification: Games» Puzzle» Board
