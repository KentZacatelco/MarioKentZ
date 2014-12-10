game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		// reset the score
		game.data.score = 0;
                
                me.levelDirector.loadLevel("TestLevel01");
//                me.audio.playTrack("SuperMario");
                
                this.resetPlayer(0, 400);
                
                me.input.bindKey(me.input.KEY.RIGHT, "right");
                me.input.bindKey(me.input.KEY.LEFT, "left");
                me.input.bindKey(me.input.KEY.UP, "up");
                me.input.bindKey(me.input.KEY.D, "right");
                me.input.bindKey(me.input.KEY.A, "left");
                me.input.bindKey(me.input.KEY.W, "up");

		// add our HUD to the game world
		this.HUD = new game.HUD.Container();
		me.game.world.addChild(this.HUD);
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		// remove the HUD from the game world
		me.game.world.removeChild(this.HUD);
	},
        
        resetPlayer: function(x,y) {
            var player = me.pool.pull("Mario", x, y, {});
            me.game.world.addChild(player, 5);
        }
});
