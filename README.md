# ACCollector

## About

In Animal Crossing: New Horizons there are 95 collectible songs, 73 collectible fossils, and 43 collectible works of art. Additionally, there are 80 fish, 80 insects, and 40 sea creatures that can be caught and donated to the museum. Keeping track of each of these that you have collected or caught becomes difficult. The purpose of this web app is to track which of these you have gathered to assist with completing your collection. 

The primary reason I created this app was to simplify sharing information with friends. Soon after the initial launch of the game, a friend of mine sent me an Excel book containing lists of all the items he had collected and requested that I do the same so we could work together to complete our collections sooner. Regularly updating, comparing, and sharing spreadsheets for a video game sounded incredibly tedious to me, so I opted to look for another solution. 

There have been several websites and applications made to track item collection in ACNH, but all of those that I found only worked for tracking your own items and had no way to compare your collection to that of a friend. I thought up a solution: make an app that keeps track of every user’s collection, and has an interface for you to view what other users need to complete their collections. In the sections below, I will specify the differences between each of the collectibles and any app usage changes that might arise due to those differences.

## Songs

Every day, one song from the catalog is sold in game. The game doesn’t seem to prioritize previously unsold songs or anything like that, so buying all of the songs yourself could take a very long time. However, on Saturday evenings, a character in game will give you a song of your choice if you talk to them. This obviously helps to collect the last few. Additionally, in game you can re-purchase items that you have purchased before. Using this system, you can purchase additional copies of songs to send to friends that need them. 

When viewing the collections of other users, the app highlights songs that you have marked as owned in your own collection so you can easily identify songs you can purchase and send to friends.

## Fossils/Art

Art and fossils are both time-gated: 4 fossils spawn in game daily, while art is sold by a merchant that may appear up to one day per week. You cannot order duplicates of fossils or art, but you can still obtain duplicates through the regular methods.

## Bugs/Fish/Sea Creatures
Creatures that can be caught all have restricted times during which they can be caught in-game. Each can only be caught during certain months and during certain time ranges on a given day. They cannot be ordered in game; the only way to obtain them is to catch them or be given them. However, you must catch them yourself to gain credit for catching them.


# Design Rationale

## Support for users that share islands

The application was built specifically to support users that may “live on the same island” (share a Nintendo Switch console). Those users share a museum, meaning they share the collection of fossils and art. Instead of each user needing to update their own list of fossils and art, those lists are shared between them. 

Items under this category are in the IslandCollectibles table. 

## Friend tracking implementation

The current implementation of the “friends” list is more of a two-way user tracking system than a proper friends system. If one user adds another, a relationship is created in the UserRelationship table and each user will be listed on the other’s friend list. 

## Current & Future Features

Implemented:
    • Song tracking
    • Fossil tracking
    • Art tracking
    • Friends list

Planned:
    • Creature tracking
    • Interesting Dashboard

I believe that implementing the creature tracking system would best be done by adding another table to the database so all creature properties could be defined without bloating the PlayerCollectibles table.

The dashboard could be updated in the future to display percentages of each category collected and any creatures in season that still need to be caught. This would require that players provide their system time to the calculation. I believe this information would best logically be stored in the Islands table. Some system would need to be implemented to update this information in real time so the users won’t have to update it themselves monthly. 

There are plenty of other types of collectible items that could be tracked. I am not sure how interested I would be in implementing anything else, but the database system I’ve got in place should be sufficient for adding any new category.
