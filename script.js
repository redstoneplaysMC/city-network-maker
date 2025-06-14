class Canvas{
	constructor( elmName, w = null, h = null ){
		this.canvas		= document.getElementById(elmName);
		this.ctx		= this.canvas.getContext("2d");
		canvas.addEventListener("click", handleClick);
		this.offsetX	= 0;
		this.offsetY	= 0;
		this.clearX		= 0;
		this.clearY		= 0;

		if( w && h ) 	this.size( w, h );
		else 			this.size( window.innerWidth, window.innerHeight );
	}

	//////////////////////////////////////////////////////////////////
	// Coord System
	//////////////////////////////////////////////////////////////////
	center(){
		this.ctx.translate(this.width * 0.5, this.height * 0.5);
		this.clearX = -this.width * 0.5;
		this.clearY = -this.height * 0.5;
		return this;
	}

	//////////////////////////////////////////////////////////////////
	// Style
	//////////////////////////////////////////////////////////////////
	line_width(v){ this.ctx.lineWidth = v; return this; }
	fill(v){ this.ctx.fillStyle = v; return this; }
	stroke(v){ this.ctx.strokeStyle = v; return this; }

	style(cFill = "#ffffff", cStroke = "#505050", lWidth = 3){
		if(cFill != null) 	this.ctx.fillStyle		= cFill;
		if(cStroke != null) this.ctx.strokeStyle	= cStroke;
		if(lWidth != null) 	this.ctx.lineWidth		= lWidth;
		return this;
	}

	dash(){ this.ctx.setLineDash( [4,5] ); return this; }
	undash(){ this.ctx.setLineDash( [0] ); return this; }

	//////////////////////////////////////////////////////////////////
	// Misc
	//////////////////////////////////////////////////////////////////
	//Set the size of the canvas html element and the rendering view port
	size( w = 500, h = 500 ){
		var box				= this.canvas.getBoundingClientRect();
		this.offsetX		= box.left;	//Help get X,Y in relation to the canvas position.
		this.offsetY		= box.top;
		//TODO, might need to replace offset with mouseOffset
		this.mouseOffsetX	= this.canvas.scrollLeft + this.canvas.offsetLeft; 	//box.left;	// Help get X,Y in relation to the canvas position.
		this.mouseOffsetY	= this.canvas.scrollTop + this.canvas.offsetTop; 	//box.top;

		//set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
		this.canvas.style.width		= w + "px";
		this.canvas.style.height	= h + "px";
		this.canvas.width			= w;
		this.canvas.height			= h;
		this.width 					= w;
		this.height 				= h;

		return this;
	}  
	font(font = "12px verdana", textAlign="left"){
		if(font)		this.ctx.font		= font;
		if(textAlign)	this.ctx.textAlign	= textAlign;
		return this;
	}

	//////////////////////////////////////////////////////////////////
	// Drawing
	//////////////////////////////////////////////////////////////////
	draw( d ){
		if( (d & 1) != 0 ) this.ctx.fill();
		if( (d & 2) != 0 ) this.ctx.stroke();
	}

	circle(x, y, radius = 10, draw = 1 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius ,0, p2, false );
		this.draw( draw );
		return this;
	}

	circle_vec( v, radius = 10, draw = 1 ){
		const p2 = Math.PI * 2;
		this.ctx.beginPath();
		this.ctx.arc( v[0], v[1], radius ,0, p2, false );
		this.draw( draw );
		return this;
	}

	line_vec( p0, p1 ){
		this.ctx.beginPath();
		this.ctx.moveTo( p0[0], p0[1] );
		this.ctx.lineTo( p1[0], p1[1] );
		this.ctx.stroke();
		return this;
	}

	// Helper function to fill triangle given 3 points
	fillTriangle(p1, p2, p3, color) {
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(...p1);
		this.ctx.lineTo(...p2);
		this.ctx.lineTo(...p3);
		this.ctx.closePath();
		this.ctx.fill();
	}

	fillQuad(p1,p2,p3,p4,color) {
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(...p1);
		this.ctx.lineTo(...p2);
		this.ctx.lineTo(...p3);
		this.ctx.lineTo(...p4);
		this.ctx.closePath();
		this.ctx.fill();
	}

	fillFace(face, color) {
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(...points[faces[face][0]]);
		this.ctx.lineTo(...points[faces[face][1]]);
		this.ctx.lineTo(...points[faces[face][2]]);
		this.ctx.lineTo(...points[faces[face][3]]);
		this.ctx.closePath();
		this.ctx.fill();
	}
}

// const face_id = 20
const numberInput = document.getElementById("numberInput");
let seed = parseFloat(numberInput.value);
// const seed = Math.floor(Math.random()*1000)
const rand = mulberry32(seed) 

let $			= new Canvas("canvas", 800, 600 ).center().font("18px verdana");;
let points		= [];	
let faces		= [];	// How to link the points into faces, will get replaced by functions
let marked_points = [];
let f_centroid	= null; 
let ring_cnt	= 10;	// How many hex rings to create
let size 		= 60;

pnt_mk_hex();			// Create The remaining points
face_mk_tri();			// Map out triangle faces from points.
face_rnd_quads(); 		// round quads
face_subdivide(); 		// unrelaxed
for( let i=0; i < 100; i++ ) face_relax();
// face_draw( faces );
// pnt_draw(2)
// $.style( "#ff0000", "#ccc", 1 ).dash();	
// face_draw( faces );
// draw_markpts(marked_points)

// for (let p = 0; p < points.length; p++) {
// 	if ( rand() > 0.5 ) {
// 		marked_points.push(points[p])
// 	}
// }


// console.log(marked_points)
// get the 8 coords of the edge and midpoints given a face, clockwise
// console.log(getEdgePointCoords(face_id))
// $.ctx.fillStyle = 'green';
// console.log(getMarkedCount(face_id, marked_points))
drawMarkedFaces(marked_points)

// face is 4 point IDs
// find a way to subdivide a quad into 4 smaller quads. Then use marching squares.
// find a way to click on a vertex to mark it.
// Find a way to save the resulting image, so it is readable on another program.
// Find a way to kill randomness

//####################################################################
// Draw Functions
function pnt_draw( p_radius=2 ){
	// i[0], i[1] of global points denote coords of each vertex.
	let i;
	for( i of points ) $.circle( i[0], i[1], p_radius );
}

function marked_pnt_draw( p_radius=2 ){
	// i[0], i[1] of global points denote coords of each vertex.
	let i;
	for( i of marked_points ) $.circle( i[0], i[1], p_radius );
}

function pnt_draw_num(){
	let i, p;
	for( i=0; i < points.length; i++ ){
		p = points[ i ];
		$.text( i, p[0]+10, p[1] );
	}
}

function face_draw( faces ){
	let f, i, ii;

	for( f of faces ){
		for( i=0; i < f.length; i++ ){
			ii = (i + 1) % f.length;
			$.line_vec( points[ f[i] ], points[ f[ii] ] );
		}
	}
}

function face_draw_num( faces ){
	let f, i, j, x, y;

	for( i=0; i < faces.length; i++ ){
		f = faces[i];
		x = 0;
		y = 0;

		for( j=0; j < f.length; j++ ){
			x += points[ f[j] ][ 0 ];
			y += points[ f[j] ][ 1 ];
		}

		$.text( i, x/f.length, y/f.length );
	}
}

function edge_draw_num( edge ){
	let a, b, e, ary, x, y, i = 0;

	for( e in edge ){
		ary = e.split("_");
		a = points[ ary[0] ];
		b = points[ ary[1] ];

		x = (a[0] + b[0]) / 2 - 5;
		y = (a[1] + b[1]) / 2 + 5;

		$.text( i++, x, y );
	}
}



//####################################################################
// Step 1 - Create Points in Hex Shape

// Generate points
function pnt_mk_hex(){
	let a, i, x, y,
		ang_inc	= 60 * Math.PI / 180,	// Angle Incrmement for the main Points
		offset	= 30 * Math.PI / 180;	// Starting Angle

	points.push( [0,0] );	// Center Point

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Initial Ring
	for(i=0; i < 6; i++){
		a = offset + i * ang_inc;
		x = size * Math.cos( a );
		y = size * Math.sin( a );
		points.push( [x,y] );
	}
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	let ri, r_size, 	// Ring Index and Ring Size
		ji, jinc, 		// Lerp Index and Lerp Incremement
		t, ti,			// Lerp Time and Time Inverted
		px, py, 		// Previous X,Y
		nx, ny;			// Next X,Y

	for( ri=1; ri <= ring_cnt; ri++ ){
		r_size 	= (ri+1) * size;				// How far from center is this ring
		px		= r_size * Math.cos( offset );	// First Point on the Ring
		py		= r_size * Math.sin( offset );
					
		//....................................
		// Loop Through the Main Points of the Ring
		for(i=1; i <= 6; i++){
			a		= offset + (i%6) * ang_inc;	// Angle for the next Main Point
			nx		= r_size * Math.cos( a );	// Next Main Point
			ny		= r_size * Math.sin( a );
			jinc	= 1 / (ri + 1);				// Increment Step for Lerp

			//....................................
			// Get the inbetween points from Prev to Next, using simple lerp.
			for( ji=0; ji <= ri; ji++){
				t	= jinc * ji;			// Lerp Time
				ti	= 1-t;					// ... Inverted
				x 	= px * ti + nx * t;		// Lerp between Prev -> Next
				y 	= py * ti + ny * t;
				points.push( [x,y] );

			}

			//....................................
			px = nx; // Next will not become previous for next loop
			py = ny;
		}
	}
}

//####################################################################
// Step 2 - Create Triangle Faces from Points

// Circlular triangulation of the points
function face_mk_tri(){
	let p = points;
	let j, i, ii;

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Fan Triangulation of the starting hex.
	for( j=0; j < 6; j++ ){
		i	= j + 1;
		ii	= (j+1) % 6 + 1;
		faces.push( [ i, 0, ii ] );
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Loop through two rings at a time to connect them as triangles by using two indexes
	// that alternatively increment. When Reaching a main hex point, only increment the
	// outer index, which turns to continue the triangles in the same pattern.
	let ai, a_len, a_offset,
		bi, b_len, b_offset,
		ctr, turn_at,
		is_even, tri_cnt,
		idx = 0;

	for( i=0; i < ring_cnt; i++ ){
		idx			+= i * 6;			// Exponential Increment of some kind, create a pattern like 0, 6, 18, 36
		ai 			= 0;				// Counter for Ring A
		a_len		= 6 * (i+1);		// How Many Points in Ring A
		a_offset	= idx + 1;			// Starting Index of Ring A
		
		bi 			= 0;				// Counter for Ring B
		b_len		= 6 * (i+2);		// How many points in Ring B
		b_offset 	= a_offset + a_len;	// Starting Index of Ring B

		turn_at 	= (i+1) * 2;		// How Many Triangles to create before a turn.
		ctr 		= 0;				// Swop Counter

		tri_cnt 	= a_len + b_len;	// How many Triangles to make

		for( j=0; j < tri_cnt; j++ ){
			is_even = ( (ctr & 1) == 0 );

			if( is_even ) 	ii = (bi + 1) % b_len + b_offset;	
			else 			ii = (ai + 1) % a_len + a_offset;
			faces.push( [ b_offset + bi, a_offset + ai, ii ] );

			if( ctr == turn_at ){
				ctr = 0;
				bi++;
			}else{
				if( is_even )	bi++;
				else 			ai = (ai + 1) % a_len; 
				ctr++;
			}
		}
	}
}

//####################################################################
// Step 3 - Randomly Merge Triangles into quads if possible

// Try to merge neighboring triangles into quads. Replaces global face array
function face_rnd_quads(){
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Randomly Sort Triangle Index Array
	// Create an array of Index Values of Faces.
	let tri_rnd	= Array.from( faces, (x,i)=>i );
	ary_rnd_sort( tri_rnd , rand);
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	let tbl		= mk_edge_list( faces ),	// Generate Loop up tables between Triangles and Edges
		quads	= [],
		ename, e2f, f2e, edge,
		i, ii, j, a, b, c, d, tmp;
	
	//edge_draw_num( tbl.e2f );
	while( tri_rnd.length ){
		i	= tri_rnd.pop();	// Get a Triangle Index
		ii	= null;				// Null Second Triangle Index
		f2e	= tbl.f2e[ i ];		// List of edges of face.

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Loop through all the edges of the triangle to find a
		// neighbor triangle that was not used to form a quad.
		for( ename of f2e ){
			e2f = tbl.e2f[ ename ];			// Edge to Face Lookup Table
			if( e2f.length <= 1 ) continue;	// If there is only one triangle, then its a most outer edge

			for( j=0; j < e2f.length; j++ ){
				// If not the current triangle AND is available for use.
				if( e2f[j] != i && tri_rnd.indexOf( e2f[j] ) != -1 ){
					ii		= e2f[j];
					edge	= ename;
					break;
				}
			}

			if( ii != null ) break;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Neighbor Index found
		if( ii != null ){
			// Use the Edge as the main diagonal for the quad. 
			// The Quad can be formed as A,B,C,D point order
			// So we assign A and C with the edge, Then any of the 
			// remaining number of each triangle is the other diagonal points
			tmp	= edge.split("_");
			a 	= parseInt( tmp[0] ); 
			c 	= parseInt( tmp[1] );

			// Find the points not on the diagonal edge
			for(j=0; j < 3; j++){
				if( faces[i][j] != a && faces[i][j] != c )		b = faces[i][j];
				if( faces[ii][j] != a && faces[ii][j] != c )	d = faces[ii][j];
			}

			quads.push( [a,b,c,d] ); // Save as Quad Face

			// Get index of neighbor triangle and remove it from the random list.
			i = tri_rnd.indexOf( ii );
			if( i != -1 ) tri_rnd.splice( i, 1 );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// No Neighbor found, Just save the triangle as a face.
		}else quads.push( faces[i] ); 
	}

	faces = quads;
}

// Create a look up table of Edges to Faces, and vice versa
function mk_edge_list( fary ){
	let f, j, i, a, b, ename;
	let e2f = {};
	let f2e = Array.from( faces, (x,i)=>new Array() )

	for( j=0; j < fary.length; j++ ){
		f = fary[j];
		for(i=0; i < f.length; i++ ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			a 		= f[i];
			b 		= f[ (i+1) % f.length ];
			ename 	= ( a < b )? a+"_"+b : b+"_"+a;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			if( e2f[ ename ] )	e2f[ ename ].push( j );
			else 				e2f[ ename ] = [ j ];

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			f2e[ j ].push( ename );
		}
	}

	return { e2f, f2e };
}

function mulberry32(seed) {
	return function() {
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Randonly Sort an Array
function ary_rnd_sort( ary , rnd){
	let i, ii, tmp, len = ary.length;
	for( i=0; i < len; i++ ){
		ii		= Math.floor( rnd() * len );
		tmp		= ary[i];
		ary[i]	= ary[ii];
		ary[ii]	= tmp;
	}
}

//####################################################################
// Step 4 - Subdivied all the faces

// take the face array and subdivide quats and tris into smaller quads
function face_subdivide(){
	let tbl = edge_subdivide_tbl(),
		rtn = new Array(),
		i, f, m, cp, cen;

	/* A-D are the main points, W-Z are the edge mid point
	Quad Subdivide setup
	A   Z   D
	W   @   Y
	B   X   C

	Triangle Subdivide setup
		A
		W @ Y
	B   X   C
	*/
	for( i=0; i < faces.length; i++ ){
		f	= faces[ i ];		// Face Points
		m	= tbl[ i ];			// Edge Mid Points
		cp	= centroid( f );	// Center Point of Face
		cen = points.length;
		points.push( cp );

		if( f.length == 4 ){ // Divide quad, into 4 smaller quads
			rtn.push(	
				[ f[0], m[0], cen, m[3] ],	// a, w, cen, z
				[ m[3], cen, m[2], f[3] ],	// z, cen, y, d
				[ m[0], f[1], m[1], cen ],	// w, b, x, cen
				[ cen, m[1], f[2], m[2] ],	// cen, x, c, y
			);
		}else{	// Divide triangle, into 4 smaller quads
			rtn.push(	
				[ f[0], m[0], cen, m[2] ],	// a, w, cen, y
				[ m[0], f[1], m[1], cen ],	// w, b, x, cen
				[ cen, m[1], f[2], m[2] ],	// cen, x, c, y
			);
		}
	}
	faces = rtn;
}

// Subdivided all the edges of the current face array.
// Will create new items for the points array and return
// back multi-dim array of each face and the mid point of each edge.
function edge_subdivide_tbl(){
	let f, j, i, a, b, x, y, ename, idx,
		edge	= {},	// Look up table, make sure we only subdivide each edge once
		tbl		= Array.from( faces, (x,i)=>new Array() );

	for( j=0; j < faces.length; j++ ){
		f = faces[j];

		// Loop through all the edges that make up the face
		for(i=0; i < f.length; i++ ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create an Edge name, Use point index, min_max, so its reproducable.
			a 		= f[i];
			b 		= f[ (i+1) % f.length ];
			ename 	= ( a < b )? a+"_"+b : b+"_"+a;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// If the edge has not bee subdivided
			if( !edge[ ename ] ){
				a = points[ a ];				// Get the Points of the Edge
				b = points[ b ];

				x = a[0] * 0.5 + b[0] * 0.5;	// Use lerp to half the halfway point 
				y = a[1] * 0.5 + b[1] * 0.5;

				idx = points.length;			// Get the Index...
				points.push( [x,y] );			// for the new point being created.
				edge[ ename ] = idx;			// Save to prevent duplicats
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// for every face, save the index for the midpoint of all its edges.
			tbl[ j ].push( edge[ ename ] ); 
		}
	}
	return tbl;
}

// Find the Center point from an Array of Points.
function centroid( f ){
	let i, p, x=0, y=0;

	for( i of f ){
		p = points[ i ];
		x += p[0];
		y += p[1];
	}

	return [ x/f.length, y/f.length ];
}

//####################################################################
// Step 5 - Try to relax the points.

function mk_face_centroid(){
	f_centroid = new Array();
	for( let i=0; i < faces.length; i++ ){ f_centroid.push( centroid( faces[i] ) ) }
}

function face_relax(){
	if( !f_centroid ) mk_face_centroid(); // Create the centroid of each face only once, Reuse for every iteration.

	let c, f, p, i, j, vp, tmp;
	let vel 	= [0,0];
	let vel_pnt	= Array.from( points, (x,i)=>[0,0] );
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Loop through all the faces to calc the total velocity of each point
	for( i=0; i < faces.length; i++ ){
		f		= faces[i];
		c		= f_centroid[i];
		vel[0] 	= 0;				// Reset Velocity per Face
		vel[1] 	= 0;

		//----------------------------------
		// Add up all the distances from center in quad
		for( j of f ){
			// Add Distance from Center to velocity.
			p = points[ j ];
			vel[0]	+= p[0] - c[0];
			vel[1]	+= p[1] - c[1];

			// Swop X,Y into Y, -X. Swop does a 90 degree rotation on the velocity
			// This helps even out the distance around the center.
			tmp 	= vel[0];		
			vel[0] 	= vel[1];
			vel[1] 	= -tmp;
		}

		//----------------------------------
		// Four Points in a quad, divide by 4 to basicly get the 
		// average vector length from the center
		vel[0] /= 4;
		vel[1] /= 4;

		//----------------------------------
		// Add the quad velocity to the points
		// Accumulate all the velocity forces for each point
		// in each face 
		for( j of f ){
			vp	= vel_pnt[ j ];
			p	= points[ j ];

			// Do the swop to rotate the the distance from center
			// Better results if rotate before applying.
			tmp 	= vel[0];		
			vel[0] 	= vel[1];
			vel[1] 	= -tmp;

			// Calc new position from center, minus current position.
			// This gives us a distance to travel to new position, which is
			// basicly velocity. We add up all the velocity forces for all
			// the poiints
			vp[0]	+= ( c[0] + vel[0] ) - p[0]; 
			vp[1]	+= ( c[1] + vel[1] ) - p[1];

		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// With all the point velocities calculated, apply then to the points
	let range = (ring_cnt + 1) * size - 30; // 2-24, 3
	let scale = 0.1;	// Appling the full velocity makes things explode, scale velocity down.

	for( i=0; i < points.length; i++ ){
		if( v_lenx( points[ i ] ) <= range ){ // this is a hack to try to avoid applying changes to the most outer points, TODO better job of this.
			points[i][0] += vel_pnt[i][0] * scale;
			points[i][1] += vel_pnt[i][1] * scale;
		}
	}
}

function v_lenx( a ){ return Math.sqrt( a[0]**2 + a[1]**2 ); }

// ##############################
// Marching Squares

const edgeTable = {
  0: [],
  1: [[3, 2]],
  2: [[1, 2]],
  3: [[3, 1]],
  4: [[0, 1]],
  5: [[3, 0], [1, 2]], // ambiguous
  6: [[0, 2]],
  7: [[3, 0]],
  8: [[0, 3]],
  9: [[0, 2]],
  10: [[2, 3], [0, 1]], // ambiguous
  11: [[0, 1]],
  12: [[1, 3]],
  13: [[1, 2]],
  14: [[3, 2]],
  15: []
};

function draw_markpts(pts) {
	for (let p=0; p < pts.length; p++){
		$.circle(...pts[p], radius=3)
	}
}

function getCornerAndAdjacentMidpoints(faceIndex, cornerIndex) {
	const indices = faces[faceIndex];         // indices of the face's 4 corners
	const p = indices.map(i => points[i]);    // the actual [x, y] coords

	// Corner point
	const corner = p[cornerIndex];

	// Previous and next corner indices (wrap around 0–3)
	const prevIndex = (cornerIndex + 3) % 4;
	const nextIndex = (cornerIndex + 1) % 4;

	// Midpoints of edges connected to this corner
	const midpoint1 = [
		(corner[0] + p[prevIndex][0]) / 2,
		(corner[1] + p[prevIndex][1]) / 2
	];

	const midpoint2 = [
		(corner[0] + p[nextIndex][0]) / 2,
		(corner[1] + p[nextIndex][1]) / 2
	];

	return [corner, midpoint1, midpoint2];
}



function getCornerMidpointQuad(faceIndex, cornerA, cornerB) {
  // Get corner point and its two adjacent midpoints for each corner
  const [cornerAPt, aMid1, aMid2] = getCornerAndAdjacentMidpoints(faceIndex, cornerA);
  const [cornerBPt, bMid1, bMid2] = getCornerAndAdjacentMidpoints(faceIndex, cornerB);

  // Midpoint connecting cornerA and cornerB (the shared edge midpoint)
  const indices = faces[faceIndex];
  const cornerAIndex = indices[cornerA];
  const cornerBIndex = indices[cornerB];
  const sharedMidpoint = [
    (points[cornerAIndex][0] + points[cornerBIndex][0]) / 2,
    (points[cornerAIndex][1] + points[cornerBIndex][1]) / 2,
  ];

  // For cornerA, find the midpoint that is NOT the shared midpoint
  const midA = (distance(aMid1, sharedMidpoint) < 1e-10) ? aMid2 : aMid1;

  // For cornerB, find the midpoint that is NOT the shared midpoint
  const midB = (distance(bMid1, sharedMidpoint) < 1e-10) ? bMid2 : bMid1;

  // Return quad points in order: cornerA, midA, midB, cornerB
  return [cornerAPt, midA, midB, cornerBPt];
}

// Helper function to compute Euclidean distance
function distance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}


function pointInList(pt, list, eps = 1e-6) {
	return list.some(p => Math.abs(p[0] - pt[0]) < eps && Math.abs(p[1] - pt[1]) < eps);
}

function getMarkedType(faceIndex, mkpts) {
	// returns the vertex count, or 5 if diagonal
	const face = faces[faceIndex];
	const marked = [false, false, false, false]; // TL, TR, BR, BL

	for (let i = 0; i < 4; i++) {
		const pt = points[face[i]];
		if (pointInList(pt, mkpts)) {
			marked[i] = true;
		}
	}

	const count = marked.filter(Boolean).length;

	if (count === 0) return 0;
	if (count === 1) return 1;
	if (count === 4) return 4;
	if (count === 3) return 3;

	if (count === 2) {
		// Check for diagonal cases
		if ((marked[0] && marked[2]) || (marked[1] && marked[3])) {
			return 5;
		} else {
			return 2;
		}
	}

	return 'unknown';
}

// can't rely on a lookup table to do this anymore.
// essentially, there are 6 states
// empty, full, 1 corner, half, 3 corners, diagonal
// if 1 or 3 corners, then find the non-diagonal one in the mkpts array

function getSingleMarkedCornerIndex(faceIndex, mkpts) {
	const cornerIndices = faces[faceIndex]; // 4 point indices
	let markedIndex = -1;

	for (let i = 0; i < 4; i++) {
		const pt = points[cornerIndices[i]];
		if (pointInList(pt, mkpts)) {
			if (markedIndex !== -1) {
				// More than one marked point — not a single marked corner
				return -1;
			}
			markedIndex = i;
		}
	}

	return markedIndex; // Returns 0–3 if exactly one marked, else -1
}

function getDoubleMarkedCornerIndices(faceIndex, mkpts) {
	const cornerIndices = faces[faceIndex]; // 4 corner point indices
	const markedCorners = [];

	for (let i = 0; i < 4; i++) {
		const pt = points[cornerIndices[i]];
		if (pointInList(pt, mkpts)) {
			markedCorners.push(i); // store the face-local corner index (0–3)
		}
	}

	if (markedCorners.length === 2) {
		return markedCorners; // returns [i, j]
	}

	return []; // not exactly two marked corners
}

function getTripleMarkedCornerIndices(faceIndex, mkpts) {
	const cornerIndices = faces[faceIndex]; // 4 point indices
	let unmarkedIndex = -1;
	let unmarkedCount = 0;

	for (let i = 0; i < 4; i++) {
		const pt = points[cornerIndices[i]];
		if (!pointInList(pt, mkpts)) {
			unmarkedCount++;
			unmarkedIndex = i;
		}
	}

	if (unmarkedCount === 1) {
		return unmarkedIndex; // Index (0–3) of the corner that is NOT marked
	}

	return -1; // Not exactly 3 marked corners
}

function drawMarkedFace(faceIndex, mkpts) {
	const fill1 = 'silver'
	const fill2 = 'gray'
	let mkcnt;
	mkcnt = getMarkedType(faceIndex, mkpts)
	// console.log(mkcnt)
	switch(mkcnt){
		case 0: // No neighbors
			$.fillFace(faceIndex, fill1);
			break;
		case 1:
			// Find the corner, and fill it in
			$.fillFace(faceIndex, fill1);
			mkcidx = getSingleMarkedCornerIndex(faceIndex, mkpts)
			corner = getCornerAndAdjacentMidpoints(faceIndex, mkcidx)
			$.fillTriangle(...corner, fill2)
			break;
		case 2: // half
			$.fillFace(faceIndex, fill1)
			mkcidx = getDoubleMarkedCornerIndices(faceIndex, mkpts)
			// console.log(mkcidx)
			quad = getCornerMidpointQuad(faceIndex, ...mkcidx)
			// console.log("Corners:", mkcidx, "Quad:", quad);
			$.fillQuad(...quad, fill2)
			break;
		case 3:
			// Find the corner, and fill it in
			$.fillFace(faceIndex, fill2);
			mkcidx = getTripleMarkedCornerIndices(faceIndex, mkpts)
			corner = getCornerAndAdjacentMidpoints(faceIndex, mkcidx)
			$.fillTriangle(...corner, fill1)
			break;
		case 4: // full
			$.fillFace(faceIndex, fill2);
			break;
		case 5: // diagonal
			$.fillFace(faceIndex, fill2);
			// remove the non-marked corners
			mkcidx = getDoubleMarkedCornerIndices(faceIndex, mkpts);
			mkcidx = mkcidx.map(i => (i + 1) % 4);
			// console.log(mkcidx);
			corner1 = getCornerAndAdjacentMidpoints(faceIndex, mkcidx[0]);
			corner2 = getCornerAndAdjacentMidpoints(faceIndex, mkcidx[1]);
			$.fillTriangle(...corner1, fill1)
			$.fillTriangle(...corner2, fill1)
			break;
		default:
			break;
	}
}

function drawMarkedFaces(mkpts){
	for (let p=0; p < faces.length; p++)
		drawMarkedFace(p, mkpts)
	$.style( "#ff0000", "#888", 1 ).dash();	
	face_draw( faces );
	marked_pnt_draw(2)

}


// ###################################
// Edit faces
function handleClick(event) {
	const rect = canvas.getBoundingClientRect();

	const mouseX = (event.clientX-rect.width/2);
	const mouseY = (event.clientY-rect.height/2);

	let minDist = Infinity;
	let closestIndex = -1;

	for (let i = 0; i < points.length; i++) {
		const [px, py] = points[i];
		const dx = px - mouseX;
		const dy = py - mouseY;
		const distSq = dx * dx + dy * dy;

		if (distSq < minDist) {
			minDist = distSq;
			closestIndex = i;
		}
	}

	if (closestIndex !== -1) {
		const pt = points[closestIndex];
		const idx = marked_points.findIndex(p => p[0] === pt[0] && p[1] === pt[1]);

		if (idx !== -1) {
			marked_points.splice(idx, 1);
		} else {
			marked_points.push(pt);
		}

		// console.log(marked_points.length);
		drawMarkedFaces(marked_points);
	}
}	

// ####################################
// Get the Marked vertices, and draw lines to connect them all to eachother.
// Find a way to save/export the result (i.e. export the marked vertex table, and import it.)

// let vertices = [
//   [0, 0],
//   [1, 1],
//   [2, 2]
// ];

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const vertexText = document.getElementById("vertexText");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const infoField = document.getElementById("infoField");

// Export array to text area
exportBtn.addEventListener("click", () => {
  vertexText.value = JSON.stringify(marked_points, null, 0);
});

// Import text into array
importBtn.addEventListener("click", () => {
  try {
    const input = JSON.parse(vertexText.value);
    // Validate it's an array of arrays of numbers
    if (Array.isArray(input) && input.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) {
      	marked_points = input;
    	console.log("Updated vertices:", marked_points);
		drawMarkedFaces(marked_points);
	} else {
      alert("Invalid format. Expected array of [x, y] pairs.");
    }
  } catch (e) {
    alert("Invalid JSON");
  }
});

// Copy text area content to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(vertexText.value)
    .then(() => alert("Copied to clipboard!"))
    .catch(err => alert("Clipboard error: " + err));
});

// Clear vertices and text area
clearBtn.addEventListener("click", () => {
  marked_points = [];
  vertexText.value = "[]";
  console.log("Vertices cleared");
});
