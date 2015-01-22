// Projectile class
// @param projectileType:
//  - bullet (hits one heroes; does nothing if it hits the ground)
//    * slime tower
//  - bomb (explodes when it hit the ground or a hero; deals AoE damage)
//    * missile tower
//    * energy tower?
//    * fire/bomb tower
//    * tornado tower?
//    * radiation tower
//  - ray (launches ray that instantly hits everything along a line from the tower to the ground)
//    * tesla tower
//  - TODO
//    * curse tower
//    * wormhole tower
function Projectile(game, type, projectileType, pos, angle) {
    // Inherits from AnimateObject
    var _superclass = AnimateObject(game, type, pos);
    
    /**
     * Projectile actions/controller
     */
    var controller = _superclass.c;
    
    // Update the projectile - performed on every tick of the game's clock
    controller.update = function() {
        // Calculate horizontal and vertical portions of velocity
        view.body.velocity.x = controller.getHorizontalVelocity();
        view.body.velocity.y = controller.getVerticalVelocity();
        
        // Keep the projectile's angle within it initial quadrant
        if (view.body.angularVelocity < 0 && view.angle < 0) {
            view.body.angularVelocity = 0;
            view.body.angularAcceleration = 0;
            view.rotation = 0;
        } else if (view.body.angularVelocity > 0 && view.angle > 0) {
            view.body.angularVelocity = 0;
            view.body.angularAcceleration = 0;
            view.rotation = 0;
        }
        
        // Check to see if projectile has hit ground yet
        if (view.y >= GROUND_LEVEL) {
            switch (model.projectileType) {
                case "bomb":
                    // Bombs explode when they hit the ground
                    this.implode({x: view.x, y: GROUND_LEVEL});
                    break;
                
                case "bullet":
                    // Bullet don't do anything when they hit the ground
                    this.destroy();
                
                default:
                    // Error!
                    break;
            }
        }
        
        // Check if projectile has collided with a hero
        game.physics.arcade.collide(view, heroes.getViewGroup(), null, this.handleCollideWithHero, this);
    };
    
    // Projectile has hit some sort of target, now it should detonate or whatever
    controller.implode = function(pos) {
        // Create effect
        effects.add(Effect(game, model.effect, pos));
        
        // Destroy projectile
        this.destroy();
    };
    
    // Destroy this projectile and remove it from the game world
    controller.destroy = function() {
        projectiles.remove(projectiles.getParentOfView(view));
    };
    
    // Calculate the horizontal portion of the projectiles total velocity based
    // upon the angle that the projecitle is point in
    controller.getHorizontalVelocity = function() {
        // Calculate vertical component of total velocity
        return -Math.sin(view.rotation) * model.velocity;
    };
    
    // Calculate the verticle portion of the projectiles total velocity based
    // upon the angle that the projecitle is point in
    controller.getVerticalVelocity = function() {
        // Calculate vertical component of total velocity
        return Math.cos(view.rotation) * model.velocity;
    };
    
    // Projectile has collided with a hero
    controller.handleCollideWithHero = function(projectileView, heroView) {
        var hero = heroes.getParentOfView(heroView);
        
        switch (model.projectileType) {
            case "bomb":
                this.implode({x: view.x, y: hero.v.y});
                break;
            
            case "bullet":
                this.implode({x: view.x, y: view.y});
            
            default:
                // Error!
                break;
        }
    };
    
    
    /**
     * Projectile data/model
     */
    var model = _superclass.m;
    
    // Total velocity of projectile
    model.velocity = 500;
    
    // Intial angle of the projectile
    model.initialAngle = angle;
    
    // Set the projectile type
    model.projectileType = projectileType;
    
    /**
     * Projectile sprite/view
     */
    var view = _superclass.v;
    
    // Projecitle should be pointing in the param "Angle" that was passed to this contructor
    // Note: angle is in radians
    view.rotation = angle;
    
    // The rate at which the angle changes
    if (angle < 0) {
        view.body.angularAcceleration = 50 * Math.cos(angle);
    } else if (angle > 0) {
        view.body.angularAcceleration = 50 * -Math.cos(angle);
    }
    
    // Calculate vertical and horizontal portions of velocity based upon angle
    // and total velocity
    view.body.velocity.x = controller.getHorizontalVelocity();
    view.body.velocity.y = controller.getVerticalVelocity();
    
    /**
     * Animation
     */
    
    // If projectile has a "move" animation sequence then play it
    if (model.viewInfo.hasOwnProperty("animations") && model.viewInfo.animations.hasOwnProperty("move")) {
        view.animations.add("move", model.viewInfo.animations.move, 20, true);
        view.animations.play("move");
    }
    
    /**
     * Generate object that is an instance of this class
     */
    return {
        m: model,
        v: view,
        c: controller,
        type: "Projectile"
    };
}
