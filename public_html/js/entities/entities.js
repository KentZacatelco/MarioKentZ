// TODO
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function(){
                    return (new me.Rect (0, 0, 60, 128)).toPolygon();
                }
        }]);
    //this is where the character gets the animation to walk 
       this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("bigidle", [19]);
        this.renderable.addAnimation("shrink",[0, 1, 2, 3], 80);
        this.renderable.addAnimation("grow",[4, 5, 6, 7], 80);
        
        this.renderable.setCurrentAnimation("idle");

        this.big = false;
        this.body.setVelocity(5, 20);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    //flips the character when it changes direction
    update:function(delta){
        if(me.input.isKeyPressed("right", "D")){
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.flipX(false);
        }else if(me.input.isKeyPressed("left", "A")){
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.flipX(true);
        }else{
            this.body.vel.x = 0;
        }
    //this code helps jumping
        if(me.input.isKeyPressed("up", "W")){
            if(!this.body.jumping && !this.body.falling){
                this.body.jumping = true;
                this.body.vel.y -=this.body.accel.y * me.timer.tick;
            }
        }
        //this sets the character to walk
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(!this.big){
            if(this.body.vel.x !== 0){
                if(!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            }else{
                this.renderable.setCurrentAnimation("idle");
            }
        }else{
            if(this.body.vel.x !== 0){
                if(!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            }else{
                this.renderable.setCurrentAnimation("bigidle");
            }
        }
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    //when collide with bad guy, dies
    collideHandler: function(response){
        
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        
        if(response.b.type === 'BadGuy'){
            if(ydif <= -115) {
                response.b.alive = false;
                this.body.vel.y -= this.body.accel.y * me.timer.tick;
                this.jumping = true;
            }else{
                if(this.big){
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                }else if(this.poweredup){
                    
                }else{
                me.state.change(me.state.MENU);
                }
           }
            
        }else if(response.b.type === 'Mushroom'){
            this.renderable.setCurrentAnimation("grow", "bigidle");
            this.big = true;
            me.game.world.removeChild(response.b);
        }
    }
    
});
//sets the spawn level
game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    
    onCollision: function(){
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }
    
});
//bad guy code
game.BadGuy = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
            image: "slime",
            spritewidth: "60",
            spriteheight: "28",
            width: 60,
            height: 28,
            getShape: function(){
                return (new me.Rect(0, 0, 60, 28)).toPolygon();
            }
        }]);
    
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;
        this.updateBounds();
        
        this.alwaysUpdate = true;
        this.walkLeft = false;
        this.type = "BadGuy";
        
        this.renderable.addAnimation("run", [0, 1, 2], 80);
        this.renderable.setCurrentAnimation("run");
        
        this.body.setVelocity(4, 6);
        
        
    },
    
update: function(delta) {
    this.body.update(delta);
    me.collision.check(this, true, this.collideHandler.bind(this), true);

    if(this.alive){
        if(this.walkLeft && this.pos.x <= this.startX){
            this.walkLeft = false;
        }else if(!this.walkLeft && this.pos.x >= this.endX){
            this.walkLeft = true;
        }
        this.flipX(!this.walkLeft);
        this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

    }else{
        me.game.world.removeChild(this);
    }

    this._super(me.Entity,"update", [delta]);
    return true;
},



collideHandler: function() {

}
    
});
//mushroom
game.Mushroom = me.Entity.extend({
        init: function(x, y, settings){
            this._super(me.Entity, 'init', [x, y, {
                    image: "mushroom",
                    spritewidth: "64",
                    spriteheight: "64",
                    width: 64,
                    height: 64,
                    getShape: function () {
                        return (new me.Rect(0, 0, 64, 64)).toPolygon();
                    }
            }]);
        me.collision.check(this);
        this.type = "Mushroom";
        }
});