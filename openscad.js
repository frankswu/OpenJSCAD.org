// openscad.js, a few functions to simplify coding OpenSCAD-like
//    written by Rene K. Mueller <spiritdude@gmail.com>, License: GPLv2
//
// Version: 0.008
//
// Description:
// Helping to convert OpenSCAD .scad files to OpenJSCad .jscad files with 
// little editing, can be used at
//     http://joostn.github.com/OpenJsCad/processfile.html
//
// and has been integrated at
//     http://openjscad.org/
//
// History:
// 2013/03/12: 0.008: covering most mathematical function of OpenSCAD in JS as well
// 2013/03/11: 0.007: most function transforming CSG now take array as well, more functions for OpenSCAD-alike behaviour
// 2013/03/10: 0.006: colored intersection() & difference(), added mirror(), cylinder supports start/end coordinates too
// 2013/03/04: 0.005: intersect() -> intersection(), sin, cos, asin, acos included, more examples 
// 2013/03/02: 0.004: better install, examples/, etc refinements (working on 2d primitives)
// 2013/03/01: 0.003: example.jscad vs example.scad, openscad.js/.jscad split up, and openjscad cli in nodejs implemented
// 2013/02/28: 0.002: center:false default
// 2013/02/27: 0.001: first version, center: true|false support
//
// original .scad file:
// union() {
//       //cube(size=[30,30,0.1],center=true);
//       translate([3,0,0]) cube();
//       difference() {
//          rotate([0,-45,0]) cube(size=[8,7,3],center=true);
//          sphere(r=3,$fn=20,center=true);
//       }
//       translate([10,5,5]) scale([0.5,1,2]) sphere(r=5,$fn=50);
//       translate([-15,0,0]) cylinder(r1=2,r2=0,h=10,$fn=20);
//      
//    for(i=[0:19]) {
//       rotate([0,i/20*360,0]) translate([i,0,0]) rotate([0,i/20*90,i/20*90,0]) cube(size=[1,1.2,.5],center=true);
//    }
// }

// function main() {  // -- the same in .jscad :-)
//    var cubes = new Array();
//    for(i=0; i<20; i++) {
//       cubes[i] = rotate([0,i/20*360,0], translate([i,0,0], rotate([0,i/20*90,i/20*90,0], cube({size:[1,1.2,.5],center:true}))));
//    }
//    return union(
//       //cube({size:[30,30,0.1],center:true}),
//       translate([3,0,0],cube()),
//       difference(
//          rotate([0,-45,0], cube({size:[8,7,3],center:true})),
//          sphere({r:3,fn:20,center:true})
//       ),
//       translate([10,5,5], scale([0.5,1,2], sphere({r:5,fn:50}))),
//       translate([-15,0,0], cylinder({r1:2,r2:0,h:10,fn:20})),
//       cubes
//       //translate([0,5,0], linear_extrude({height:10, center: true, twist: 100, slices: 50}, translate([2,0,0], circle(1))))
//    );
// }


// wrapper functions for OpenJsCAD & OpenJSCAD.org

// -- 3D operations (OpenSCAD like notion)

function union() { 
   var o,i=0,a=arguments; 
   if(a[0].length) a = a[0]; 
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]); 
   } 
   return o; 
}

function difference() { 
   var o,i=0,a=arguments; 
   if(a[0].length) a = a[0]; 
   for(o=a[i++]; i<a.length; i++) { 
      o = o.subtract(a[i].setColor(1,1,0));     // -- color the cuts
   } 
   return o; 
}

function intersection() { 
   var o,i=0,a=arguments; 
   if(a[0].length) a = a[0]; 
   for(o=a[i++]; i<a.length; i++) { 
      o = o.intersect(a[i].setColor(1,1,0));    // -- color the cuts
   } 
   return o; 
}

// -- 3D primitives (OpenSCAD like notion)

function cube(p) { 
   var s = 1, v, off = 0;
   if(p&&p.length) v = p;		
   if(p&&p.size&&p.size.length) v = p.size;
   if(p&&p.size&&!p.size.length) s = p.size;
   if(p&&!p.size&&!p.length&&p.center===undefined) s = p;
   off = s/2;
   if(p&&p.center==true) off = 0;
   var o = CSG.cube({radius:s/2});
   if(off) o = o.translate([off,off,off]);
   if(v&&v.length) o = o.scale(v);
   return o;
}

function sphere(p) {
   var r = 1;
   var fn = 32;
   //var zoff = 0; // sphere() in openscad has no center:true|false
   if(p&&p.r) r = p.r;
   if(p&&p.fn) fn = p.fn;
   if(p&&!p.r&&!p.fn) r = p;
   //zoff = r;
   //if(p&&p.center==true) zoff = 0;
   var o = CSG.sphere({radius:r,resolution:fn});
   //if(zoff) o = o.translate([0,0,zoff]);
   return o;
}

function cylinder(p) {
   var r1 = 1, r2 = 1, h = 1, fn = 32; var a = arguments;
   var zoff = 0;
   if(p&&p.r) {
      r1 = p.r; r2 = p.r; if(p.h) h = p.h;
   }
   if(p&&(p.r1||p.r2)) {
      r1 = p.r1; r2 = p.r2; if(p.h) h = p.h;
   } 
   if(a&&a[0].length) {
      a = a[0]; r1 = a[0]; r2 = a[1]; h = a[2]; if(a.length==4) fn = a[3];
   }
   if(p&&p.fn) fn = p.fn;
   if(p&&p.center==true) zoff = -h/2;
   var o;
   if(p&&(p.start&&p.end)) {
      o = CSG.cylinder({start:p.start,end:p.end,radiusStart:r1,radiusEnd:r2,resolution:fn});
   } else {
      o = CSG.cylinder({start:[0,0,0],end:[0,0,h],radiusStart:r1,radiusEnd:r2,resolution:fn});
      if(zoff) o = o.translate([0,0,zoff]);
   }
   return o;
}

function polyhedron() { 
   console.log("polyhedron() not yet implemented"); 
}
   
// -- 3D transformations (OpenSCAD like notion)

function translate() {      // v, obj or array
   var a = arguments, v = a[0], o, i = 1;
   if(a[1].length) { a = a[1]; i = 0; }
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]);
   } 
   return o.translate(v); 
}

function scale() {         // v, obj or array
   var a = arguments, v = a[0], o, i = 1;
   if(a[1].length) { a = a[1]; i = 0; }
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]);
   } 
   return o.scale(v); 
}

function rotate() { 
   var o,i,v, r = 1, a = arguments;
   if(!a[0].length) {        // rotate(r,[x,y,z],o)
      r = a[0];
      v = a[1];
      i = 2;
      if(a[2].length) { a = a[2]; i = 0; }
   } else {                   // rotate([x,y,z],o)
      v = a[0];
      i = 1;
      if(a[1].length) { a = a[1]; i = 0 }
   }
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]);
   } 
   if(r!=1) {
      return o.rotateX(v[0]*r).rotateY(v[1]*r).rotateZ(v[2]*r);
   } else {
      return o.rotateX(v[0]).rotateY(v[1]).rotateZ(v[2]);
   }
}

function mirror(v,o) { 
   var a = arguments, v,o,i = 1;
   if(arguments.length==3) {  // mirror(r,[x,y,z],o)
      r = a[0];
      v = a[1];
      i = 2;
      if(a[2].length) { a = a[2]; i = 0; }
      
   } else {                   // rotate([x,y,z],o)
      v = a[0];
      i = 1;
      if(a[1].length) { a = a[1]; i = 0; }
   }
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]);
   } 
   if(r!=1) {
      return o.mirrorX(v[0]*r).mirrorY(v[1]*r).mirrorZ(v[2]*r);
   } else {
      return o.mirrorX(v[0]).mirrorY(v[1]).mirrorZ(v[2]); 
   }
}

function expand(r,n,o) {
   return o.expand(r,n);
}
function contract(r,n,o) {
   return o.contract(r,n);
}

function multmatrix() {
   console.log("multmatrix() not yet implemented"); 
}

function color() {
   var o,i,a=arguments,c = a[0]; 
   if(a[1].length) { a = a[1], i = 0 } else { i = 1; }
   for(o=a[i++]; i<a.length; i++) { 
      o = o.union(a[i]);
   } 
   return o.setColor(c[0],c[1],c[2]);
}

function minkowski() {
   console.log("minkowski() not yet implemented"); 
}

function hull() {
   console.log("hull() not yet implemented"); 
}

// -- 2D to 3D primitives (OpenSCAD like notion)

function linear_extrude(p,s) {
   console.log("linear_extrude() not yet implemented");
   return;
   var h = 1, off = 0, convexity = 10, twist = 0, slices = 10;
   if(p.height) h = p.height;
   //if(p.convexity) convexity = p.convexity;      // abandoned
   if(p.twist) twist = p.twist;
   if(p.slices) slices = p.slices;
   return s.extrude({offset:[0,0,h], twistangle:0, twiststeps:twist, slices:slices});
}

function rotate_extrude(p) {
   console.log("rotate_extrude() not yet implemented");
}

// -- 2D primitives (OpenSCAD like notion)

function square() {
   var v = [1,1], off = [0,0]; var a = arguments;
   if(a&&a[0].length) v = a[0];
   if(a&&a[1].center==true) off = v; 
   var o = CAG.rectangle({center:[0,0],radius:v});
   if(off[0]||off[1]) o = o.translate([-off[0]/2,-off[1]/2]);
   return o;
}

function circle() {
   var r = 1, off = [0,0], fn = 32; var a = arguments;
   if(a&&a[0]) r = a[0];
   if(a&&a[1]&&a[1].fn) fn = p.fn;
   if(a&&a[1]&&a[1].center==true) off = r;
   var o = CAG.circle({center:[r,r],radius:r});
   //if(off) o = o.translate([-off,-off]);
   return o;
}

function polygon() {
   var a = arguments;
   if(a[0]&&a[0].length) a = a[0];
   var o = CAG.fromPoints(a);
   return o;
}

function triangle() {         // -- new addition
   var a = arguments;
   if(a[0]&&a[0].length) a = a[0];
   var o = CAG.fromPoints(a);
   return o;
}

// -- Math functions (360 deg based vs 2pi)

function sin(a) {
   return Math.sin(a/360*Math.PI*2);
}
function cos(a) {
   return Math.cos(a/360*Math.PI*2);
}
function asin(a) {
   return Math.asin(a)/(Math.PI*2)*360;
}
function acos(a) {
   return Math.acos(a)/(Math.PI*2)*360;
}
function tan(a) {
   return Math.tan(a/360*Math.PI*2);
}
function atan(a) {
   return Math.atan(a)/(Math.PI*2)*360;
}
function atan2(a,b) {
   return Math.atan2(a,b)/(Math.PI*2)*360;
}
function ceil(a) {
   return Math.ceil(a);
}
function floor(a) {
   return Math.floor(a);
}
function abs(a) {
   return Math.abs(a);
}
function min(a,b) {
   return a<b?a:b;
}
function max(a,b) {
   return a>b?a:b;
}
function rands(min,max,vn,seed) {
   // -- seed is ignored for now, FIX IT (requires reimplementation of random())
   //    see http://stackoverflow.com/questions/424292/how-to-create-my-own-javascript-random-number-generator-that-i-can-also-set-the
   var v = new Array(vn);
   for(var i=0; i<vn; i++) {
      v[i] = Math.random()*(max-min)+min;
   }
}
function log(a) {
   return Math.log(a);
}
function lookup(ix,v) {
   var r = 0;
   for(var i=0; i<v.length; i++) {
      var a0 = v[i];
      if(a0[0]>=ix) {
         i--;
         a0 = v[i];
         var a1 = v[i+1];
         var m = 0;
         if(a0[0]!=a1[0]) {
            m = abs((ix-a0[0])/(a1[0]-a0[0]));
         }
         //echo(">>",i,ix,a0[0],a1[0],";",m,a0[1],a1[1]);
         if(m>0) {
            r = a0[1]*(1-m)+a1[1]*m;
         } else {
            r = a0[1];
         }
         return r;
      } 
   }
   return r;
}
function pow(a,b) {
   return Math.pow(a,b);
}
function sign(a) {
   return a<0?-1:(a>1?1:0);
}
function sqrt(a) {
   return Math.sqrt(a);
}
function round(a) {
   return floor(a+0.5)
}
function echo() {
   var s = "", a = arguments;
   for(var i=0; i<a.length; i++) {
      if(i) s += ", ";
      s += a[i];
   }
   if(OpenJsCad) {
      OpenJsCad.log(s);
   } else {
      console.log(s);
   }
}

