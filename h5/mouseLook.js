var PLAYER_HEIGHT = 1.0;

var UAngle = 0;
var ULoc = vec4(0.0,PLAYER_HEIGHT,0.0);

function mouseLook(key, mdelta){
  UAngle = UAngle + mdelta;
  var move = vec3(key.d-key.a, 0.0, key.w-key.s);
  
  var rotation = mat4();
  rotation = mult(rotation, rotateY(UAngle));
  var rotMov = mult(rotation, move);
  ULoc = add(ULoc, rotMov);

  var direction = vec3(Math.sin(UAngle), 0.0, Math.cos(UAngle));
  var mv = lookAt(ULoc, add(ULoc,direction), vec3(0.0,1.0,0.0));
  return mv;
}