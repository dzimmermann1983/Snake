/**
 * Created by moe on 28.08.2014.
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'snakeGame');

var menuState = require('./menuState.js');
var gameState = require('./gameState.js');

game.state.add('menuState', menuState);
game.state.add('gameState', gameState);
game.state.start('menuState');