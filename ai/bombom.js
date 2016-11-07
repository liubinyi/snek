var _ = require("lodash");
var elements = require("../lib/elements");
var directions = require("../lib/directions");

var PF = require('pathfinding');
var _ = require("lodash");


// Give your bot a name!
module.exports.name = "bombomsnek";

module.exports.getNextMove = function(game, player, opponent) { 
  
try {

  var grid = new PF.Grid(game.board.width, game.board.height);
  

   //set tail as obstacles
   _.each(player.snake.getPath(), function(body,index){
        if (index != 0) {
          grid.setWalkableAt(body.x,body.y,false);
        }
    });
  
  //generate board with obstacles
  _.each(game.board.cells, function(cell_row, i){
    _.each(cell_row, function(cell, j){
      if (cell === elements.WALL) {
        grid.setWalkableAt(i,j,false);
      }      
     });
  });

   //defind finder
   var finder = new PF.AStarFinder();

   //defind start and end
   var apple = game.board.apple;
   var head = player.snake.getHead();

   
   var gridBackup = grid.clone();
   var gridBackup2 = grid.clone();
    var gridBackup3 = grid.clone();
   var path = finder.findPath(head.x, head.y, apple.x, apple.y, grid);

   //if path not find we need to do something here
    if (path.length == 0)
    {
      var full_snek = player.snake.getPath();
      var length = full_snek.length;
      var finder2 = new PF.AStarFinder();
      //base on directions chase tails, tail is a block so it can't find it
      //direction : "S"
      if (full_snek[length-1].direction === "S") 
      {
          path = finder2.findPath(head.x, head.y, full_snek[length-1].x, full_snek[length-1].y-1, gridBackup.clone());
      } else if (full_snek[length-1].direction === "N") {
          path = finder2.findPath(head.x, head.y, full_snek[length-1].x, full_snek[length-1].y+1, gridBackup.clone());
      } else if (full_snek[length-1].direction === "W") {
          path = finder2.findPath(head.x, head.y, full_snek[length-1].x+1, full_snek[length-1].y, gridBackup.clone());
      } else {
         path = finder2.findPath(head.x, head.y, full_snek[length-1].x-1, full_snek[length-1].y, gridBackup.clone());
      }




      path = finder2.findPath(head.x, head.y, full_snek[length-1].x, full_snek[length-1].y, gridBackup);
      if (path.length == 0)
      {
        if (0 < head.x < game.board.width && 0 < head.y < game.board.height) 
        {
          var neigbors = [gridBackup3.nodes[head.y][head.x-1],
                          gridBackup3.nodes[head.y][head.x+1],
                          gridBackup3.nodes[head.y-1][head.x],
                          gridBackup3.nodes[head.y+1][head.x]];
          var neigborsIdex = [{x:head.x-1,y:head.y},
                             {x:head.x+1,y:head.y},
                             {x:head.x,y:head.y+1},
                             {x:head.x,y:head.y-1}];
          var temppath;
          _.each(neigbors, function(neighbor,index){
              if (neighbor.walkable == true)
              {
                var tempbackup = gridBackup3.clone();
                temppath = finder2.findPath(head.x, head.y, neigborsIdex[index].x,neigborsIdex[index].y, tempbackup);
                if (temppath.length != 0) {
                  path = temppath;
                }
              }
          });
          
        }
      }
    }

   var  next= path.length == 1? path[0] : path[1];

   var decision;
   switch (head.direction) {
    case directions.NORTH:
      
      //if on top
      if (head.x == next[0] && head.y > next[1])
      {
        decision = "straight";
      } else if (head.x > next[0] && head.y == next[1]) {
        decision = "left";
      } else {
          //grid.nodes[0][0].walkable == true
          if (gridBackup2.nodes[head.y][head.x+1].walkable == true)
          {
            decision = "right";   
          }        
          else if ( gridBackup2.nodes[head.y][head.x-1].walkable == true)
          {
            decision = "left";
          } else {
            decision = "straight";
          }           
      }
      break;
    case directions.SOUTH:
      //if under
      if (head.x == next[0] && head.y < next[1])
      {
        decision = "stright";
      //if on left
      } else if (head.x > next[0] && head.y == next[1]) {
        decision = "right";
      } else {
        //decision = "left";
        
        if (gridBackup2.nodes[head.y][head.x+1].walkable == true)
          {
            decision = "left";   
          }        
          else if ( gridBackup2.nodes[head.y][head.x-1].walkable == true)
          {
            decision = "right";
          } else {
            decision = "straight";
          }       

      }
      break;
    case directions.EAST:
      //if on right

      if (head.x < next[0] && head.y == next[1])
      {
        decision = "straight"
      //if on top
      } else if (head.x == next[0] && head.y > next[1]) {
        decision = "left"
      } else {
        //decision = "right";
        
        if (gridBackup2.nodes[head.y+1][head.x].walkable == true)
        {
          decision = "right";   
        } 
        else if (gridBackup2.nodes[head.y-1][head.x].walkable == true)
        {
          decision = "left";
        } else {
          decision = "straight";
        }     
      }
      break;
    case directions.WEST:
      //if on left
      if (head.x > next[0] && head.y == next[1])
      {
        decision = "straight"
      //if on top
      } else if (head.x == next[0] && head.y > next[1]) {
        decision = "right"
      } else {
        //decision = "left";
         if (gridBackup2.nodes[head.y+1][head.x].walkable == true)
        {
          decision = "left";   
        } 
        else if (gridBackup2.nodes[head.y-1][head.x].walkable == true)
        {
          decision = "right";
        } else {
          decision = "straight";
        }     
      }
      break;
  }
  
  
   if (decision) {
      // console.log("---------------------nextmoveinfo--------------------------------")
      // console.log("my current positon", "x: "+head.x+ "y: "+head.y);
      // console.log("my next positon", "x: "+next[0]+ "y: "+next[1] + "gridvalue " + game.board.cells[next[0]][next[1]]);
      // //console.log("lib grid value is " + grid.nodes[next[0]][next[1]].walkable);
      // console.log("my current direction is ", head.direction);
      // console.log("My decision is: %s", decision);    
      // console.log("------------------nextmoveinfo--------------------------------")
   }

   return decision;
} catch (e) {
  //if no path manually figure this out
  var moves = ["left", "right", "straight"]
  var nextmoveNoChoice;
  switch (head.direction) {
    case directions.NORTH:
      
      //grid.nodes[0][0].walkable == true
      if (gridBackup2.nodes[head.y][head.x+1].walkable == true)
      {
        nextmoveNoChoice = "right";   
      }        
      else if ( gridBackup2.nodes[head.y][head.x-1].walkable == true)
      {
        nextmoveNoChoice = "left";
      } else {
        nextmoveNoChoice = "straight";
      }               
      break;
    case directions.SOUTH:
      //if under
      
        
      if (gridBackup2.nodes[head.y][head.x+1].walkable == true)
      {
        nextmoveNoChoice = "left";   
      }        
      else if ( gridBackup2.nodes[head.y][head.x-1].walkable == true)
      {
        nextmoveNoChoice = "right";
      } else {
        nextmoveNoChoice = "straight";
      }       

      break;
    case directions.EAST:
      //if on right

     
      //decision = "right";
      
      if (gridBackup2.nodes[head.y+1][head.x].walkable == true)
      {
        nextmoveNoChoice = "right";   
      } 
      else if (gridBackup2.nodes[head.y-1][head.x].walkable == true)
      {
        nextmoveNoChoice = "left";
      } else {
        nextmoveNoChoice = "straight";
      }     
      
      break;
    case directions.WEST:
      //decision = "left";
      if (gridBackup2.nodes[head.y+1][head.x].walkable == true)
      {
        nextmoveNoChoice = "left";   
      } 
      else if (gridBackup2.nodes[head.y-1][head.x].walkable == true)
      {
        nextmoveNoChoice = "right";
      } else {
        nextmoveNoChoice = "straight";
      }     
      break;
  }


  return nextmoveNoChoice;
}
  /***************************
   * END EXAMPLE ALGORITHM *
   ***************************/
};
