(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, function (exports) { 'use strict';

  var pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig;
  var pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\s]*,?[\s]*/ig;
  var mmax = Math.max;
  var toFloat = parseFloat;
  var globalConfig = {};
  function morphPath (p1, p2) {
  	var path1 = p1,
  		path2 = p2,
  		diff = getDiff(path1, path2),
  		i = 0,
  		ii = 0,
  		now = [];
  	path1 = diff[0];
  	path2 = diff[1];
  	diff = diff[2];
    return function (pos) {
    	var i,
          ii,
          j,
          jj,
          now = [];
      for (i = 0, ii = path1.length; i < ii; i++) {
          now[i] = [path1[i][0]];
          jj = path1[i] ? path1[i].length : 0;
          for (j = 1  ; j < jj; j++) {
              now[i][j] = (+path1[i][j] + pos * diff[i][j]);
          }
          now[i] = now[i][0] + now[i].slice(1).join(',');
      }
      return now.join('');
    }
  };

  // Functions from Snap svg to convert
  // path string to array
  function getDiff (p1, p2) {
  	var toPath = [],
  		fromPath = [],
  		i = 0,
  		ii = 0,
  	    pathComb = path2curve(p1, p2),
  	    diffPath;
  	pathComb = morphPath$1(pathComb[0], pathComb[1]);
  	toPath = pathComb[1];
  	fromPath = pathComb[0];
  	diffPath = [];
  	for (i = 0, ii = fromPath.length; i < ii; i++) {
  	    diffPath[i] = [0];
  	    var jj;
  	    jj = fromPath[i] ? fromPath[i].length : 0;
  	    for (var j = 1; j < jj; j++) {
  	        diffPath[i][j] = (toPath[i][j] - fromPath[i][j]) << 0;
  	    }
  	}
  	return [fromPath, toPath, diffPath]
  }
  function path2curve(path, path2) {
      var pth = !path2 && paths(path), arr;
      var p = pathToAbsolute(path),
          p2 = path2 && pathToAbsolute(path2),
          attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
          attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
          processPath = function (path, d, pcom) {
              var nx, ny;
              if (!path) {
                  arr = ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                  arr.lValue = ['L', d.x, d.y];
                  return arr;
              }
              !(path[0] in {T: 1, Q: 1}) && (d.qx = d.qy = null);
              switch (path[0]) {
                  case "M":
                      d.X = path[1];
                      d.Y = path[2];
                      break;
                  case "A":
                      path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
                      break;
                  case "S":
                      if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
                          nx = d.x * 2 - d.bx;          // And reflect the previous
                          ny = d.y * 2 - d.by;          // command's control point relative to the current point.
                      }
                      else {                            // or some else or nothing
                          nx = d.x;
                          ny = d.y;
                      }
                      path = ["C", nx, ny].concat(path.slice(1));
                      break;
                  case "T":
                      if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
                          d.qx = d.x * 2 - d.qx;        // And make a reflection similar
                          d.qy = d.y * 2 - d.qy;        // to case "S".
                      }
                      else {                            // or something else or nothing
                          d.qx = d.x;
                          d.qy = d.y;
                      }
                      path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                      break;
                  case "Q":
                      d.qx = path[1];
                      d.qy = path[2];
                      path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                      break;
                  case "L":
                      path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
                      path.lValue = ['L'].concat(path.slice(5));
                      break;
                  case "H":
                      path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
                      path.lValue = ['L'].concat(path.slice(5));
                      break;
                  case "V":
                      path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
                      path.lValue = ['L'].concat(path.slice(5));
                      break;
                  case "Z":
                      path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
                      path.lValue = ['L'].concat(path.slice(5));
                      break;
              }
              return path;
          },
          fixArc = function (pp, i) {
              if (pp[i].length > 7) {
                  pp[i].shift();
                  var pi = pp[i];
                  while (pi.length) {
                      pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
                      p2 && (pcoms2[i] = "A"); // the same as above
                      pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
                  }
                  pp.splice(i, 1);
                  ii = mmax(p.length, p2 && p2.length || 0);
              }
          },
          fixM = function (path1, path2, a1, a2, i) {
              if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                  path2.splice(i, 0, ["M", a2.x, a2.y]);
                  a1.bx = 0;
                  a1.by = 0;
                  a1.x = path1[i][1];
                  a1.y = path1[i][2];
                  ii = mmax(p.length, p2 && p2.length || 0);
              }
          },
          pcoms1 = [], // path commands of original path p
          pcoms2 = [], // path commands of original path p2
          pfirst = "", // temporary holder for original path command
          pcom = ""; // holder for previous path command of original path
      for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
          p[i] && (pfirst = p[i][0]); // save current path command

          if (pfirst != "C") // C is not saved yet, because it may be result of conversion
          {
              pcoms1[i] = pfirst; // Save current path command
              i && ( pcom = pcoms1[i - 1]); // Get previous path command pcom
          }
          p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

          if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
          // which may produce multiple C:s
          // so we have to make sure that C is also C in original path

          fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

          if (p2) { // the same procedures is done to p2
              p2[i] && (pfirst = p2[i][0]);
              if (pfirst != "C") {
                  pcoms2[i] = pfirst;
                  i && (pcom = pcoms2[i - 1]);
              }
              p2[i] = processPath(p2[i], attrs2, pcom);

              if (pcoms2[i] != "A" && pfirst == "C") {
                  pcoms2[i] = "C";
              }

              fixArc(p2, i);
          }
          fixM(p, p2, attrs, attrs2, i);
          fixM(p2, p, attrs2, attrs, i);
          var seg = p[i],
              seg2 = p2 && p2[i],
              seglen = seg.length,
              seg2len = p2 && seg2.length;
          attrs.x = seg[seglen - 2];
          attrs.y = seg[seglen - 1];
          attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
          attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
          attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
          attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
          attrs2.x = p2 && seg2[seg2len - 2];
          attrs2.y = p2 && seg2[seg2len - 1];
      }
      return p2 ? [p, p2] : p;
  }

  function pathToAbsolute(pathArray) {
      if (!is(pathArray, "array") || !is(pathArray && pathArray[0], "array")) { // rough assumption
          pathArray = parsePathString(pathArray);
      }
      if (!pathArray || !pathArray.length) {
          return [["M", 0, 0]];
      }
      var res = [],
          x = 0,
          y = 0,
          mx = 0,
          my = 0,
          start = 0,
          pa0;
      if (pathArray[0][0] == "M") {
          x = +pathArray[0][1];
          y = +pathArray[0][2];
          mx = x;
          my = y;
          start++;
          res[0] = ["M", x, y];
      }
      var crz = pathArray.length == 3 &&
          pathArray[0][0] == "M" &&
          pathArray[1][0].toUpperCase() == "R" &&
          pathArray[2][0].toUpperCase() == "Z";
      for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
          res.push(r = []);
          pa = pathArray[i];
          pa0 = pa[0];
          if (pa0 != pa0.toUpperCase()) {
              r[0] = pa0.toUpperCase();
              switch (r[0]) {
                  case "A":
                      r[1] = pa[1];
                      r[2] = pa[2];
                      r[3] = pa[3];
                      r[4] = pa[4];
                      r[5] = pa[5];
                      r[6] = +pa[6] + x;
                      r[7] = +pa[7] + y;
                      break;
                  case "V":
                      r[1] = +pa[1] + y;
                      break;
                  case "H":
                      r[1] = +pa[1] + x;
                      break;
                  case "R":
                      var dots = [x, y].concat(pa.slice(1));
                      for (var j = 2, jj = dots.length; j < jj; j++) {
                          dots[j] = +dots[j] + x;
                          dots[++j] = +dots[j] + y;
                      }
                      res.pop();
                      res = res.concat(catmullRom2bezier(dots, crz));
                      break;
                  case "O":
                      res.pop();
                      dots = ellipsePath(x, y, pa[1], pa[2]);
                      dots.push(dots[0]);
                      res = res.concat(dots);
                      break;
                  case "U":
                      res.pop();
                      res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
                      r = ["U"].concat(res[res.length - 1].slice(-2));
                      break;
                  case "M":
                      mx = +pa[1] + x;
                      my = +pa[2] + y;
                  default:
                      for (j = 1, jj = pa.length; j < jj; j++) {
                          r[j] = +pa[j] + (j % 2 ? x : y);
                      }
              }
          } else if (pa0 == "R") {
              dots = [x, y].concat(pa.slice(1));
              res.pop();
              res = res.concat(catmullRom2bezier(dots, crz));
              r = ["R"].concat(pa.slice(-2));
          } else if (pa0 == "O") {
              res.pop();
              dots = ellipsePath(x, y, pa[1], pa[2]);
              dots.push(dots[0]);
              res = res.concat(dots);
          } else if (pa0 == "U") {
              res.pop();
              res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
              r = ["U"].concat(res[res.length - 1].slice(-2));
          } else {
              for (var k = 0, kk = pa.length; k < kk; k++) {
                  r[k] = pa[k];
              }
          }
          pa0 = pa0.toUpperCase();
          if (pa0 != "O") {
              switch (r[0]) {
                  case "Z":
                      x = +mx;
                      y = +my;
                      break;
                  case "H":
                      x = r[1];
                      break;
                  case "V":
                      y = r[1];
                      break;
                  case "M":
                      mx = r[r.length - 2];
                      my = r[r.length - 1];
                  default:
                      x = r[r.length - 2];
                      y = r[r.length - 1];
              }
          }
      }
      return res;
  }
  function l2c(x1, y1, x2, y2) {
      return [x1, y1, x2, y2, x2, y2];
  }
  function q2c(x1, y1, ax, ay, x2, y2) {
      var _13 = 1 / 3,
          _23 = 2 / 3;
      return [
              _13 * x1 + _23 * ax,
              _13 * y1 + _23 * ay,
              _13 * x2 + _23 * ax,
              _13 * y2 + _23 * ay,
              x2,
              y2
          ];
  }
  function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
      // for more information of where this math came from visit:
      // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
      var _120 = PI * 120 / 180,
          rad = PI / 180 * (+angle || 0),
          res = [],
          xy,
          rotate = function (x, y, rad) {
              var X = x * math.cos(rad) - y * math.sin(rad),
                  Y = x * math.sin(rad) + y * math.cos(rad);
              return {x: X, y: Y};
          };
      if (!rx || !ry) {
          return [x1, y1, x2, y2, x2, y2];
      }
      if (!recursive) {
          xy = rotate(x1, y1, -rad);
          x1 = xy.x;
          y1 = xy.y;
          xy = rotate(x2, y2, -rad);
          x2 = xy.x;
          y2 = xy.y;
          var cos = math.cos(PI / 180 * angle),
              sin = math.sin(PI / 180 * angle),
              x = (x1 - x2) / 2,
              y = (y1 - y2) / 2;
          var h = x * x / (rx * rx) + y * y / (ry * ry);
          if (h > 1) {
              h = math.sqrt(h);
              rx = h * rx;
              ry = h * ry;
          }
          var rx2 = rx * rx,
              ry2 = ry * ry,
              k = (large_arc_flag == sweep_flag ? -1 : 1) *
                  math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
              cx = k * rx * y / ry + (x1 + x2) / 2,
              cy = k * -ry * x / rx + (y1 + y2) / 2,
              f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
              f2 = math.asin(((y2 - cy) / ry).toFixed(9));

          f1 = x1 < cx ? PI - f1 : f1;
          f2 = x2 < cx ? PI - f2 : f2;
          f1 < 0 && (f1 = PI * 2 + f1);
          f2 < 0 && (f2 = PI * 2 + f2);
          if (sweep_flag && f1 > f2) {
              f1 = f1 - PI * 2;
          }
          if (!sweep_flag && f2 > f1) {
              f2 = f2 - PI * 2;
          }
      } else {
          f1 = recursive[0];
          f2 = recursive[1];
          cx = recursive[2];
          cy = recursive[3];
      }
      var df = f2 - f1;
      if (abs(df) > _120) {
          var f2old = f2,
              x2old = x2,
              y2old = y2;
          f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
          x2 = cx + rx * math.cos(f2);
          y2 = cy + ry * math.sin(f2);
          res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
      }
      df = f2 - f1;
      var c1 = math.cos(f1),
          s1 = math.sin(f1),
          c2 = math.cos(f2),
          s2 = math.sin(f2),
          t = math.tan(df / 4),
          hx = 4 / 3 * rx * t,
          hy = 4 / 3 * ry * t,
          m1 = [x1, y1],
          m2 = [x1 + hx * s1, y1 - hy * c1],
          m3 = [x2 + hx * s2, y2 - hy * c2],
          m4 = [x2, y2];
      m2[0] = 2 * m1[0] - m2[0];
      m2[1] = 2 * m1[1] - m2[1];
      if (recursive) {
          return [m2, m3, m4].concat(res);
      } else {
          res = [m2, m3, m4].concat(res).join().split(",");
          var newres = [];
          for (var i = 0, ii = res.length; i < ii; i++) {
              newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
          }
          return newres;
      }
  }

  function parsePathString (pathString) {
      if (!pathString) {
          return null;
      }

      var paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0},
          data = [];
      if (!data.length) {
          String(pathString).replace(pathCommand, function (a, b, c) {
              var params = [],
                  name = b.toLowerCase();
              c.replace(pathValues, function (a, b) {
                  b && params.push(+b);
              });
              if (name == "m" && params.length > 2) {
                  data.push([b].concat(params.splice(0, 2)));
                  name = "l";
                  b = b == "m" ? "l" : "L";
              }
              if (name == "o" && params.length == 1) {
                  data.push([b, params[0]]);
              }
              if (name == "r") {
                  data.push([b].concat(params));
              } else while (params.length >= paramCounts[name]) {
                  data.push([b].concat(params.splice(0, paramCounts[name])));
                  if (!paramCounts[name]) {
                      break;
                  }
              }
          });
      }
      return data;
  };
  function is(o, type) {
      type = String.prototype.toLowerCase.call(type);
      if (type == "array" &&
          (o instanceof Array || Array.isArray && Array.isArray(o))) {
          return true;
      }
      return  type == "null" && o === null ||
              type == typeof o && o !== null ||
              type == "object" && o === Object(o) ||
              // objectToString.call(o).slice(8, -1).toLowerCase() == type;
              typeof o === type;
  }
  // Morphing Logic Implementations

  // check if all path are in line
  function isLine (sPath, ePath) {
      var isLine = true,
          checkLine = function (arr) {
              var i = arr.length,
                  item;
              while (i--) {
                  item = arr[i];
                  if (item[0] === 'C' && !item.lValue) {
                      isLine = false;
                  }
              }
          };
      checkLine(sPath);
      checkLine(ePath);
      return isLine;
  }

  // Convert all C to L value if all commands are line
  function pathToLine (arr) {
      var i,
          ii = arr.length;
      for (i = 0; i < ii; ++i) {
          arr[i] = arr[i].lValue || arr[i];
      }
  }
  function arrToPath (arr) {
      return arr.map(item => item.join(' ')).join('');
  }
  // Uncommon path normalizer
  function curveToLine (sPath, ePath) {
      var dPath1,
          dPath2,
          i = 0,
          j = 0,
          item = {},
          item2 = {},
          pathLen1 = 0,
          pathLen2 = 0,
          divisions = 0,
          p1,
          p2,
          round = Math.round;
      // Convert array to string
      p1 = arrToPath(sPath);
      p2 = arrToPath(ePath);
      // Creating path elements to use functions 'getTotalLength'
      // and 'getPointAtLength'
      dPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      dPath1.setAttribute("d", p1);

      dPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      dPath2.setAttribute("d", p2);

      // Getting length of the paths
      pathLen1 = dPath1.getTotalLength();
      pathLen2 = dPath2.getTotalLength();

      // Number of divisions will depend on larger path
      divisions = (globalConfig.divisions || 0.1) * Math.max(pathLen1, pathLen2);
      divisions = Math.ceil(divisions);

      if (!divisions || !isFinite(divisions) || divisions < 10) {
          divisions = 10;
      }

      // Modifying original array
      sPath.length = 0;
      ePath.length = 0;

      for (i = 0; i <= divisions; ++i) {
          item = dPath1.getPointAtLength((i / divisions) * pathLen1);
          sPath.push([i ? "L" : "M",
              round(item.x),
              round(item.y)
          ]);
          item2 = dPath2.getPointAtLength((i / divisions) * pathLen2);
          ePath.push([i ? "L" : "M",
              round(item2.x),
              round(item2.y)
          ]);
      }


      return [sPath, ePath];
  }

  function morphPath$1 (sPath, ePath) {
      var fsPath,
          fePath,
          arr;

      if (isLine(sPath, ePath)) {
          pathToLine(sPath);
          pathToLine(ePath);
      } else {
          curveToLine(sPath, ePath);
      }



      return [sPath, ePath];
  }

  exports.morphPath = morphPath;

  Object.defineProperty(exports, '__esModule', { value: true });

}));