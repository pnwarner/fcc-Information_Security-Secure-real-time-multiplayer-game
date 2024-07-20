import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const PLAYER_HEIGHT = 50;
const PLAYER_WIDTH = 50;

const COLLECTIBLE_HEIGHT = 25;
const COLLECTIBLE_WIDTH = 25;


function checkBoundary(player, dir) {
    switch(dir) {
        case "up":
            if (player.y - playerSpeed < 0) {
                return false;
            }  
            return true
        case "down":
            if ((player.y + PLAYER_HEIGHT) + playerSpeed > CANVAS_HEIGHT) {
                return false;
            }  
            return true
        case "left":
            if (player.x - playerSpeed < 0) {
                return false
            }
            return true
        case "right":
            if ((player.x + PLAYER_WIDTH)+playerSpeed > CANVAS_WIDTH){
                return false
            }
            return true
    }
}

function getRandomColor() {
    let r, g, b;
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`
}

function drawPlayer(player) {
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

function drawCollectible(arr) {
    arr.forEach((collectible) => {
        context.fillStyle = 'rgb(0,0,0)';
        context.fillRect(collectible.x, collectible.y, COLLECTIBLE_WIDTH, COLLECTIBLE_HEIGHT);
    });
}

function drawScene(players, collectibleItem) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    let initialColor = getRandomColor();
    context.fillStyle = initialColor;
    context.fillRect(0,0,canvas.width, canvas.height);
    players.forEach((player)=>{
        drawPlayer(player);
    });
    drawCollectible(collectibleItem);
}

let collectibleItem=[];
let playerId;
let player;
let playerSpeed = 10;
let players = [];

window.addEventListener('keydown', (e) => {
    if (player !== undefined){
        let validKey = true;
        switch(e.key.toLowerCase()) {
            case "arrowup":
            case "w":
                if(checkBoundary(player, "up")) {
                    player.movePlayer("up", playerSpeed);
                }
                break;
            case "arrowdown":
            case "s":
                if(checkBoundary(player, "down")){
                    player.movePlayer("down", playerSpeed);
                }
                break;
            case "arrowleft":
            case "a":
                if(checkBoundary(player, "left")){
                    player.movePlayer("left", playerSpeed);
                }
                break;
            case "arrowright":
            case "d":
                if(checkBoundary(player, "right")){;
                    player.movePlayer("right", playerSpeed);
                }
                break;
            default:
                validKey = false;
        }
        if (validKey){
            updatePlayer(player);
            let newList = []
            collectibleItem.forEach((item) => {
                let collision = player.collision(item);
                if (collision) {
                    player.score += item.value;
                } else {
                    newList.push(item);
                }
            })
            if (newList.length < collectibleItem.length) {
                collectibleItem = newList;
                collectibleItem.push(generateCollectible());
                socket.emit('add-collectible', collectibleItem);
                socket.emit('update-player', player);
            }
        }
    }
});

const returnPlayerInfo = (player) => {
    return { x: player.x, y: player.y, score: player.score, id: player.id }
}

const updatePlayer = (player) => {
    socket.emit('update-player', {x: player.x, y: player.y, score: player.score, id: player.id});
}

socket.on('init', (id) => {
    playerId = (id);
    socket.emit('message_all', playerId + ' has joined the game!');
    player = new Player({x:0, y:0, score:0, id: id});
    socket.emit('add-player', returnPlayerInfo(player));
    socket.emit('get-collectibles');
});

socket.on('message', (message) => {
    console.log(message);
});

socket.on('update-player-list', (playerList) => {
    players = playerList;
    drawScene(players, collectibleItem);
});

socket.on('update-collectibles', (collectibleItems) => {
    collectibleItem = collectibleItems;
    if(collectibleItem.length === 0) {
        collectibleItem = [generateCollectible()]
        socket.emit('add-collectible', collectibleItem);
    } else {
        drawScene(players, collectibleItem);
    }
})

function generateCollectible() {
    let x = Math.floor(Math.random() * (CANVAS_WIDTH - COLLECTIBLE_WIDTH));
    let y = Math.floor(Math.random() * (CANVAS_HEIGHT - COLLECTIBLE_HEIGHT));
    let id = 'rand_id';
    let value = Math.floor(Math.random() * 10);
    return new Collectible({x: x, y: y, value: value, id: id})
}


