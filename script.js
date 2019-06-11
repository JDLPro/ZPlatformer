// Create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function () {
  
  // player parameters
  this.playerSpeed = 150;
  this.jumpSpeed = -550;
  
  this.levelData = {
    platforms: [
      {
        x: 0,
        y: 560,
        numTiles: 1,
        key: 'ground'
      }
    ]
  };
  
};

// load asset files for our game
gameScene.preload = function () {
  
  // Load images
  this.load.image('platform', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fplatform.png');
  this.load.image('ground', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fground.png');
  this.load.image('goal', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fgorilla3.png');
  this.load.image('barrel', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fbarrel.png');
  this.load.image('block', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fblock.png');
  // Load JSON level files. There are json formatters available online
  this.load.json('levelData', '/levelData.json');
  // load player sprites
    this.load.spritesheet('player', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Fplayer_spritesheet.png', {
      frameWidth: 28,
      frameHeight:30,
      margin: 1,
      spacing: 1,
    });

  this.load.spritesheet('fire', 'https://cdn.glitch.com/6e0f2f06-9beb-459d-8e7b-dc08e0463492%2Ffire_spritesheet.png', {
    frameWidth: 20,
    frameHeight: 21,
    margin: 1,
    spacing: 1
  });
};

// executed once after assets are loaded
gameScene.create = function() {
  
  // |||||||| Animations set up first to avoid errors |||||||||
  // purpose of if statement is to check if animation is already created or not.
  // if created, don't create. If not, create animation. This way we don't create it
  // every time we restart.
  if(!this.anims.get('walking')){
    // walking animation
  this.anims.create({
    key: 'walking',
    frames: this.anims.generateFrameNames('player', {
      frames: [0, 1, 2]
    }),
    frameRate: 12,
    yoyo: true,
    repeat: -1
  });
  }
  
  if(!this.anims.get('burning')){
  // fire animation
  this.anims.create({
    key: 'burning',
    frames: this.anims.generateFrameNames('fire', {
      frames: [0, 1]
    }),
    frameRate: 4,
    repeat: -1
  });
  }
  
  // |||||||||||||||||||||||
  // add all level elements
  this.setupLevel();
  
  // initiate spawner of barrels
  this.setupSpawner();
  
  // collision detection for groups of objects in JSON file
  this.physics.add.collider([this.player, this.goal, this.barrels], this.platforms);
    //this.physics.add.collider([this.player, this.goal, this.barrels], this.platforms);
  
  // overlap checks and game restart (null checks whether we want to run restart or not)
  this.physics.add.overlap(this.player, [this.fires, this.goal, this.barrels], this.restartGame, null, this);
  
  // turn on game inputs
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // use to log location to move about platforms and create level design
  this.input.on('pointerdown', function(pointer) {
    console.log(pointer.x, pointer.y);
  });

  
  console.log(this.player);
  //console.log(ground2);
  
  //comment logs below
  
  // making bottom ground immovable. won't move at all, static for body that isn't affected by outside physics
  //ground.body.immovable = true;
  
  // adding multiple sprites to the physics system
  //let ground2 = this.physics.add.sprite(180,200, 'ground');

};



gameScene.update = function() {
  // are we on the ground?
  let onGround = this.player.body.blocked.down || this.player.body.touching.down;
  
  
  if(this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);
    
    // flip player
    this.player.flipX = false;
    
    //animate and check if already animated
    if(!this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }
  else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);
    
    // flip player
    this.player.flipX = true;
    
    //animate and check if already animated
    if(!this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }
  
  else {
    // make player stop
    this.player.body.setVelocityX(0);
    // stop walking animation
    this.player.anims.stop('walking')
    // set default frame
    if(onGround)
      this.player.setFrame(3);
  }
  
  // player jump
  if(onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);
    
    // cancel walking animation
    this.player.anims.stop('walking');
    
    // change frame
    this.player.setFrame(2);
  }
  
};

gameScene.setupLevel = function() {
    // parse json of levelData
  this.levelData = this.cache.json.get('levelData');
  console.log(this.physics.world.bounds);
  // world bounds
  this.physics.world.bounds.width = this.levelData.world.width;
  this.physics.world.bounds.height = this.levelData.world.height;
  
  // player
  this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
  this.physics.add.existing(this.player);
  
  // camera bounds
  this.cameras.main.setBounds(0,0, this.levelData.world.width, this.levelData.world.height);
  // set camera to follow player
  //this.cameras.main.startFollow(this.player);
  
  // constrain player to game bounds
  this.player.body.setCollideWorldBounds(true);
  
  // goal
  this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
  this.physics.add.existing(this.goal);
  
  //Platforms
  this.platforms = this.physics.add.staticGroup();
  for(let i = 0; i < this.levelData.platforms.length; i++){
    let curr = this.levelData.platforms[i];
    
    let newObj;
    
    // create sprite
    if(curr.numTiles == 1){
      newObj = this.add.sprite(curr.x, curr.y, curr.key).setOrigin(0);
    }
    
    // create tile sprite
    else {
      let width = this.textures.get(curr.key).get(0).width;
      let height = this.textures.get(curr.key).get(0).height;
      newObj = this.add.tileSprite(curr.x, curr.y, curr.numTiles * width, height, curr.key).setOrigin(0);
    }
    
    // enable physics
    this.physics.add.existing(newObj, true);
    
    // add to group
    this.platforms.add(newObj);
  }
  
  // Fires. Set physics as a dynamic group here
  this.fires = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
  
  // Read through list of fires in JSON file
  for(let i = 0; i < this.levelData.fires.length; i++){
    // Set current fire properties
    let curr = this.levelData.fires[i];
    // read fires properties
    //let newObj = this.add.sprite(curr.x, curr.y, 'fire').setOrigin(0);
    let newObj = this.fires.create(curr.x, curr.y, 'fire').setOrigin(0);
    
    // enable physics
    this.physics.add.existing(newObj);
    
    // play animation burning
    newObj.anims.play('burning');
    
    // add to group
    this.fires.add(newObj);
    
    // LEVEL CREATION ---- dragging objects
    newObj.setInteractive();
    this.input.setDraggable(newObj);
    }
  
  // LEVEL CREATION ---- 
  /*
  this.input.on('drag', function(pointer, gameObject, dragX, dragY){
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    console.log(dragX, dragY);
  });
  */
};

gameScene.setupSpawner = function() {
  // barrel group and physics
  this.barrels = this.physics.add.group({
    bounceY: 0.3,
    bounceX: 1,
    collideWorldBounds: true
  });
  
  // spawn barrels
  let spawningEvent = this.time.addEvent({
    delay: this.levelData.spawner.interval,
    loop: true,
    callbackScope: this,
    callback: function() {
      // create barrel
      let barrel = this.barrels.create(this.goal.x, this.goal.y, 'barrel');
      
      // set properties of barrel
      barrel.setVelocityX(this.levelData.spawner.speed);
      
      // duration
      this.time.addEvent({
        delay: this.levelData.spawner.lifespan,
        repeat: 0,
        callbackScope: this,
        callback: function(){
          barrel.destroy();
        }
      });
    }
  });
};

//restart game (game over + you won!)
gameScene.restartGame = function (sourceSprite, targetSprite) {
  // fade out camera
  this.cameras.main.fade(500);
  
  // when fade out completes restart scene
  this.cameras.main.on('camerafadeoutcomplete', function (camera, effect){
    // restart the scene
    this.scene.restart();
  }, this)
};

let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Barrel Jumper',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 900},
      
      // use this to debug physics in system. Don't forget to add comma to conitnue statements
      //debug: true
}}};

// create the game and pass it the config
let game = new Phaser.Game(config);