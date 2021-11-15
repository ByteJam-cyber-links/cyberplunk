//isSkillOrCombat 1 - skill, 0 - combat

randomEncounters = 
    [
        { 
            name: "Sneaking Past Guards", 
            description: "You turn around the corner and see guards blocking your path. Sneak past to get by.", 
            DC: 13, 
            passOutcome: "You pass the guards without them spotting you.", 
            failOutcom: "You have been spotted! You got by with some bullet hole in ya. Everyone takes some damage.", 
            dmg: 10,
            heal: 0,
            findWeapon: false,
            isSkillOrCombat: 1,
        },
        { 
            name: "Save The Kids!", 
            description: "You see a group of kids being chased by a swarm of rats. You jump into action to save them.  Roll initiative!",     
            isSkillOrCombat: 0, 
            enemyName: "Rat Swarm", 
            hp: 20, 
            minAttack: 0, 
            maxAttack: 5
        },
        { 
            name: "Cybernetic Thieves!", 
            description: "You're being jumped by a bunch of low-lives who want to steal your cybernetic implants. Roll Initiative!", 
            isSkillOrCombat: 0, 
            enemyName: "Cybernetic Theives", 
            hp: 30, 
            minAttack: 10, 
            maxAttack: 15
        },
        { 
            name: "Drones!", 
            description: "A swarm of exploding drones flys by and begin to dive bomb you. Run and dodge to get away and not die.",
            DC: 15, 
            passOutcome: "You dodge all the drones and got away with no harm",
            failOutcom: "The party have been hit by a few drones.  You guys look a little banged up.",
            dmg: 25, 
            heal: 0,
            findWeapon: false,
            isSkillOrCombat: 1
        },
        { 
            name: "Looting from cars", 
            description: "You walk past a car that looks like it has something shiny inside. Break in and take what's inside without setting off alarms.", 
            DC: 15,
            passOutcome: "You break in with no problem and find a medkit.  The party heals 25 health.",
            failOutcom: "You set off the car alarm and you run with no item in hand",
            dmg: 0,
            heal: 25,
            findWeapon: false,
            isSkillOrCombat: 1
        },
        { 
            name: "Treasure Chest!", 
            description: "The party has found an abandoned weapons crate that is sealed with by electronic lock.  You decide to test your hacking skills and try to get it open.",
            DC: 13,
            passOutcome: "You open it with ease and you find a weapon.",
            failOutcom: "You struggle to find the encryption key.  You kick the crate out of frustration and decide to leave it be.",
            dmg: 0,
            heal: 0,
            findWeapon: true,
            isSkillOrCombat: 1
        }
    ]

function randEncounter() {
    randEncRoll = Math.floor(Math.random() * (randomEncounters.length))
    return randomEncounters[randEncRoll]
}

module.exports = { randEncounter }
