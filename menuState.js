/**
 * Created by moe on 28.08.2014.
 */

var restart = false;

function Menu(){};

Menu.prototype = {
    init: function(end, score){
        if(end){
            game.world.alpha = 1;
            restart = end;
            game.add.text(game.world.centerX - 200, game.world.centerY - 200, 'Sie haben '+score+' Punkt(e) erzielt.', {fontSize: '64px', fill: '#FFFFFF'});
        }
    },

    preload: function(){
        game.load.image('start', 'assets/start.png');
    },

    create: function(){
        game.stage.backgroundColor = '#000000';
        if(!restart){
            game.add.text(game.world.centerX - 50, game.world.centerY - 200, 'Snake', {fontSize: '64px', fill: '#FFFFFF'});
        }

        game.add.button(game.world.centerX - 50, game.world.centerY, 'start', startGame, this);
    }
}

module.exports = Menu;
