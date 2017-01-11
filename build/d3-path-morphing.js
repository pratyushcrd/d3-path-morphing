(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, function (exports) { 'use strict';

  function foo (path1, path2) {
  	console.log(path2curve(path1, path2));
    return function (pos) {
  	return '';
    }
  };

  // Convert path string to array
  function path2array (str) {
  	var arr = str.split(/(?=[LMC])/),
  		i = 0,
  		ii = arr.length,
  		j = 0,
  		jj = 0,
  		temp = [],
  		item = '';
  	for (; i < ii; ++i) {
  		if (/[zZ]/.test(arr[i]) && arr[i].length - 1) {
  			arr.splice(i + 1, 0, 'Z');
  			++ii;
  		}
  	}
  	for (i = 0; i < ii; ++i) {
  		item = arr[i];
  		if (item.length === 1) {
  			continue;
  		}
  		temp = item.substr(1).split(',');
  		temp.unshift(item[0]);
  		for (j = 1, jj = temp.length; j < jj; ++j) {
  			temp[j] = parseFloat(temp[j]);
  		}
  		arr[i] = temp;
  	}
  	return arr;
  }

  function path2curve(path, path2) {
      var p = path2array(path),
      p2 = path2array(path2),
      mmax = Math.max,
      concat = 'concat',
      attrs = {
          x: 0,
          y: 0,
          bx: 0,
          by: 0,
          X: 0,
          Y: 0,
          qx: null,
          qy: null
      },
      attrs2 = {
          x: 0,
          y: 0,
          bx: 0,
          by: 0,
          X: 0,
          Y: 0,
          qx: null,
          qy: null
      },
      processPath = function(path, d) {
          var nx, ny;
          if (!path) {
              return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
          }
          !(path[0] in {
              T: 1,
              Q: 1
          }) && (d.qx = d.qy = null);
          switch (path[0]) {
              case "M":
                  d.X = path[1];
                  d.Y = path[2];
                  break;
              case "A":
                  path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                  break;
              case "S":
                  nx = d.x + (d.x - (d.bx || d.x));
                  ny = d.y + (d.y - (d.by || d.y));
                  path = ["C", nx, ny][concat](path.slice(1));
                  break;
              case "T":
                  d.qx = d.x + (d.x - (d.qx || d.x));
                  d.qy = d.y + (d.y - (d.qy || d.y));
                  path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                  break;
              case "Q":
                  d.qx = path[1];
                  d.qy = path[2];
                  path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                  break;
              case "L":
                  path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                  break;
              case "H":
                  path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                  break;
              case "V":
                  path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                  break;
              case "Z":
                  path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                  break;
          }
          return path;
      },
      fixArc = function(pp, i) {
          if (pp[i].length > 7) {
              pp[i].shift();
              var pi = pp[i];
              while (pi.length) {
                  pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
              }
              pp.splice(i, 1);
              ii = mmax(p.length, p2 && p2.length || 0);
          }
      },
      fixM = function(path1, path2, a1, a2, i) {
          if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
              path2.splice(i, 0, ["M", a2.x, a2.y]);
              a1.bx = 0;
              a1.by = 0;
              a1.x = path1[i][1];
              a1.y = path1[i][2];
              ii = mmax(p.length, p2 && p2.length || 0);
          }
      };
      for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
          p[i] = processPath(p[i], attrs);
          fixArc(p, i);
          p2 && (p2[i] = processPath(p2[i], attrs2));
          p2 && fixArc(p2, i);
          fixM(p, p2, attrs, attrs2, i);
          fixM(p2, p, attrs2, attrs, i);
          var seg = p[i],
          seg2 = p2 && p2[i],
          seglen = seg.length,
          seg2len = p2 && seg2.length;
          attrs.x = seg[seglen - 2];
          attrs.y = seg[seglen - 1];
          attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
          attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
          attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
          attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
          attrs2.x = p2 && seg2[seg2len - 2];
          attrs2.y = p2 && seg2[seg2len - 1];
      }
      return [p, p2];
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
      rad = deg2rad * (+angle || 0),
      res = [],
      xy,
      rotate = cacher(function(x, y, rad) {
          var X = x * mathCos(rad) - y * mathSin(rad),
          Y = x * mathSin(rad) + y * mathCos(rad);
          return {
              x: X,
              y: Y
          };
      });
      if (!recursive) {
          xy = rotate(x1, y1, -rad);
          x1 = xy.x;
          y1 = xy.y;
          xy = rotate(x2, y2, -rad);
          x2 = xy.x;
          y2 = xy.y;
          var cos = mathCos(deg2rad * angle),
          sin = mathSin(deg2rad * angle),
          x = (x1 - x2) / 2,
          y = (y1 - y2) / 2;
          var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
          if (h > 1) {
              h = mathSqrt(h);
              rx = h * rx;
              ry = h * ry;
          }
          var rx2 = rx * rx,
          ry2 = ry * ry,
          k = (large_arc_flag == sweep_flag ? -1 : 1) *
          mathSqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
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
          x2 = cx + rx * mathCos(f2);
          y2 = cy + ry * mathSin(f2);
          res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
      }
      df = f2 - f1;
      var c1 = mathCos(f1),
      s1 = mathSin(f1),
      c2 = mathCos(f2),
      s2 = mathSin(f2),
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
          return [m2, m3, m4][concat](res);
      } else {
          res = [m2, m3, m4][concat](res).join()[split](",");
          var newres = [];
          for (var i = 0, ii = res.length; i < ii; i++) {
              newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
          }
          return newres;
      }
  }

  exports.foo = foo;

  Object.defineProperty(exports, '__esModule', { value: true });

}));