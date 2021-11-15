randWeapons = [
    { name: "Katana", min: 10, max: 15},
    { name: "LIZZIE(Desert Eagle)", min: 14, max: 17 },
    { name: "Headsman Shotgun", min: 18, max: 23 },
    { name: "OVERWATCH Sniper", min: 40, max: 55 }
];

function randWeapon() {
    rand = Math.floor(Math.random() * (randWeapons.length));
    return randWeapons[rand];
}

function getStartingWeapon() {
    return startingWeapon = { name: "Pipe Wrench", min: 5, max: 10}    
}

module.exports = { randWeapon, getStartingWeapon}