var Input = (function (a) {
  function g() {
    j.inputValues = s(o(location.search), a);
  }
  function l() {
    return "?" + k(q(j.inputValues, a));
  }
  function m() {
    var t = j.write();
    if (
      window.event_script &&
      window.action != "show" &&
      $("#event-form").length > 0
    ) {
      $("#event-form").attr("action", t).submit();
    } else {
      if (window.scheduling_widget && $("#nav-form").length > 0) {
        $("#nav-form").attr("action", t).submit();
      } else {
        window.location = t;
      }
    }
  }
  function b() {
    for (var u in a[j.source]) {
      var t = getCookie(u);
      j.inputValues[u] = t == null ? null : decodeURIComponent(t);
    }
    d();
    j.inputValues = s(j.inputValues, a);
  }
  function d() {
    for (var u in a[j.source]) {
      var t = a[j.source][u];
      if ($.inArray(t, j.volatileValues) != -1) {
        deleteCookie(u);
      }
    }
  }
  function f() {
    var t = q(j.inputValues, a);
    for (var u in t) {
      if (t[u] != null) {
        if (
          j.whitelist.length > 0 &&
          $.inArray(a[j.source][u], j.whitelist) < 0
        ) {
          continue;
        }
        setCookie(u, encodeURIComponent(t[u]), 3650);
      }
    }
  }
  function h(t) {
    if (j.applyInProgress || j.pingbackInProgress) {
      j.deleteVolatile();
    }
    j.write();
    if (t == true) {
      setTimeout(function () {
        $("#loading-overlay").show();
      }, 300);
      j.applyInProgress = true;
      window.location = "/";
    }
  }
  var i = {
    read: [g, b],
    write: [l, f],
    apply: [m, h],
    deleteVolatile: [function () {}, d],
  };
  function n() {
    j.read();
  }
  function e(u, t) {
    return j.inputValues[u] == undefined ? t : j.inputValues[u];
  }
  function c(u, v) {
    var t = j.inputIncarnations[u];
    t = t == undefined ? 1 : t + 1;
    j.inputIncarnations[u] = t;
    j.inputValues[u] = v;
  }
  function r(t) {
    j.volatileValues.push(t);
  }
  function s(w, u) {
    u = u[j.source];
    var t;
    var x = [];
    for (var v in w) {
      t = u[v];
      if (t === undefined) {
        t = v;
      }
      x[t] = w[v];
    }
    return x;
  }
  function q(v, t) {
    t = t[j.source];
    var w = {};
    w[j.source] = {};
    for (var u in t) {
      w[j.source][t[u]] = u;
    }
    return s(v, w);
  }
  function o(t) {
    var A = [];
    if (t) {
      var u = t.indexOf("?");
      if (u >= 0) {
        t = t.substring(u + 1, t.length);
      }
      if (t.length > 0) {
        t = t.replace(/\+/g, " ");
        var w = t.split("&");
        for (var x = 0; x < w.length; x++) {
          var z = w[x].split("=");
          var v = z.shift();
          var y = z.length >= 1 ? decodeURIComponent(z.join("=")) : v;
          A[v] = y;
        }
      }
    }
    return A;
  }
  function k(t) {
    var v = [];
    for (var u in t) {
      if (t[u] != null) {
        v.push(u + "=" + encodeURIComponent(t[u]));
      }
    }
    return v.join("&");
  }
  function p(t, u) {
    if (u == undefined) {
      u = false;
    }
    j.quiet = u;
    j.apply(false);
    if (t) {
      j.pingbackInProgress = true;
      $.ajax({
        url: "/pingback",
        type: "GET",
        data: { r: Math.random() },
        error: function (v, x, w) {
          j.pingbackInProgress = false;
          j.deleteVolatile();
          if (!j.quiet) {
            alert(
              "Error while saving settings to the server. Please try to refresh the page or contact our support."
            );
          }
        },
        success: function (w, x, v) {
          j.pingbackInProgress = false;
          j.deleteVolatile();
          if (!(w && w.status && w.status == "ok")) {
            if (!j.quiet) {
              alert(
                "Error while saving settings to the server. Please try to refresh the page or contact our support."
              );
            }
          }
        },
        dataType: "json",
      });
    } else {
      j.deleteVolatile();
    }
  }
  var j = {
    source:
      window.embedded_script && window.time_script
        ? "cookie"
        : window.time_script
        ? "cookie"
        : window.location.search
        ? "query_string"
        : "cookie",
    inputValues: [],
    inputIncarnations: [],
    volatileValues: [],
    whitelist: [],
    get: e,
    set: c,
    parseQS: o,
    markVolatile: r,
    applyWithPingback: p,
    init: n,
  };
  $.each(i, function (t, u) {
    j[t] = u[j.source == "query_string" ? 0 : 1];
  });
  return j;
})(window.input_mapping);
Input.markVolatile("chosen_date");
Input.markVolatile("undo_url");
Input.markVolatile("action");
if (window.loggedIn) {
  Input.markVolatile("fullscreen");
  Input.markVolatile("locations");
  Input.markVolatile("home");
  Input.markVolatile("ampm_mode");
  Input.markVolatile("tznames_mode");
  Input.markVolatile("weekends_mode");
  Input.markVolatile("current_tab");
}
Input.init();
window.undo_url = Input.get("undo_url");
Input.set("undo_url", null);
if (!window.scheduling_widget) {
  verifyCoookieSupport();
}
function navigateTo(d) {
  var e = Input.parseQS(d);
  var b = window.input_mapping.query_string;
  var a = undefined;
  for (var c in e) {
    if (b[c] != undefined) {
      a = b[c];
      Input.set(a, e[c]);
    }
  }
  Input.apply(true);
}
function setCookie(c, d, e) {
  if (e) {
    var b = new Date();
    b.setTime(b.getTime() + e * 24 * 60 * 60 * 1000);
    var a = "; expires=" + b.toGMTString();
  } else {
    var a = "";
  }
  document.cookie = c + "=" + d + a + "; path=/";
}
function getCookie(b) {
  var e = b + "=";
  var a = document.cookie.split(";");
  for (var d = 0; d < a.length; d++) {
    var f = a[d];
    while (f.charAt(0) == " ") {
      f = f.substring(1, f.length);
    }
    if (f.indexOf(e) == 0) {
      return f.substring(e.length, f.length);
    }
  }
  return null;
}
function deleteCookie(a) {
  setCookie(a, "", -1);
}
function verifyCoookieSupport() {
  var b = "testCookirToBeDeleted";
  var e = "testval";
  setCookie(b, e, 3);
  var d = getCookie(b);
  deleteCookie(b);
  if (e != d) {
    var c = document.getElementById("jsWarning");
    c.innerHTML =
      "Please enable <u>COOKIES</u> for this page to work properly!";
    c.style.display = "block";
    var a = new Image();
    a.src = "/helper/jserror?m=disabled+cookies";
  }
}
/*
 *	jquery.suggest 1.1 - 2007-08-06
 *
 *	Uses code and techniques from following libraries:
 *	1. http://www.dyve.net/jquery/?autocomplete
 *	2. http://dev.jquery.com/browser/trunk/plugins/interface/iautocompleter.js
 *
 *	All the new stuff written by Peter Vulgaris (www.vulgarisoip.com)
 *	Feel free to do whatever you want with this file
 *
 */
(function (a) {
  a.suggest = function (p, f) {
    var b = a(p).attr("autocomplete", "off");
    var d = a(document.createElement("ul"));
    var x = null;
    var m = false;
    var c = 0;
    var r = [];
    var q = 0;
    var o = 0;
    d.addClass(f.resultsClass).appendTo("body");
    i();
    a(window).load(i).resize(i);
    b.blur(function () {
      setTimeout(function () {
        u();
      }, 200);
    });
    try {
      d.bgiframe();
    } catch (w) {}
    if (a.browser.mozilla) {
      b.keypress(l);
    } else {
      b.keydown(l);
    }
    function i() {
      var e = b.offset();
      d.css({ top: e.top + p.offsetHeight + "px", left: e.left + "px" });
    }
    function l(B) {
      if (
        (/27$|38$|40$/.test(B.keyCode) && d.is(":visible")) ||
        (/^13$|^9$/.test(B.keyCode) && z())
      ) {
        if (B.preventDefault) {
          B.preventDefault();
        }
        if (B.stopPropagation) {
          B.stopPropagation();
        }
        B.cancelBubble = true;
        B.returnValue = false;
        switch (B.keyCode) {
          case 38:
            j();
            break;
          case 40:
            y();
            break;
          case 9:
          case 13:
            v();
            break;
          case 27:
            u();
            break;
        }
      } else {
        if (/40$|13$|27$/.test(B.keyCode) && (!d.is(":visible") || !z())) {
          if (B.preventDefault) {
            B.preventDefault();
          }
          if (B.stopPropagation) {
            B.stopPropagation();
          }
          B.cancelBubble = true;
          B.returnValue = false;
          switch (B.keyCode) {
            case 13:
            case 40:
              k();
              break;
            case 27:
              if (f.onHasText) {
                setTimeout(function () {
                  f.onHasText(0);
                }, 0);
              }
              break;
          }
        } else {
          setTimeout(
            (function (e) {
              return function () {
                var C = e.val().length;
                var D = C != c;
                if (m) {
                  clearTimeout(m);
                }
                if (C == 0) {
                  u();
                } else {
                  m = setTimeout(k, f.delay);
                }
                if (c != C) {
                  c = C;
                  if (f.onHasText) {
                    f.onHasText(C);
                  }
                }
              };
            })(b),
            0
          );
        }
      }
    }
    function k() {
      var e = a.trim(b.val());
      if (e.length >= f.minchars) {
        cached = A(e);
        if (cached) {
          h(cached.items);
        } else {
          t();
          a.getJSON(
            f.source,
            { r: Math.random(), q: e },
            (function (B) {
              return function (C) {
                var D = a.trim(b.val());
                g(B, C, C.length * f.averageSuggesionSize);
                if (D == B) {
                  h(C);
                }
              };
            })(e)
          );
        }
      } else {
        u();
      }
    }
    function t() {
      if (f.progressHandler != false) {
        x = setTimeout(function () {
          f.progressHandler("fetching");
        }, f.delay + 50);
      }
    }
    function n() {
      if (f.progressHandler != false) {
        if (x) {
          clearTimeout(x);
        }
        f.progressHandler("done");
      }
    }
    function A(B) {
      for (var e = 0; e < r.length; e++) {
        if (r[e]["q"] == B) {
          r.unshift(r.splice(e, 1)[0]);
          return r[0];
        }
      }
      return false;
    }
    function g(D, e, B) {
      while (r.length && q + B > f.maxCacheSize) {
        var C = r.pop();
        q -= C.size;
      }
      r.push({ q: D, size: B, items: e });
      q += B;
    }
    function h(e) {
      o = 0;
      if (!e || !e.length) {
        d.html(f.notFoundMessage);
        s();
        return;
      }
      o = e.length;
      if (f.maxDisplayItems != false && e.length > f.maxDisplayItems) {
        for (var C = e.length - 1; C >= f.maxDisplayItems; C--) {
          e.splice(C, 1);
        }
      }
      var B = "";
      for (var C = 0; C < e.length; C++) {
        B += '<li value="' + e[C].id + '">' + e[C].text + "</li>";
      }
      d.html(B)
        .children("li")
        .mouseover(function () {
          d.children("li").removeClass(f.selectClass);
          a(this).addClass(f.selectClass);
        })
        .mousedown(function (D) {
          D.preventDefault();
          D.stopPropagation();
          v();
        });
      s();
    }
    function s() {
      i();
      d.show();
      n();
      if (f.onResultsToggle) {
        f.onResultsToggle("visible");
      }
      y();
    }
    function u() {
      d.hide();
      n();
      if (f.onResultsToggle) {
        f.onResultsToggle("hidden");
      }
    }
    function z() {
      if (!d.is(":visible")) {
        return false;
      }
      var e = d.children("li." + f.selectClass);
      if (!e.length) {
        e = false;
      }
      return e;
    }
    function v() {
      $currentResult = z();
      if ($currentResult) {
        if (!f.onSelect) {
          b.val($currentResult.text());
        }
        d.hide();
        if (f.onSelect) {
          f.onSelect.apply(b[0], new Array($currentResult[0]));
        }
      }
    }
    function y() {
      if (o == 0) {
        return;
      }
      $currentResult = z();
      if ($currentResult) {
        $currentResult
          .removeClass(f.selectClass)
          .next()
          .addClass(f.selectClass);
      } else {
        d.children("li:first-child").addClass(f.selectClass);
      }
    }
    function j() {
      if (o == 0) {
        return;
      }
      $currentResult = z();
      if ($currentResult) {
        $currentResult
          .removeClass(f.selectClass)
          .prev()
          .addClass(f.selectClass);
      } else {
        d.children("li:last-child").addClass(f.selectClass);
      }
    }
  };
  a.fn.suggest = function (c, b) {
    if (!c) {
      return;
    }
    b = b || {};
    b.source = c;
    b.delay = b.delay || 100;
    b.resultsClass = b.resultsClass || "ac_results";
    b.selectClass = b.selectClass || "ac_over";
    b.matchClass = b.matchClass || "ac_match";
    b.minchars = b.minchars || 1;
    b.delimiter = b.delimiter || "\n";
    b.onSelect = b.onSelect || false;
    b.onResultsToggle = b.onResultsToggle || false;
    b.onHasText = b.onHasText || false;
    b.maxCacheSize = b.maxCacheSize || 65536;
    b.htmlOn = b.htmlOn || false;
    b.progressHandler = b.progressHandler ? b.progressHandler : false;
    b.maxDisplayItems = b.maxDisplayItems ? b.maxDisplayItems : false;
    b.averageSuggestionSize = b.averageSuggestionSize
      ? b.averageSuggestionSize
      : 200;
    b.notFoundMessage = b.notFoundMessage || "<li>Not found</li>";
    this.each(function () {
      new a.suggest(this, b);
    });
    return this;
  };
})(jQuery);
/*
 * jmpopups
 * Copyright (c) 2009 Otavio Avila (http://otavioavila.com)
 * Licensed under GNU Lesser General Public License
 *
 * @docs http://jmpopups.googlecode.com/
 * @version 0.5.1
 *
 */
var jmpopups = jmpopups || {};
(function (g) {
  var c = [];
  var h = false;
  var a = [];
  var j = { screenLockerBackground: "#000", screenLockerOpacity: "0.5" };
  g.setupJMPopups = function (m) {
    j = jQuery.extend(j, m);
    return this;
  };
  g.openPopupLayer = function (m) {
    if (typeof m.name != "undefined" && !k(m.name)) {
      m = jQuery.extend(
        {
          width: "auto",
          height: "auto",
          parameters: {},
          target: "",
          success: function () {},
          error: function () {},
          beforeClose: function () {},
          afterClose: function () {},
          reloadSuccess: null,
          cache: false,
        },
        m
      );
      i(m, true);
      return this;
    }
  };
  g.closePopupLayer = function (m) {
    if (m) {
      for (var n = 0; n < c.length; n++) {
        if (c[n].name == m) {
          var o = c[n];
          c.splice(n, 1);
          o.beforeClose();
          jQuery("#popupLayer_" + m).fadeOut(function () {
            jQuery("#popupLayer_" + m).remove();
            a.pop();
            if (a.length > 0) {
              jQuery(a[a.length - 1]).focus();
            }
            o.afterClose();
            l(m);
          });
          break;
        }
      }
    } else {
      if (c.length > 0) {
        g.closePopupLayer(c[c.length - 1].name);
      }
    }
    return this;
  };
  g.reloadPopupLayer = function (m, o) {
    if (m) {
      for (var n = 0; n < c.length; n++) {
        if (c[n].name == m) {
          if (o) {
            c[n].reloadSuccess = o;
          }
          i(c[n], false);
          break;
        }
      }
    } else {
      if (c.length > 0) {
        g.reloadPopupLayer(c[c.length - 1].name);
      }
    }
    return this;
  };
  function d() {
    if (h) {
      jQuery("#popupLayerScreenLocker").height(
        jQuery(document).height() + "px"
      );
      jQuery("#popupLayerScreenLocker").width(
        jQuery(document.body).outerWidth(true) + "px"
      );
    }
  }
  function k(m) {
    if (m) {
      for (var n = 0; n < c.length; n++) {
        if (c[n].name == m) {
          return true;
        }
      }
    }
    return false;
  }
  function f() {
    if (jQuery("#popupLayerScreenLocker").length) {
      if (c.length == 1) {
        h = true;
        d();
        jQuery("#popupLayerScreenLocker").fadeIn();
      }
      if (jQuery.browser.msie && jQuery.browser.version < 7) {
        jQuery("select:not(.hidden-by-jmp)")
          .addClass("hidden-by-jmp hidden-by-" + c[c.length - 1].name)
          .css("visibility", "hidden");
      }
      jQuery("#popupLayerScreenLocker").css(
        "z-index",
        parseInt(
          c.length == 1
            ? 50999
            : jQuery("#popupLayer_" + c[c.length - 2].name).css("z-index")
        ) + 1
      );
    } else {
      jQuery("body").append("<div id='popupLayerScreenLocker'><!-- --></div>");
      jQuery("#popupLayerScreenLocker").css({
        position: "absolute",
        background: j.screenLockerBackground,
        left: "0",
        top: "0",
        opacity: j.screenLockerOpacity,
        display: "none",
      });
      f();
      jQuery("#popupLayerScreenLocker").click(function () {
        g.closePopupLayer();
      });
    }
  }
  function l(m) {
    if (c.length == 0) {
      screenlocker = false;
      jQuery("#popupLayerScreenLocker").fadeOut();
    } else {
      jQuery("#popupLayerScreenLocker").css(
        "z-index",
        parseInt(jQuery("#popupLayer_" + c[c.length - 1].name).css("z-index")) -
          1
      );
    }
    if (jQuery.browser.msie && jQuery.browser.version < 7) {
      jQuery("select.hidden-by-" + m)
        .removeClass("hidden-by-jmp hidden-by-" + m)
        .css("visibility", "visible");
    }
  }
  function e(r, n) {
    if (r) {
      if (r.width() < jQuery(window).width()) {
        var q = (document.documentElement.offsetWidth - r.width()) / 2;
      } else {
        var q = document.documentElement.scrollLeft + 5;
      }
      if (r.height() < jQuery(window).height()) {
        var p =
          document.documentElement.scrollTop +
          (jQuery(window).height() - r.height()) / 2;
      } else {
        var p = document.documentElement.scrollTop + 5;
      }
      var m = { left: q + "px", top: p + "px" };
      if (!n) {
        r.css(m);
      } else {
        r.animate(m, "slow");
      }
      d();
    } else {
      for (var o = 0; o < c.length; o++) {
        e(jQuery("#popupLayer_" + c[o].name), true);
      }
    }
  }
  function b(m, s, r) {
    var q = "popupLayer_" + m.name;
    if (s) {
      f();
      jQuery("body").append("<div id='" + q + "'><!-- --></div>");
      var t =
        parseInt(
          c.length == 1
            ? 51000
            : jQuery("#popupLayer_" + c[c.length - 2].name).css("z-index")
        ) + 2;
    } else {
      var t = jQuery("#" + q).css("z-index");
    }
    var u = jQuery("#" + q);
    u.css({
      visibility: "hidden",
      width: m.width == "auto" ? "" : m.width + "px",
      height: m.height == "auto" ? "" : m.height + "px",
      position: "absolute",
      "z-index": t,
    });
    var p =
      "<a href='#' class='jmp-link-at-top' style='position:absolute; left:-9999px; top:-1px;'>&nbsp;</a><input class='jmp-link-at-top' style='position:absolute; left:-9999px; top:-1px;' />";
    var n =
      "<a href='#' class='jmp-link-at-bottom' style='position:absolute; left:-9999px; bottom:-1px;'>&nbsp;</a><input class='jmp-link-at-bottom' style='position:absolute; left:-9999px; top:-1px;' />";
    u.html(p + r + n);
    e(u);
    u.css("display", "none");
    u.css("visibility", "visible");
    if (s) {
      u.fadeIn();
    } else {
      u.show();
    }
    jQuery("#" + q + " .jmp-link-at-top, #" + q + " .jmp-link-at-bottom").focus(
      function () {
        jQuery(a[a.length - 1]).focus();
      }
    );
    var o = jQuery(
      "#" +
        q +
        " a:visible:not(.jmp-link-at-top, .jmp-link-at-bottom), #" +
        q +
        " *:input:visible:not(.jmp-link-at-top, .jmp-link-at-bottom)"
    );
    if (o.length == 0) {
      var v =
        "<a href='#' class='jmp-link-inside-popup' style='position:absolute; left:-9999px;'>&nbsp;</a>";
      u.find(".jmp-link-at-top").after(v);
      a.push(jQuery(u).find(".jmp-link-inside-popup")[0]);
    } else {
      o.each(function () {
        if (
          !jQuery(this).hasClass("jmp-link-at-top") &&
          !jQuery(this).hasClass("jmp-link-at-bottom")
        ) {
          a.push(this);
          return false;
        }
      });
    }
    jQuery(a[a.length - 1]).focus();
    m.success();
    if (m.reloadSuccess) {
      m.reloadSuccess();
      m.reloadSuccess = null;
    }
  }
  function i(m, n) {
    if (n) {
      c.push(m);
    }
    if (m.target != "") {
      b(m, n, jQuery("#" + m.target).html());
    } else {
      jQuery.ajax({
        url: m.url,
        data: m.parameters,
        cache: m.cache,
        dataType: "html",
        method: "GET",
        success: function (o) {
          b(m, n, o);
        },
        error: m.error,
      });
    }
  }
  jQuery(window).resize(function () {
    d();
    e();
  });
  jQuery(document).keydown(function (m) {
    if (m.keyCode == 27) {
      g.closePopupLayer();
    }
  });
})(jmpopups);
(function (a) {
  a.glassify = function (n, h) {
    var l;
    var k = null;
    var f = false;
    var g = { columnWidth: 0, glassDim: null, overColumnIndex: null };
    h.debug = 0;
    j();
    function j() {
      l = a(h.screenSelector);
      n.css("z-index", 10000);
      if (h.debug) {
        n.css({ "background-color": "blue", opacity: 0.05 });
      }
      p();
      n.bind("resize", p);
      f = false;
      n.bind(f ? "touchmove.glass" : "mousemove.glass", e);
      n.bind(f ? "touchstart.glass" : "mousedown.glass", m);
      n.bind(f ? "touchend.glass" : "mouseup.glass", o);
      n.bind("mouseout.glass", d);
      a(window).bind("resize.glass", p);
    }
    function p() {
      var q = { top: 0, left: 0, right: 0, bottom: 0 };
      q.top += a.isFunction(h.adjust.top) ? h.adjust.top() : h.adjust.top;
      q.left += a.isFunction(h.adjust.left) ? h.adjust.left() : h.adjust.left;
      q.right += a.isFunction(h.adjust.right)
        ? h.adjust.right()
        : h.adjust.right;
      q.bottom += a.isFunction(h.adjust.bottom)
        ? h.adjust.bottom()
        : h.adjust.bottom;
      n.css(q);
      g.glassDim = q;
      g.columnWidth =
        h.columnWidth == "auto" ? n.width() / h.columns : h.columnWidth;
      n.data("computed", g);
      var r =
        "Glass width: " +
        n.width() +
        "\nGlass columns: " +
        h.columns +
        " of size= " +
        g.columnWidth +
        " (specied of size: " +
        h.columnWidth +
        ") Active regions per column: " +
        h.activeRegionsPerColumn;
      +"\nGlass offset: top=" + g.glassDim.top + " left=" + g.glassDim.left;
      c(r);
    }
    function d() {
      c("glass out");
      i(null);
    }
    function e(r) {
      r.preventDefault();
      r.stopPropagation();
      r.stopImmediatePropagation();
      var q = b(r);
      if (g.overColumnIndex == q) {
        return;
      }
      i(q, r);
    }
    function b(s) {
      var r = f ? s.originalEvent.touches[0].pageX : s.pageX;
      var t = Math.floor(
        (r - g.glassDim.left - l.offset().left) /
          (g.columnWidth / h.activeRegionsPerColumn)
      );
      var q = t / (h.activeRegionsPerColumn * 1);
      if (q >= h.columns) {
        q = h.columns - 1;
      }
      if (q < 0) {
        q = 0;
      }
      return q;
    }
    function m(q) {
      c("mouse DOWN on col=" + g.overColumnIndex);
      if (f) {
        g.overColumnIndex = b(q);
      }
      q.preventDefault();
      q.stopPropagation();
      if (h.onMouseDown) {
        h.onMouseDown(g.overColumnIndex);
      }
    }
    function o(q) {
      c("mouse UP on col=" + g.overColumnIndex);
      q.preventDefault();
      q.stopPropagation();
      if (h.onMouseUp) {
        h.onMouseUp(g.overColumnIndex);
      }
    }
    function i(r, s) {
      var q = g.overColumnIndex;
      g.overColumnIndex = r;
      c("New column index: " + r);
      if (h.onColumnChange) {
        setTimeout(
          (function (u, t, v) {
            return function () {
              h.onColumnChange(u, t, v);
            };
          })(r, q, s),
          0
        );
      }
    }
    function c(q) {
      if (h.debug) {
        console.log(q);
      }
    }
  };
  a.fn.glassify = function (b) {
    var c = {
      columns: 2,
      activeRegionsPerColumn: 1,
      columnWidth: "auto",
      screenSelector: "body",
      defaultColumnIndex: null,
      onColumnChange: null,
      onMouseDown: null,
      onMouseUp: null,
      adjust: { top: 0, left: 0, right: 0, bottom: 0 },
    };
    b.adjust = a.extend(c.adjust, b.adjust);
    a.extend(c, b);
    return this.each(function () {
      new a.glassify(a(this), c);
    });
  };
})(jQuery);
/*
Date Input 1.2.1
Requires jQuery version: >= 1.2.6

Copyright (c) 2007-2008 Jonathan Leighton & Torchbox Ltd

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
DateInput = (function (a) {
  function b(c, d) {
    if (typeof d != "object") {
      d = {};
    }
    a.extend(this, b.DEFAULT_OPTS, d);
    this.input = a(c);
    this.input.data("val", this.selected_date);
    this.bindMethodsToObj(
      "show",
      "hide",
      "hideIfClickOutside",
      "keydownHandler",
      "selectDate"
    );
    this.build();
    this.selectDate();
    if (this.show_always) {
      this.show();
    } else {
      this.hide();
    }
  }
  b.DEFAULT_OPTS = {
    month_names: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    short_month_names: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    short_day_names: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    start_of_week: 0,
    day_selected_callback: null,
    current_date: null,
    show_always: false,
  };
  b.prototype = {
    build: function () {
      var c = a(
        '<p class="month_nav"><span class="button prev" title="[Page-Up]">&#171;</span> <span class="month_name"></span> <span class="button next" title="[Page-Down]">&#187;</span></p>'
      );
      this.monthNameSpan = a(".month_name", c);
      a(".prev", c).click(
        this.bindToObj(function () {
          this.moveMonthBy(-1);
        })
      );
      a(".next", c).click(
        this.bindToObj(function () {
          this.moveMonthBy(1);
        })
      );
      var d = a(
        '<p class="year_nav"><span class="button prev" title="[Ctrl+Page-Up]">&#171;</span> <span class="year_name"></span> <span class="button next" title="[Ctrl+Page-Down]">&#187;</span></p>'
      );
      this.yearNameSpan = a(".year_name", d);
      a(".prev", d).click(
        this.bindToObj(function () {
          this.moveMonthBy(-12);
        })
      );
      a(".next", d).click(
        this.bindToObj(function () {
          this.moveMonthBy(12);
        })
      );
      var e = a('<div class="nav"></div>').append(c, d);
      var f = "<table><thead><tr>";
      a(this.adjustDays(this.short_day_names)).each(function () {
        f += "<th>" + this + "</th>";
      });
      f += "</tr></thead><tbody></tbody></table>";
      this.dateSelector = this.rootLayers = a(
        '<div class="date_selector"></div>'
      )
        .append(e, f)
        .insertAfter(this.input);
      this.rootLayers.click(function (g) {
        g.stopPropagation();
      });
      if (a.browser.msie && a.browser.version < 7) {
        this.ieframe = a(
          '<iframe class="date_selector_ieframe" frameborder="0" src="#"></iframe>'
        ).insertBefore(this.dateSelector);
        this.rootLayers = this.rootLayers.add(this.ieframe);
        a(".button", e).mouseover(function () {
          a(this).addClass("hover");
        });
        a(".button", e).mouseout(function () {
          a(this).removeClass("hover");
        });
      }
      this.tbody = a("tbody", this.dateSelector);
      this.input.change(
        this.bindToObj(function () {
          this.selectDate();
        })
      );
      this.selectDate();
    },
    selectMonth: function (d) {
      var k = new Date(d.getFullYear(), d.getMonth(), 1);
      if (
        !this.currentMonth ||
        !(
          this.currentMonth.getFullYear() == k.getFullYear() &&
          this.currentMonth.getMonth() == k.getMonth()
        )
      ) {
        this.currentMonth = k;
        var j = this.rangeStart(d),
          h = this.rangeEnd(d);
        var c = this.daysBetween(j, h);
        var f = "";
        for (var e = 0; e <= c; e++) {
          var g = new Date(
            j.getFullYear(),
            j.getMonth(),
            j.getDate() + e,
            12,
            0
          );
          if (this.isFirstDayOfWeek(g)) {
            f += "<tr>";
          }
          if (g.getMonth() == d.getMonth()) {
            f +=
              '<td class="selectable_day" date="' +
              this.dateToString(g) +
              '">' +
              g.getDate() +
              "</td>";
          } else {
            f +=
              '<td class="unselected_month" date="' +
              this.dateToString(g) +
              '">' +
              g.getDate() +
              "</td>";
          }
          if (this.isLastDayOfWeek(g)) {
            f += "</tr>";
          }
        }
        this.tbody.empty().append(f);
        this.monthNameSpan.empty().append(this.monthName(d));
        this.yearNameSpan.empty().append(this.currentMonth.getFullYear());
        a(".selectable_day", this.tbody).click(
          this.bindToObj(function (i) {
            this.changeInput(a(i.target).attr("date"));
          })
        );
        a(
          "td[date=" + this.dateToString(new Date()) + "]",
          this.tbody
        ).addClass("today");
        a("td.selectable_day", this.tbody).mouseover(function () {
          a(this).addClass("hover");
        });
        a("td.selectable_day", this.tbody).mouseout(function () {
          a(this).removeClass("hover");
        });
      }
      a(".selected", this.tbody).removeClass("selected");
      a("td[date=" + this.selectedDateString + "]", this.tbody).addClass(
        "selected"
      );
    },
    selectDate: function (c) {
      if (typeof c == "undefined") {
        c = this.stringToDate(this.input.data("val"));
      }
      if (!c) {
        c = new Date();
      }
      this.selectedDate = c;
      this.selectedDateString = this.dateToString(this.selectedDate);
      this.selectMonth(this.selectedDate);
    },
    changeInput: function (c) {
      this.input.data("val", c);
      this.selectDate(this.stringToDate(c));
      this.hide();
      if (this.day_selected_callback) {
        this.day_selected_callback(c);
      }
    },
    show: function () {
      this.rootLayers.css("display", "block");
      a([window, document.body]).click(this.hideIfClickOutside);
      this.input.unbind("click", this.show);
      a(document).bind("keydown", this.keydownHandler);
      this.setPosition();
    },
    hide: function () {
      if (this.show_always) {
        return;
      }
      this.rootLayers.css("display", "none");
      a([window, document.body]).unbind("click", this.hideIfClickOutside);
      this.input.click(this.show);
      a(document).unbind("keydown", this.keydownHandler);
    },
    hideIfClickOutside: function (c) {
      if (c.target != this.input[0] && !this.insideSelector(c)) {
        this.hide();
      }
    },
    insideSelector: function (c) {
      var d = this.dateSelector.position();
      d.right = d.left + this.dateSelector.outerWidth();
      d.bottom = d.top + this.dateSelector.outerHeight();
      return (
        c.pageY < d.bottom &&
        c.pageY > d.top &&
        c.pageX < d.right &&
        c.pageX > d.left
      );
    },
    keydownHandler: function (c) {
      switch (c.keyCode) {
        case 9:
        case 27:
          this.hide();
          return;
          break;
        case 13:
          this.changeInput(this.selectedDateString);
          break;
        case 33:
          this.moveDateMonthBy(c.ctrlKey ? -12 : -1);
          break;
        case 34:
          this.moveDateMonthBy(c.ctrlKey ? 12 : 1);
          break;
        case 38:
          this.moveDateBy(-7);
          break;
        case 40:
          this.moveDateBy(7);
          break;
        case 37:
          this.moveDateBy(-1);
          break;
        case 39:
          this.moveDateBy(1);
          break;
        default:
          return;
      }
      c.preventDefault();
    },
    stringToDate: function (c) {
      var d;
      if ((d = c.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4,4})$/))) {
        return new Date(d[3], d[1] - 1, d[2], 12, 0);
      } else {
        return null;
      }
    },
    dateToString: function (c) {
      return c.getMonth() + 1 + "/" + c.getDate() + "/" + c.getFullYear();
    },
    setPosition: function () {
      var c = this.input.offset();
      this.rootLayers.css({
        top: -1 * (this.rootLayers.outerWidth() / 3),
        left: -1 * this.rootLayers.outerWidth(),
      });
      if (this.ieframe) {
        this.ieframe.css({
          width: this.dateSelector.outerWidth(),
          height: this.dateSelector.outerHeight(),
        });
      }
    },
    moveDateBy: function (d) {
      var c = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth(),
        this.selectedDate.getDate() + d
      );
      this.selectDate(c);
    },
    moveDateMonthBy: function (d) {
      var c = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() + d,
        this.selectedDate.getDate()
      );
      if (c.getMonth() == this.selectedDate.getMonth() + d + 1) {
        c.setDate(0);
      }
      this.selectDate(c);
    },
    moveMonthBy: function (c) {
      var d = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + c,
        this.currentMonth.getDate()
      );
      this.selectMonth(d);
    },
    monthName: function (c) {
      return this.month_names[c.getMonth()];
    },
    bindToObj: function (d) {
      var c = this;
      return function () {
        return d.apply(c, arguments);
      };
    },
    bindMethodsToObj: function () {
      for (var c = 0; c < arguments.length; c++) {
        this[arguments[c]] = this.bindToObj(this[arguments[c]]);
      }
    },
    indexFor: function (e, d) {
      for (var c = 0; c < e.length; c++) {
        if (d == e[c]) {
          return c;
        }
      }
    },
    monthNum: function (c) {
      return this.indexFor(this.month_names, c);
    },
    shortMonthNum: function (c) {
      return this.indexFor(this.short_month_names, c);
    },
    shortDayNum: function (c) {
      return this.indexFor(this.short_day_names, c);
    },
    daysBetween: function (d, c) {
      d = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      c = Date.UTC(c.getFullYear(), c.getMonth(), c.getDate());
      return (c - d) / 86400000;
    },
    changeDayTo: function (c, d, e) {
      var f = e * (Math.abs(d.getDay() - c - e * 7) % 7);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + f);
    },
    rangeStart: function (c) {
      return this.changeDayTo(
        this.start_of_week,
        new Date(c.getFullYear(), c.getMonth()),
        -1
      );
    },
    rangeEnd: function (c) {
      return this.changeDayTo(
        (this.start_of_week - 1) % 7,
        new Date(c.getFullYear(), c.getMonth() + 1, 0),
        1
      );
    },
    isFirstDayOfWeek: function (c) {
      return c.getDay() == this.start_of_week;
    },
    isLastDayOfWeek: function (c) {
      return c.getDay() == (this.start_of_week - 1) % 7;
    },
    adjustDays: function (e) {
      var d = [];
      for (var c = 0; c < e.length; c++) {
        d[c] = e[(c + this.start_of_week) % 7];
      }
      return d;
    },
  };
  a.fn.date_input = function (c) {
    return this.each(function () {
      new b(this, c);
    });
  };
  a.date_input = {
    initialize: function (c) {
      a("input.date_input").date_input(c);
    },
  };
  return b;
})(jQuery);
/* 
	jQuery List DragSort v0.4
    Website: http://dragsort.codeplex.com/
    License: http://dragsort.codeplex.com/license
*/
(function (a) {
  a.fn.dragsort = function (f) {
    if (typeof f == "string") {
      var d = this.data("lists");
      if (d && d.length > 0) {
        this.each(function (k, j) {
          var l = d[a(j).attr("data-listidx")];
          switch (f) {
            case "disable":
              l.disable();
              break;
            case "enable":
              l.enable();
              break;
            default:
          }
        });
      }
      return this;
    }
    var g = a.extend({}, a.fn.dragsort.defaults, f);
    var c = [];
    var e = "move";
    var b = "move";
    var i = null,
      h = null;
    if (this.selector) {
      a("head").append(
        "<style type='text/css'>" +
          (this.selector.split(",").join(" " + g.dragSelector + ",") +
            " " +
            g.dragSelector) +
          " { cursor: " +
          e +
          "; }</style>"
      );
    }
    this.each(function (k, j) {
      if (
        a(j).is("table") &&
        a(j).children().size() == 1 &&
        a(j).children().is("tbody")
      ) {
        j = a(j).children().get(0);
      }
      var l = {
        draggedItem: null,
        placeHolderItem: null,
        pos: null,
        offset: null,
        offsetLimit: null,
        scroll: null,
        container: j,
        targetElm: null,
        disabled: false,
        init: function () {
          a(this.container)
            .attr("data-listIdx", k)
            .mousedown(this.grabItem)
            .find(g.dragSelector)
            .css("cursor", e);
          a(this.container)
            .children(g.itemSelector)
            .each(function (m) {
              a(this).attr("data-itemIdx", m);
            });
        },
        disable: function () {
          i = null;
          this.disabled = true;
          a(this.container).find(g.dragSelector).css({ cursor: "auto" });
          if (this.targetElm) {
            this.targetElm.css({ cursor: "" });
          }
        },
        enable: function () {
          i = null;
          this.disabled = false;
          a(this.container).find(g.dragSelector).css("cursor", e);
          if (this.targetElm) {
            this.targetElm.css("cursor", e);
          }
        },
        grabItem: function (q) {
          if (q.which != 1 || a(q.target).is(g.dragSelectorExclude)) {
            return;
          }
          var t = q.target;
          while (
            !a(t).is(
              "[data-listIdx='" +
                a(this).attr("data-listIdx") +
                "'] " +
                g.dragSelector
            )
          ) {
            if (t == this) {
              return;
            }
            t = t.parentNode;
          }
          if (i != null && i.draggedItem != null) {
            i.dropItem();
          }
          i = c[a(this).attr("data-listIdx")];
          i.draggedItem = a(t).closest(g.itemSelector);
          if (i.disabled) {
            i = null;
            return;
          }
          i.targetElm = a(q.target);
          var n = parseInt(i.draggedItem.css("marginTop"));
          var s = parseInt(i.draggedItem.css("marginLeft"));
          i.offset = i.draggedItem.offset();
          i.offset.top = q.pageY - i.offset.top + (isNaN(n) ? 0 : n) - 1;
          i.offset.left = q.pageX - i.offset.left + (isNaN(s) ? 0 : s) - 1;
          if (!g.dragBetween) {
            var p =
              a(i.container).outerHeight() == 0
                ? Math.max(
                    1,
                    Math.round(
                      0.5 +
                        (a(i.container).children(g.itemSelector).size() *
                          i.draggedItem.outerWidth()) /
                          a(i.container).outerWidth()
                    )
                  ) * i.draggedItem.outerHeight()
                : a(i.container).outerHeight();
            i.offsetLimit = a(i.container).offset();
            i.offsetLimit.right =
              i.offsetLimit.left +
              a(i.container).outerWidth() -
              i.draggedItem.outerWidth();
            i.offsetLimit.bottom =
              i.offsetLimit.top + p - i.draggedItem.outerHeight();
          }
          var o = i.draggedItem.height();
          var m = i.draggedItem.width();
          var r = i.draggedItem.attr("style");
          i.draggedItem.attr("data-origStyle", r ? r : "");
          if (g.itemSelector == "tr") {
            i.draggedItem.children().each(function () {
              a(this).width(a(this).width());
            });
            i.placeHolderItem = i.draggedItem
              .clone()
              .attr("data-placeHolder", true);
            i.draggedItem.after(i.placeHolderItem);
            i.placeHolderItem.children().each(function () {
              a(this)
                .css({
                  borderWidth: 0,
                  width: a(this).width() + 1,
                  height: a(this).height() + 1,
                })
                .html("&nbsp;");
            });
          } else {
            i.draggedItem.after(g.placeHolderTemplate);
            i.placeHolderItem = i.draggedItem
              .next()
              .css({ height: o, width: m })
              .attr("data-placeHolder", true);
          }
          i.draggedItem
            .css({
              position: "absolute",
              opacity: 1,
              "z-index": 999,
              height: o,
              width: m,
            })
            .addClass("dragging");
          g.dragStart.apply(i.draggedItem);
          a(c).each(function (v, u) {
            u.createDropTargets();
            u.buildPositionTable();
          });
          i.scroll = {
            moveX: 0,
            moveY: 0,
            maxX: a(document).width() - a(window).width(),
            maxY: a(document).height() - a(window).height(),
          };
          i.scroll.scrollY = window.setInterval(function () {
            if (g.scrollContainer != window) {
              a(g.scrollContainer).scrollTop(
                a(g.scrollContainer).scrollTop() + i.scroll.moveY
              );
              return;
            }
            var u = a(g.scrollContainer).scrollTop();
            if (
              (i.scroll.moveY > 0 && u < i.scroll.maxY) ||
              (i.scroll.moveY < 0 && u > 0)
            ) {
              a(g.scrollContainer).scrollTop(u + i.scroll.moveY);
              i.draggedItem.css(
                "top",
                i.draggedItem.offset().top + i.scroll.moveY + 1
              );
            }
          }, 10);
          i.scroll.scrollX = window.setInterval(function () {
            if (g.scrollContainer != window) {
              a(g.scrollContainer).scrollLeft(
                a(g.scrollContainer).scrollLeft() + i.scroll.moveX
              );
              return;
            }
            var u = a(g.scrollContainer).scrollLeft();
            if (
              (i.scroll.moveX > 0 && u < i.scroll.maxX) ||
              (i.scroll.moveX < 0 && u > 0)
            ) {
              a(g.scrollContainer).scrollLeft(u + i.scroll.moveX);
              i.draggedItem.css(
                "left",
                i.draggedItem.offset().left + i.scroll.moveX + 1
              );
            }
          }, 10);
          i.setPos(q.pageX, q.pageY);
          a(document).bind("selectstart", i.stopBubble);
          a(document).bind("mousemove", i.swapItems);
          a(document).bind("mouseup", i.dropItem);
          if (g.scrollContainer != window) {
            a(window).bind("DOMMouseScroll mousewheel", i.wheel);
          }
          return false;
        },
        setPos: function (n, r) {
          var p = r - this.offset.top;
          var o = n - this.offset.left;
          if (!g.dragBetween) {
            p = Math.min(
              this.offsetLimit.bottom,
              Math.max(p, this.offsetLimit.top)
            );
            o = Math.min(
              this.offsetLimit.right,
              Math.max(o, this.offsetLimit.left)
            );
          }
          this.draggedItem.parents().each(function () {
            if (
              a(this).css("position") != "static" &&
              (!a.browser.mozilla || a(this).css("display") != "table")
            ) {
              var s = a(this).offset();
              p -= s.top;
              o -= s.left;
              return false;
            }
          });
          if (g.scrollContainer == window) {
            r -= a(window).scrollTop();
            n -= a(window).scrollLeft();
            r = Math.max(0, r - a(window).height() + 5) + Math.min(0, r - 5);
            n = Math.max(0, n - a(window).width() + 5) + Math.min(0, n - 5);
          } else {
            var m = a(g.scrollContainer);
            var q = m.offset();
            r = Math.max(0, r - m.height() - q.top) + Math.min(0, r - q.top);
            n = Math.max(0, n - m.width() - q.left) + Math.min(0, n - q.left);
          }
          i.scroll.moveX = n == 0 ? 0 : (n * g.scrollSpeed) / Math.abs(n);
          i.scroll.moveY = r == 0 ? 0 : (r * g.scrollSpeed) / Math.abs(r);
          this.draggedItem.css({ top: p });
        },
        wheel: function (n) {
          if (
            (a.browser.safari || a.browser.mozilla) &&
            i &&
            g.scrollContainer != window
          ) {
            var m = a(g.scrollContainer);
            var o = m.offset();
            if (
              n.pageX > o.left &&
              n.pageX < o.left + m.width() &&
              n.pageY > o.top &&
              n.pageY < o.top + m.height()
            ) {
              var p = n.detail ? n.detail * 5 : n.wheelDelta / -2;
              m.scrollTop(m.scrollTop() + p);
              n.preventDefault();
            }
          }
        },
        buildPositionTable: function () {
          var m = this.draggedItem == null ? null : this.draggedItem.get(0);
          var n = [];
          a(this.container)
            .children(g.itemSelector)
            .each(function (o, q) {
              if (q != m) {
                var p = a(q).offset();
                p.right = p.left + a(q).width();
                p.bottom = p.top + a(q).height();
                p.elm = q;
                n.push(p);
              }
            });
          this.pos = n;
        },
        dropItem: function () {
          if (i.draggedItem == null) {
            return;
          }
          i.placeHolderItem.before(i.draggedItem);
          var n = i.draggedItem.attr("data-origStyle");
          if (n == "") {
            i.draggedItem.removeAttr("style");
          } else {
            i.draggedItem.attr("style", n);
          }
          i.draggedItem.removeAttr("data-origStyle").removeClass("dragging");
          i.placeHolderItem.remove();
          a("[data-dropTarget]").remove();
          window.clearInterval(i.scroll.scrollY);
          window.clearInterval(i.scroll.scrollX);
          var m = false;
          a(c).each(function () {
            a(this.container)
              .children(g.itemSelector)
              .each(function (o) {
                if (parseInt(a(this).attr("data-itemIdx")) != o) {
                  m = true;
                  a(this).attr("data-itemIdx", o);
                }
              });
          });
          if (m) {
            g.dragEnd.apply(i.draggedItem);
          }
          i.draggedItem = null;
          a(document).unbind("selectstart", i.stopBubble);
          a(document).unbind("mousemove", i.swapItems);
          a(document).unbind("mouseup", i.dropItem);
          if (g.scrollContainer != window) {
            a(window).unbind("DOMMouseScroll mousewheel", i.wheel);
          }
          return false;
        },
        stopBubble: function () {
          return false;
        },
        swapItems: function (p) {
          if (i.draggedItem == null) {
            return false;
          }
          i.setPos(p.pageX, p.pageY);
          var o = i.findPos(p.pageX, p.pageY);
          var n = i;
          for (var m = 0; o == -1 && g.dragBetween && m < c.length; m++) {
            o = c[m].findPos(p.pageX, p.pageY);
            n = c[m];
          }
          if (o == -1 || a(n.pos[o].elm).attr("data-placeHolder")) {
            return false;
          }
          if (
            h == null ||
            h.top > i.draggedItem.offset().top ||
            h.left > i.draggedItem.offset().left
          ) {
            a(n.pos[o].elm).before(i.placeHolderItem);
          } else {
            a(n.pos[o].elm).after(i.placeHolderItem);
          }
          a(c).each(function (r, q) {
            q.createDropTargets();
            q.buildPositionTable();
          });
          h = i.draggedItem.offset();
          g.dragSwap.apply(i.draggedItem);
          return false;
        },
        findPos: function (m, o) {
          for (var n = 0; n < this.pos.length; n++) {
            if (
              this.pos[n].left < m &&
              this.pos[n].right > m &&
              this.pos[n].top < o &&
              this.pos[n].bottom > o
            ) {
              return n;
            }
          }
          return -1;
        },
        createDropTargets: function () {
          if (!g.dragBetween) {
            return;
          }
          a(c).each(function () {
            var o = a(this.container).find("[data-placeHolder]");
            var n = a(this.container).find("[data-dropTarget]");
            var m = a(this.container).find(g.itemSelector);
            if (o.size() > 0 && n.size() > 0) {
              n.remove();
            } else {
              if (o.size() == 0 && n.size() == 0 && m.size() == 0) {
                a(this.container).append(
                  i.placeHolderItem
                    .removeAttr("data-placeHolder")
                    .clone()
                    .attr("data-dropTarget", true)
                );
                i.placeHolderItem.attr("data-placeHolder", true);
              }
            }
          });
        },
      };
      l.init();
      c.push(l);
    });
    this.data("lists", c);
    return this;
  };
  a.fn.dragsort.defaults = {
    itemSelector: "li",
    dragSelector: "li",
    dragSelectorExclude: "input, textarea, a[href]",
    dragEnd: function () {},
    dragStart: function () {},
    dragSwap: function () {},
    dragBetween: false,
    placeHolderTemplate: "<li>&nbsp;</li>",
    scrollContainer: window,
    scrollSpeed: 5,
  };
})(jQuery);
function containerLocationIds(c, b) {
  var a = Array();
  $(".container").each(function (d) {
    var e = $(this);
    if (b == undefined || e[0] != b[0]) {
      a.push(e.attr("lid"));
    }
  });
  return c == "string" ? a.join(",") : a;
}
function location_list_for_export() {
  var a = { lids: Array(), sts: window.sts, home: 0 };
  $(".container").each(function (d) {
    var g = $(this);
    var b = g.attr("encoded-alias");
    var e = g.attr("lid");
    var f = g.attr("orig-lid");
    var c = originalLocationIndex(g);
    b == undefined ? a.lids.push(e) : a.lids.push(f + "|" + b);
    if (window.locations[c].is_home) {
      a.home = b == undefined ? e : f + "|" + b;
    }
  });
  return a;
}
function updateLinkToPage() {
  var c, b, d, a, h, f;
  c = $("#page-link");
  if (c.length > 0) {
    b = location_list_for_export();
    a = Input.get("chosen_date");
    h = "";
    f = "&hf=" + Input.get("ampm_mode");
    if (a && window.dateModeOn) {
      h = "&date=" + a;
    }
    var g = Input.get("forex_mode");
    var e = Input.get("olympics_mode");
    if (g == 1) {
      h += "&fx=1";
    }
    if (e == 1) {
      h += "&cc=1";
    }
    d = encodeURI(
      window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?pl=1&lid=" +
        b.lids +
        "&h=" +
        b.home +
        h +
        f
    );
    c.attr("href", d);
  }
}
function originalLocationIndex(a) {
  for (var b = 0; b < window.locationRows.length; b++) {
    if (window.locationRows.eq(b)[0] == a[0]) {
      return b;
    }
  }
}
function relearnLocationIds() {
  window.locationRows = $(".container");
}
(function () {
  if (!window.scheduling_widget) {
    $(".container")
      .parent()
      .dragsort({
        dragSelector: ".location,.data",
        dragEnd: a,
        dragBetween: false,
        placeHolderTemplate: '<div class="container plc"></div>',
        itemSelector: "div.srt",
      });
  }
  function a() {
    _gaq.push(["_trackEvent", "Location Management", "Drap-n-Drop"]);
    window.updateHomeHour();
    var b = containerLocationIds();
    Input.set("locations", b.join(","));
    Input.applyWithPingback(window.loggedIn);
    updateLinkToPage();
  }
})();
(function (b) {
  b.inlineEdit = function (c, d) {
    var o = b('<input type="text" />');
    var r = b(
      '<div style="position: absolute; top: -200px; left: 0px; background: yellow;"><span style="background: green; white-space: pre;"></span></div>'
    );
    var m = b("span", r);
    var p = (b.browser.mozilla ? "keypress" : "keydown") + ".inlineedit";
    var j = b.browser.mozilla || b.browser.webkit ? 0 : 20;
    var e = "";
    var k = "";
    var i = "click.inlineedit";
    b(c).bind(i, n);
    function n() {
      if (d.startEditCallback) {
        d.startEditCallback(c);
      }
      b(c).unbind(i, n);
      e = b(c).text();
      k = b(c).html();
      o.val(e).addClass(d.inputClass);
      if (d.maxInputLength > 0) {
        o.attr("maxlength", d.maxInputLength);
      }
      b(c).text("").append(o);
      r.appendTo("body");
      r.css({
        "font-size": o.css("font-size"),
        "font-weight": o.css("font-weight"),
        "font-family": o.css("font-family"),
      });
      h();
      if (d.selectTextOnEdit) {
        o.select();
      }
      o.bind("blur.inlineedit", g);
      o.bind(p, q);
      o.focus();
    }
    function q(s) {
      if (/13|27/.test(s.keyCode)) {
        if (s.preventDefault) {
          s.preventDefault();
        }
        if (s.stopPropagation) {
          s.stopPropagation();
        }
        s.cancelBubble = true;
        s.returnValue = false;
        switch (s.keyCode) {
          case 13:
            l();
            break;
          case 27:
            g();
            break;
        }
      } else {
        a(
          'press: key = "' +
            s.keyCode +
            '"  char = "' +
            s.charCode +
            '  which = "' +
            s.which +
            '"   text=' +
            o.val()
        );
        if (b.browser.mozilla && s.charCode > 0) {
          h(String.fromCharCode(s.charCode));
        } else {
          if (b.browser.webkit) {
            o.width(o.width() + 15);
          }
        }
        setTimeout(
          (function () {
            return function () {
              h();
            };
          })(),
          0
        );
      }
    }
    function h(s) {
      var t = o.val() + (s === undefined ? "" : s);
      m.text(t);
      if (s != undefined && d.maxInputLength && t.length > d.maxInputLength) {
        return;
      }
      o.width(m.width() + (t.length == 0 ? 1 : j));
    }
    function g() {
      b(c).html(k);
      f();
    }
    function l() {
      var s = o.val();
      if (d.minInputLength > 0 && s.length < d.minInputLength) {
        return;
      }
      b(c).text(s);
      if (d.saveCallback) {
        d.saveCallback(c, s, e);
      }
      f();
    }
    function f() {
      if (d.endEditCallback) {
        d.endEditCallback(c);
      }
      o.detach();
      r.detach();
      b(c).bind(i, n);
    }
  };
  b.fn.inlineEdit = function (c) {
    var e = {};
    var d = {};
    e.debugMode = false;
    e.saveCallback = null;
    e.startEditCallback = null;
    e.endEditCallback = null;
    e.inputClass = "inline-edit-input";
    e.selectTextOnEdit = true;
    e.maxInputLength = 0;
    e.minInputLength = 0;
    var d = b.extend({}, e, c);
    debugMode = d.debugMode;
    this.each(function () {
      new b.inlineEdit(this, d);
    });
    return this;
  };
  function a(c) {
    if (console) {
      window.console = console;
    }
    if (debugMode && window.console && window.console.log) {
      window.console.log("debug: " + c);
    }
  }
})(jQuery);
/*
// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// releated under the MIT license
*/
(function (c) {
  function a(d) {
    if (d.attr("title") || typeof d.attr("original-title") != "string") {
      d.attr("original-title", d.attr("title") || "").removeAttr("title");
    }
  }
  function b(e, d) {
    this.$element = c(e);
    this.options = d;
    this.enabled = true;
    a(this.$element);
  }
  b.prototype = {
    reposition: function (g) {
      var d = true;
      if (g == undefined) {
        g = this.tip();
        d = false;
      }
      var j = c.extend({}, this.$element.offset(), {
        width: this.$element[0].offsetWidth,
        height: this.$element[0].offsetHeight,
      });
      var e = g[0].offsetWidth,
        i = g[0].offsetHeight;
      var h =
        typeof this.options.gravity == "function"
          ? this.options.gravity.call(this.$element[0])
          : this.options.gravity;
      var f;
      switch (h.charAt(0)) {
        case "n":
          f = {
            top: j.top + j.height + this.options.offset,
            left: j.left + j.width / 2 - e / 2,
          };
          break;
        case "s":
          f = {
            top: j.top - i - this.options.offset,
            left: j.left + j.width / 2 - e / 2,
          };
          break;
        case "e":
          f = {
            top: j.top + j.height / 2 - i / 2,
            left: j.left - e - this.options.offset,
          };
          break;
        case "w":
          f = {
            top: j.top + j.height / 2 - i / 2,
            left: j.left + j.width + this.options.offset,
          };
          break;
      }
      if (h.length == 2) {
        if (h.charAt(1) == "w") {
          f.left = j.left + j.width / 2 - 15;
        } else {
          f.left = j.left + j.width / 2 - e + 15;
        }
      }
      g.css(f).addClass("tipsy-" + h);
      if (this.options.fade && d) {
        g.stop()
          .css({ opacity: 0, display: "block", visibility: "visible" })
          .animate({ opacity: this.options.opacity });
      } else {
        g.css({ visibility: "visible", opacity: this.options.opacity });
      }
    },
    show: function () {
      var e = this.getTitle();
      if (e && this.enabled) {
        var d = this.tip();
        d.find(".tipsy-inner")[this.options.html ? "html" : "text"](e);
        d[0].className = "tipsy";
        d.remove()
          .css({ top: 0, left: 0, visibility: "hidden", display: "block" })
          .appendTo(document.body);
        this.reposition(d);
      }
    },
    hide: function () {
      if (this.options.fade) {
        this.tip()
          .stop()
          .fadeOut(function () {
            c(this).remove();
          });
      } else {
        this.tip().remove();
      }
    },
    getTitle: function () {
      var f,
        d = this.$element,
        e = this.options;
      a(d);
      var f,
        e = this.options;
      if (typeof e.title == "string") {
        f = d.attr(e.title == "title" ? "original-title" : e.title);
      } else {
        if (typeof e.title == "function") {
          f = e.title.call(d[0]);
        }
      }
      f = ("" + f).replace(/(^\s*|\s*$)/, "");
      return f || e.fallback;
    },
    tip: function () {
      var d = "";
      if (this.options.customStyle !== false) {
        d = 'style="' + this.options.customStyle + '"';
      }
      if (!this.$tip) {
        this.$tip = c('<div class="tipsy"></div>').html(
          '<div class="tipsy-arrow"></div><div class="tipsy-inner" ' +
            d +
            "/></div>"
        );
      }
      return this.$tip;
    },
    validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide();
        this.$element = null;
        this.options = null;
      }
    },
    enable: function () {
      this.enabled = true;
    },
    disable: function () {
      this.enabled = false;
    },
    toggleEnabled: function () {
      this.enabled = !this.enabled;
    },
  };
  c.fn.tipsy = function (h) {
    if (h === true) {
      return this.data("tipsy");
    } else {
      if (typeof h == "string") {
        var j = this.data("tipsy");
        if (!j) {
          return null;
        }
        return this.data("tipsy")[h]();
      }
    }
    h = c.extend({}, c.fn.tipsy.defaults, h);
    function g(l) {
      var m = c.data(l, "tipsy");
      if (!m) {
        m = new b(l, c.fn.tipsy.elementOptions(l, h));
        c.data(l, "tipsy", m);
      }
      return m;
    }
    function k() {
      var l = g(this);
      l.hoverState = "in";
      if (h.delayIn == 0) {
        l.show();
      } else {
        setTimeout(function () {
          if (l.hoverState == "in") {
            l.show();
          }
        }, h.delayIn);
      }
    }
    function f() {
      var l = g(this);
      l.hoverState = "out";
      if (h.delayOut == 0) {
        l.hide();
      } else {
        setTimeout(function () {
          if (l.hoverState == "out") {
            l.hide();
          }
        }, h.delayOut);
      }
    }
    if (!h.live) {
      this.each(function () {
        g(this);
      });
    }
    if (h.trigger != "manual") {
      var d = h.live ? "live" : "bind",
        i = h.trigger == "hover" ? "mouseenter" : "focus",
        e = h.trigger == "hover" ? "mouseleave" : "blur";
      this[d](i, k)[d](e, f);
    }
    return this;
  };
  c.fn.tipsy.defaults = {
    delayIn: 0,
    delayOut: 0,
    fade: false,
    fallback: "",
    gravity: "n",
    html: false,
    live: false,
    offset: 0,
    opacity: 0.8,
    title: "title",
    customStyle: false,
    trigger: "hover",
  };
  c.fn.tipsy.elementOptions = function (e, d) {
    return c.metadata ? c.extend({}, d, c(e).metadata()) : d;
  };
  c.fn.tipsy.autoNS = function () {
    return c(this).offset().top >
      c(document).scrollTop() + c(window).height() / 2
      ? "s"
      : "n";
  };
  c.fn.tipsy.autoWE = function () {
    return c(this).offset().left >
      c(document).scrollLeft() + c(window).width() / 2
      ? "e"
      : "w";
  };
})(jQuery);
(function () {
  function b(g) {
    var f = document.createElement("textarea");
    f.value = g;
    document.body.appendChild(f);
    f.focus();
    f.select();
    try {
      var h = document.execCommand("copy");
      var e = h ? "successful" : "unsuccessful";
      console.log("Fallback: Copying text command was " + e);
    } catch (d) {
      console.error("Fallback: Oops, unable to copy", d);
    }
    document.body.removeChild(f);
  }
  function a(d) {
    if (!navigator.clipboard) {
      b(d);
      return;
    }
    navigator.clipboard.writeText(d).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (e) {
        console.error("Async: Could not copy text: ", e);
      }
    );
  }
  window.copyTextToClipboard = a;
  $(".share_buttons a.bttn").live("mousedown", function () {
    var d = $(this);
    d.attr("style", "padding-top: 2px");
    setTimeout(
      (function (e) {
        return function () {
          e.removeAttr("style");
        };
      })(d),
      150
    );
  });
  $("a.sharing-bttn").live("mousedown", function (f) {
    var d = $(f.currentTarget).find(".bttn");
    window.clientEvent("share:" + d[0].id);
    if (d[0].id == "sb_copy") {
      window.copyTextToClipboard(window.clipText);
    }
  });
  $(".tooltip-inactive-tz, .explain-inactive-tz").tipsy({
    gravity: "sw",
    opacity: 1,
    html: true,
    offset: 4,
    title: function () {
      _gaq.push([
        "_trackEvent",
        "Location Management",
        "Explain Inactive TZ",
        getPageLabel(),
      ]);
      return $(this).attr("original-title");
    },
  });
  $(".inactive-timezone-part").tipsy({
    gravity: "sw",
    opacity: 1,
    html: true,
    offset: 4,
  });
  $(".icon").tipsy({ gravity: "sw", opacity: 1, html: true });
  $(".city small").tipsy({ gravity: "sw", opacity: 1, html: true });
  $("#plans .features li b").tipsy({
    gravity: "s",
    opacity: 1,
    offset: 1,
    html: true,
    fade: true,
    customStyle:
      "max-width: 315px; padding: 10px; font-size: 11px; text-align: left",
  });
  $(".band_options [title]").tipsy({ gravity: "s", opacity: 1 });
  $(".twb").tipsy({ gravity: "s", opacity: 1 });
  $("#bttn-why-overwrite").tipsy({
    gravity: "s",
    opacity: 1,
    offset: 2,
    fade: true,
    html: true,
  });
  $(".new-location").tipsy({ gravity: "s", opacity: 1 });
  $(".date-jump").tipsy({ gravity: "s", opacity: 1, offset: 0 });
  $(".subscribe").tipsy({ gravity: "s", opacity: 1 });
  $(".plan[title]").tipsy({
    gravity: "s",
    opacity: 1,
    offset: 10,
    fade: false,
    html: true,
    trigger: "manual",
  });
  $(".cband")
    .eq(0)
    .tipsy({
      gravity: "s",
      opacity: 1,
      offset: 5,
      fade: true,
      html: true,
      trigger: "manual",
    });
  $(".bttn-explicit-link").click(function () {
    $("div", this).tipsy("show");
  });
  var c = {
    fade: true,
    gravity: "se",
    opacity: 1,
    html: true,
    trigger: "manual",
    offset: 9,
    customStyle: "max-width: 100%",
    title: function () {
      var d = location_list_for_export();
      var e = encodeURI(
        "http://" + window.location.host + "/?lid=" + d.lids + "&h=" + d.home
      );
      var f =
        '<div id="explicit-link-text" style="padding: 2px 0">' +
        e +
        '</div><script>setTimeout(function() { selectText("explicit-link-text"); }, 100)</script>';
      return f;
    },
  };
  $(".bttn-explicit-link div").tipsy(c);
  $(".band").tipsy({
    fade: true,
    gravity: window.embedded_script
      ? function () {
          var e = $(".band").data("vars");
          var d = (e.startIndex + e.endIndex) / 2;
          return d > 21 ? "se" : "s";
        }
      : "s",
    opacity: 1,
    html: true,
    trigger: "manual",
    offset: 2,
    title: function () {
      var m = '<div id="share_bttn_help" style="display: none;"></div>';
      var k = get_sharing_options();
      var d = k[0];
      var h = k[1];
      var o = k[2];
      if (!window.scheduling_widget) {
        m +=
          '<div class="share_buttons" onmouseover="share_options_help(true, \'&nbsp;\')" onmouseout="share_options_help(false, \'&nbsp;\')">';
        if (window.event_script) {
          m +=
            '<a style="display: inline-block; color: #ccc; height: 16px; padding: 2px 5px; background: transparent; width: auto; vertical-align:top" onmouseover="share_options_help(\'\')">Add to</a>';
        }
        $.each(d, function (q, r) {
          if (r.type && r.type == "splitter") {
            m +=
              '<span style="display: inline-block; width: 0px; height: 15px; margin: 0px 5px 6px 5px; border-left: 1px dotted #606060 " onmouseover="share_options_help(\'\')"></span>';
          } else {
            m +=
              '<a id="sb_' +
              r.className +
              '" class="bttn" href="' +
              r.link +
              '" onmouseover="share_options_help(\'' +
              r.title +
              '\')" target="' +
              r.target +
              "\" onmousedown=\"_gaq.push(['_trackEvent','Scheduling', 'Share', '" +
              r.className +
              "'])\"></a>";
          }
        });
        m += "</div>";
      }
      if (window.time_script) {
        var g = h.startDate.toWTBDate(h.ampmMode, "|").split("|", 1);
        var n = h.endDate.toWTBDate(h.ampmMode, "|").split("|", 1);
        if ((window.scheduling_widget || window.embedded_script) && XD) {
          var p = { action: "select", locations: [] };
          for (var j = 0; j < o.length; j++) {
            var f = o[j].startDate.toWTBDate(o[j].ampmMode, "|").split("|");
            var e = o[j].endDate.toWTBDate(o[j].ampmMode, "|").split("|");
            var l = {
              location: o[j].location,
              start_time: f[0],
              start_date: f[1],
              end_time: e[0],
              end_date: e[1],
              end_data: e[1],
            };
            p.locations.push(l);
          }
          message_str = JSON.stringify(p);
          XD.postMessage(message_str, "*", window.parent);
        }
        use_shifters = true;
        left_shifter = use_shifters
          ? '<td class="mt-shifter mt-left"><a class="mt-dec"></a><a class="mt-inc"></a></td>'
          : "";
        right_shifter = use_shifters
          ? '<td class="mt-shifter mt-right"><a class="mt-dec"></a><a class="mt-inc"></a></td>'
          : "";
        m +=
          '<table id="meeting_time" cellspacing="0" cellpadding="0"><tr>' +
          left_shifter +
          '<td class="mt-time">' +
          g +
          " - " +
          n +
          "</td>" +
          right_shifter +
          "</tr></table>";
      }
      if (window.scheduling_widget) {
        m = "";
      }
      return m;
    },
  });
  $(window).bind("resize.tispy", function () {
    if ($(".tipsy").length) {
      $(".band").tipsy("reposition");
      $.each($("[original-title]:visible"), function () {
        $(this).tipsy("reposition");
      });
    }
  });
})();
function updateMeetingSelection() {
  var d = get_sharing_options();
  var c = d[0];
  var e = d[1];
  $.each(c, function (f, g) {
    $("#sb_" + g.className).attr("href", g.link);
  });
  var b = e.startDate.toWTBDate(e.ampmMode, "|").split("|", 1);
  var a = e.endDate.toWTBDate(e.ampmMode, "|").split("|", 1);
  $(".mt-time").text(b + " - " + a);
}
function share_options_help(e) {
  var g = $("#share_bttn_help");
  var b = g.closest(".tipsy");
  var f = b.offset();
  var c = g.is(":visible");
  if (e == true && !c) {
    var d = $(window).height() - b.outerHeight() - f.top;
    b.data("orig-top", f.top);
    b.css({ top: "auto", bottom: d });
    g.show();
  } else {
    if (e == false && c) {
      var a = b.data("orig-top");
      b.css({ top: a, bottom: "auto" });
      g.hide();
    } else {
      if (typeof e == "string") {
        g.text(e);
      }
    }
  }
}
function get_sharing_options() {
  var b = [];
  var u = get_hourline_selection();
  var d = location_list_for_export();
  var h = Math.round(u.startIndex * 100) / 100;
  var g = Math.round(u.endIndex * 100) / 100;
  if (window.time_script) {
    var j =
      "event?lid=" +
      d.lids +
      "&h=" +
      d.home +
      "&sts=" +
      sts +
      "&sln=" +
      (h + "-" + g) +
      "&a=preview";
    var r =
      "event_widget_preview?lid=" +
      d.home +
      "&h=" +
      d.home +
      "&sts=" +
      sts +
      "&sln=" +
      (h + "-" + g);
    if (window.cnum) {
      j += "&c=" + window.cnum;
      r += "&c=" + window.cnum;
    }
    u.meetingText += "\n\rScheduled with www.worldtimebuddy.com\n";
    window.clipText = u.meetingText.replace(/([^\r])?\n/g, "$1\r\n");
    var a = {
      className: "gmail",
      link:
        "https://mail.google.com/mail/?view=cm&fs=1&to=&su=Let's Meet&body=" +
        encodeURIComponent(u.meetingText) +
        "&ui=2&tf=1&shva=1",
      title: "Gmail",
      target: "_blank",
    };
  }
  var m = 1276;
  var s = 111;
  var p = window.time_script ? "Let's Meet" : $("#event-title").val();
  var l = window.time_script ? u.meetingText : $("#event-details").val();
  var k = "http://www.google.com/calendar/event?action=TEMPLATE";
  var e = k.length + p.length + l.length - (m - s);
  if (e > 0) {
    l = l.substring(0, l.length - (e + 6)) + "\n...";
  }
  var f = {
    className: "gcal",
    link:
      k +
      "&text=" +
      encodeURIComponent(p) +
      "&dates=" +
      u.home.startDateUtc.toISO() +
      "Z/" +
      u.home.endDateUtc.toISO() +
      "Z&details=" +
      encodeURIComponent(l) +
      "&location=&trp=true",
    title: "Google Calendar",
    target: "_blank",
  };
  var o = {
    className: "ical",
    link:
      "helper/ics?start=" +
      u.home.startDateUtc.toISO() +
      "Z&end=" +
      u.home.endDateUtc.toISO() +
      "Z" +
      (window.event_script
        ? "&subject=" + encodeURIComponent($("#event-title").val())
        : "") +
      "&details=" +
      (window.time_script
        ? encodeURIComponent(u.meetingText)
        : encodeURIComponent($("#event-details").val())),
    title: "Outlook / iCal",
    target: "_self",
  };
  if (window.time_script) {
    var c = {
      className: "copy",
      link: "javascript:void(0)",
      title: "Copy to Clipboard",
      target: "",
    };
    var n = { type: "splitter" };
    var t = {
      className: "link",
      link: j,
      title: "Create Meeting Page",
      target: "_blank",
    };
  }
  var b = [a, f, o, c, n, t];
  for (var q = b.length; q >= 0; q--) {
    if (b[q] == undefined) {
      b.splice(q, 1);
    }
  }
  return [b, u.home, u.ranges];
}
function utcDateFromIndex(a) {
  $delta = Math.round(a * 60);
  $ts = (window.sts + $delta) * 60000;
  return new Date($ts);
}
function dateFromIndex(e, h) {
  var g = Math.floor(e);
  var d = Math.round(e);
  if (Math.abs(d - e) < 0.0001) {
    g = d;
  }
  var a = g;
  var b = h.find("li:eq(" + a + ")").attr("t");
  var c = new Date(Date.parse(b + " GMT"));
  var f = e - a;
  if (f != 0) {
    c.setTime(c.getTime() + Math.round(f * 60) * 60000);
  }
  return c;
}
function get_hourline_selection() {
  var f, b, e;
  var k, g, c;
  var a = $(".band").data("vars");
  var h = {
    ranges: [],
    endIndex: window.event_script
      ? window.meeting_range.endIndexOrig
      : a.endIndex,
    startIndex: window.event_script
      ? window.meeting_range.startIndexOrig
      : a.startIndex,
    meetingText: "\n\n",
  };
  g = $(".container");
  $cities = $(".city").find("b");
  $countries = $(".country");
  for (var d = 0; d < g.length; d++) {
    k = g.eq(d);
    c = originalLocationIndex(k);
    e = {
      startDateUtc: utcDateFromIndex(h.startIndex),
      startDate: dateFromIndex(h.startIndex, k),
      endDateUtc: utcDateFromIndex(h.endIndex),
      endDate: dateFromIndex(h.endIndex, k),
      index: c,
      location:
        $cities.eq(d).text().toUpperCase() + ", " + $countries.eq(d).text(),
    };
    h.ranges.push(e);
    var j = ampmMode;
    if (j == 2) {
      j = locations[c].ampm_mode;
    }
    e.ampmMode = j;
    if (locations[c].is_home) {
      h.home = e;
    }
    if (window.time_script) {
      h.meetingText +=
        "" +
        e.location +
        "\n" +
        e.startDate.toWTBDate(j, "\t") +
        "\n" +
        e.endDate.toWTBDate(j, "\t") +
        "\n\n";
    }
  }
  return h;
}
var XD = (function () {
  cache_bust = 1;
  return {
    postMessage: function (a, c, b) {
      if (!c) {
        return;
      }
      b = b || parent;
      if (window.postMessage) {
        b.postMessage(a, c.replace(/([^:]+:\/\/[^\/]+).*/, "$1"));
      } else {
        if (c) {
          if (c == "*") {
            c = window.widget_parent_url;
          }
          b.location =
            c.replace(/#.*$/, "") + "#" + +new Date() + cache_bust++ + "&" + a;
        }
      }
    },
  };
})();
(function () {
  String.prototype.pad = function (c, a) {
    var b = this.toString();
    while (b.length < c) {
      b = a + b;
    }
    return b;
  };
  Date.prototype.toUTCArray = function () {
    var a = this;
    return [
      a.getUTCFullYear(),
      a.getUTCMonth(),
      a.getUTCDate(),
      a.getUTCHours(),
      a.getUTCMinutes(),
      a.getUTCSeconds(),
    ];
  };
  Date.prototype.toISO = function (e, c) {
    var b,
      a = this.toUTCArray(),
      d = 0;
    a[1] += 1;
    while (d++ < 7) {
      b = a[d];
      if (b < 10) {
        a[d] = "0" + b;
      }
    }
    if (e == undefined) {
      e = "";
    }
    if (c == undefined) {
      c = "";
    }
    return a.splice(0, 3).join(e) + "T" + a.join(c);
  };
  Date.prototype.toWTBDate = function (h, k) {
    var f = this;
    var i = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][f.getUTCDay()];
    var c = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][f.getUTCMonth()];
    var a = f.getUTCDate();
    var g = f.getUTCFullYear();
    var j = f.getUTCHours();
    var b = f.getUTCMinutes().toString().pad(2, "0");
    var e = h ? (j > 11 ? "p" : "a") : "";
    if (h) {
      j = j > 12 ? j % 12 : j;
      j = j == 0 ? 12 : j;
    } else {
      j = j.toString().pad(2, "0");
    }
    if (k == undefined) {
      k = " ";
    }
    if (typeof k == "object") {
      return {
        hours: j,
        minutes: b,
        dayOfWeek: i,
        month: c,
        date: a,
        year: g,
        ampm: e,
      };
    }
    return j + ":" + b + e + k + i + ", " + c + " " + a + " " + g;
  };
})();
(function () {
  if (!window._gaq) {
    window._gaq = [];
    setInterval(function () {
      window._qag = [];
    }, 1000 * 60);
  }
  var af = false;
  var ae = null;
  var Y = 0;
  var C = null;
  var a = null;
  var E = null;
  var L = null;
  var X = null;
  var l = null;
  var aa = false;
  var J = false;
  var O = $("#defaultText");
  var j = $("#searchIcon");
  var V = $("#inputIcon");
  var D = $("#location");
  var G = $(".dst_note");
  var u = $("#locations");
  var o = $(".datepicker_revert").length > 0;
  window.dateModeOn = o;
  window.locationRows = $(".container");
  window.hoursPerActiveRegion = 0.5;
  window.hoursPerActiveRegion = 0.08333333333333333;
  window.minSelection = 0.5;
  window.originalMeetingMode = false;
  var c = false;
  var e = 0.08333;
  window.scriptDate = new Date();
  var b = $(".tzdb-date-out-of-bounds-warning");
  if (b.length > 0) {
    _gaq.push(["_trackEvent", "Misc", "tzdbDateOutOfRangeWarning"]);
  }
  var h = $(".band");
  var z = $(".cband");
  var K = $("#glass");
  var y = $("#band-whiteout-left");
  var s = $("#band-whiteout-right");
  var r = $(".clientarea");
  if ($.browser.msie) {
    $("body").addClass("ie");
  }
  var d = function (aj, ah) {
    var ai = $("#home").closest(".container");
    var am = $(".container");
    var al = am.index(ai);
    if (aj == undefined) {
      aj = "bottom";
    }
    if (ah == undefined) {
      ah = true;
    }
    var ag = 0;
    if (aj == "top") {
      ag = ai.outerHeight(true) * al + 2;
    }
    if (aj == "bottom") {
      ag = ai.outerHeight(true) * (am.length - al - 1) + 2;
    }
    var ak = {};
    ak[aj] = ag;
    h.find(".homeHour")
      .css(aj == "top" ? "bottom" : "top", "auto")
      [ah ? "animate" : "css"](ak);
  };
  window.updateHomeHour = d;
  updateLinkToPage();
  clientEvent = function (ai, ah) {
    var ag =
      !window.time_script ||
      (!window.loggedIn && ah != "applyWithReload") ||
      window.quickmeeting;
    if (ag) {
      return;
    }
    if (!window.clientEventSeq) {
      window.clientEventSeq = 0;
    }
    if (ah == undefined || ah == "pingback") {
      Input.set(
        "action",
        ai + "___" + window.clientEventSeq++ + "___" + window.pageInstance
      );
      Input.applyWithPingback(window.loggedIn, true);
    } else {
      if (ah == "apply") {
        Input.set("action", ai);
        Input.apply();
      } else {
        if (ah == "applyWithReload") {
          Input.set("action", ai);
          Input.apply(true);
          return;
        }
      }
    }
    Input.set("action", null);
    Input.apply();
  };
  window.clientEvent = clientEvent;
  function Z() {
    return (
      $(".clientarea").outerWidth() -
      (K.position().left + window.locationRows.eq(0).find(".hourline").width())
    );
  }
  function W(ag, aj, ai) {
    ai = ai || {};
    if (aj == null) {
      aj = 0;
      z.width(0).css("border", 0);
    }
    var ah = {
      screenSelector: ".clientarea",
      columns: 24,
      activeRegionsPerColumn: 12,
      onColumnChange: ac,
      onMouseDown: M,
      onMouseUp: S,
      adjust: {
        top: 0,
        left: $(".hourline").position().left,
        right: Z,
        bottom: 0,
      },
    };
    ah = $.extend(ah, ai);
    K.glassify(ah);
    h.data("vars", {
      mode: 1,
      defaultIndex: ag,
      adjust: { top: 11, left: -1, right: -2, bottom: 11 },
    });
    z.data("vars", {
      mode: 1,
      defaultIndex: aj,
      adjust: { top: 14, left: 2, right: 1, bottom: 14 },
    });
    y.data("vars", {
      mode: 1,
      defaultIndex: 0,
      adjust: { top: 14, left: 0, right: 2, bottom: 11 },
    });
    s.data("vars", {
      mode: 1,
      defaultIndex: 0,
      adjust: { top: 14, left: 1, right: 1, bottom: 11 },
    });
  }
  window.init_search = function (ag, ai, ah) {
    if (ag == undefined) {
      ag = "Place or timezone";
    }
    if (ai == undefined) {
      ai = function (aj) {
        ChangeLocation(aj);
      };
    }
    if (ah == undefined) {
      ah = true;
    }
    $("#location").suggest("/helper/locations", {
      onHasText: Q,
      notFoundMessage:
        '<li style="font-style: italic"><span class="ac_match">No matches found.</span> <span class="ac_pre">Try shortening or changing the query.</span></li>',
      onSelect: function (aj) {
        if (H) {
          H.pick();
        }
        ai(aj);
        $("#location").val("");
        Q(0);
      },
      progressHandler: function (aj) {
        if (aj != "done") {
          if (ae) {
            clearInterval(ae);
          }
          D.addClass("inProgress");
          ae = setInterval(function () {
            var ak = Y + "px";
            D.css("backgroundPosition", ak + " -314px");
            Y = (Y + 2) % 18;
          }, 30);
        } else {
          if (ae) {
            clearInterval(ae);
          }
          D.removeClass("inProgress");
        }
      },
      delay: 130,
      maxDisplayItems: 7,
      minchars: 1,
    });
    $("#defaultText").text(ag);
    $("#location")
      .removeAttr("readonly")
      .focus(function () {
        if (H) {
          H.focus();
        }
      })
      .blur(function () {
        if (H) {
          H.blur();
        }
      });
    if (ah == true) {
      $("#location").focus();
    }
  };
  if (window.event_script) {
    window.locationRows = $(".container");
    window.init_event = function () {
      window.locationRows = $(".container");
      var ag = { onColumnChange: null, onMouseDown: null, onMouseUp: null };
      W(x, P, ag);
      h.show();
      g(h, window.meeting_range.startIndex, window.meeting_range.endIndex);
      w(h, 3);
      $(window).resize();
    };
    $(window).resize(function () {
      K.resize();
      ad = h.data("vars");
      g(h, ad.startIndex, ad.endIndex);
      if (ad.mode == 3) {
        var ag = y.data("vars");
        var ah = s.data("vars");
        g(y, ag.startIndex, ag.endIndex);
        g(s, ah.startIndex, ah.endIndex);
      }
    });
  }
  if (!window.time_script) {
    return;
  }
  var q = function (ai) {
    ai.preventDefault();
    var ah = $(this).parent().hasClass("mt-right") ? "end" : "start";
    var ag = $(this).hasClass("mt-dec") ? -e : e;
    k(ah, ag);
    _gaq.push(["_trackEvent", "Scheduling", "Adjust Range"]);
  };
  var v = $(".mt-shifter a").live("mousedown", q);
  if ($.browser.msie) {
    v.live("dblclick", q);
  }
  function k(al, an) {
    var am = h.data("vars");
    var ak = al == "start" ? an : 0;
    var ai = al == "end" ? an : 0;
    var aj = round2(am.startIndex + ak, 5);
    var ag = round2(am.endIndex + ai, 5);
    var ah = false;
    ah = Math.abs(aj - round2(aj, 0)) < 0.0001;
    if (al == "start" && ah) {
      aj = Math.round(aj);
    }
    ah = Math.abs(ag - round2(ag, 0)) < 0.0001;
    if (al == "end" && ah) {
      ag = Math.round(ag);
    }
    if (Math.abs(aj - ag) < 0.001 || aj < 0 || ag > 24) {
      return false;
    } else {
      g(h, aj, ag);
      A(h, "disable");
      updateMeetingSelection();
      return true;
    }
  }
  var U = function (an) {
    if (an == undefined) {
      an = true;
    }
    var ak = $("body");
    var am = $(".wrapper");
    var al = $("#locations");
    var ah = al.width();
    var ap = al.height();
    var aj = al.position();
    var ai = $(".toolbar").outerHeight();
    var ag = $(
      ".buttons, #logo, #social, #location_tabs, .topline, #feedback-bttn"
    );
    Input.set("fullscreen", Input.get("current_tab"));
    function ao(ar) {
      ag.hide();
      $('<div id="bttn-exit-fullscreen" class="rounded3">Exit Fullscreen</div>')
        .appendTo("body")
        .mousedown(function (at) {
          at.preventDefault();
          _gaq.push(["_trackEvent", "Misc", "Fullscreen", "Off"]);
          Input.set("fullscreen", null);
          $(".toolbar").removeAttr("style");
          ag.removeAttr("style").show();
          al.removeAttr("style");
          $(window).unbind("resize.fullscreen");
          N();
          setTimeout(function () {
            $("#bttn-exit-fullscreen").remove();
          }, 0);
        });
      al.width(ah)
        .height(ap)
        .css({
          position: "absolute",
          marginTop: 0,
          marginBottom: 0,
          top: aj.top,
        });
      function aq(av) {
        var aw = (ak.width() - ah) / 2;
        var au = (ak.height() - ap - ai) / 2;
        var ax = al.offset();
        var at = { top: au, height: ap - ai };
        if (av == true) {
          al.animate(at, {
            speed: 300,
            easing: "linear",
            complete: N,
            queue: false,
          });
          $(".toolbar").slideUp(200);
        } else {
          al.css(at);
          $(".toolbar").hide();
          N();
        }
      }
      $(window).bind("resize.fullscreen", aq);
      aq(ar);
    }
    if (an == true) {
      $.each(ag, function (aq) {
        var ar = $(this);
        ar.animate(
          { opacity: 0 },
          {
            speed: 400,
            easing: "linear",
            queue: false,
            complete:
              aq == 0
                ? function () {
                    ao(true);
                  }
                : null,
          }
        );
      });
    } else {
      ag.hide();
      ao();
    }
  };
  $("#bttn-temp-hide-note").mousedown(function (ah) {
    ah.preventDefault();
    var ag = $(this).attr("ncode");
    if (ag.length == 0) {
      _gaq.push(["_trackEvent", "Misc", "Hide Exiration Note"]);
      clientEvent("hide-note: exp");
      setCookie("tnd", 1, 5);
    } else {
      if (ag.substring(0, 3) == "PCN") {
        setCookie("tn", ag, 30);
        _gaq.push(["_trackEvent", "Misc", "Hide Plan Change Note", ag]);
      } else {
        _gaq.push(["_trackEvent", "Misc", "Hide End-of-Plan Note"]);
        clientEvent("hide-note:" + ag);
      }
    }
    $(this).closest(".note").slideUp("fast");
    $(window).resize();
  });
  $("#bttn-undo-link, #bttn-hide-note").mousedown(function (ag) {
    ag.preventDefault();
    var ah = { "bttn-undo-link": "Undo", "bttn-hide-note": "Hide" };
    _gaq.push(["_trackEvent", "Misc", "Location Overwrite", ah[this.id]]);
    if (this.id == "bttn-undo-link") {
      navigateTo(window.undo_url);
    } else {
      $(this).closest(".note").slideUp("fast");
      $(window).resize();
    }
  });
  $(".revert-wrapper").mousedown(function (ag) {
    ag.preventDefault();
    Input.set("chosen_date", null);
    Input.apply(true);
  });
  $(".date-jump-txt, #quick-next-day").mousedown(function (al) {
    al.preventDefault();
    var am = this.id == "quick-next-day";
    var ak = parseInt($(".current-cell").attr("idx"));
    var ah = parseInt(am ? ak + 1 : $(this).parent().attr("idx"));
    var ar = ah - ak;
    var aq = null;
    for (var aj = 0; aj < window.locations.length; aj++) {
      if (window.locations[aj].is_home == 1) {
        aq = window.locations[aj].date;
      }
    }
    var ag = parseDateTime(aq, "01:10:00");
    var ap = new Date();
    var ao = ag.getTime() + ar * (3600 * 1000 * 24);
    ap.setTime(ao);
    if (ah >= $(".date-jump-txt").length) {
      ah = 3;
    }
    var ai =
      ap.getMonth() +
      1 +
      "/" +
      ap.getDate() +
      "/" +
      ap.getFullYear() +
      "|" +
      ah;
    var an = am ? "Quick Next" : "Jump";
    _gaq.push([
      "_trackEvent",
      "Calendar",
      an,
      (o ? "Custom" : "Default") + " " + ar,
    ]);
    Input.set("chosen_date", ai);
    Input.apply(true);
  });
  $(".dropdown").click(function () {
    $(this).hover();
  });
  $(".loc-tab:not([class~=active]) .loc-tab-open").mousedown(function (ah) {
    _gaq.push(["_trackEvent", "Tab Management", "Switch Tab"]);
    ah.preventDefault();
    var ag = $(this).parent().attr("tab-id");
    Input.set("locations", null);
    Input.set("home", null);
    Input.set("current_tab", ag);
    Input.apply(true);
  });
  $(".loc-tab-close[href]").mousedown(function () {
    _gaq.push(["_trackEvent", "Tab Management", "Close Tab"]);
  });
  $(".loc-tab-add").mousedown(function () {
    _gaq.push(["_trackEvent", "Tab Management", "Add Tab"]);
  });
  $("#bttn-wknd-switch").mousedown(function (ai) {
    var ah = $(this);
    var ag = parseInt(Input.get("weekends_mode")) || 0;
    ai.preventDefault();
    _gaq.push([
      "_trackEvent",
      "Settings",
      "Weekends Mode",
      ag > 0 ? "OFF" : "ON",
    ]);
    ag = (ag + 1) % 2;
    if (ag) {
      ah.addClass("setting-on");
      r.addClass("weekends-mode");
    } else {
      ah.removeClass("setting-on");
      r.removeClass("weekends-mode");
    }
    Input.set("weekends_mode", ag);
    Input.applyWithPingback(window.loggedIn);
  });
  $("#bttn-tz-switch").mousedown(function (aj) {
    var ai = $(this);
    var ah = $(".city small");
    var ag = parseInt(Input.get("tznames_mode")) || 0;
    aj.preventDefault();
    _gaq.push([
      "_trackEvent",
      "Settings",
      "Timezone Names",
      ag > 0 ? "OFF" : "ON",
    ]);
    ag = (ag + 1) % 2;
    if (ag) {
      ai.addClass("setting-on");
      ah.show();
    } else {
      ai.removeClass("setting-on");
      ah.hide();
    }
    Input.set("tznames_mode", ag);
    Input.applyWithPingback(window.loggedIn);
  });
  $(".lane-desc").live("click", function (ah) {
    var ag = $(ah.target);
    ag.closest("li").toggleClass("enlarged");
  });
  function I() {
    var ah = ["forex", "gcal"];
    var ag = "_mode";
    var ai = 0;
    ah.forEach(function (aj) {
      ai = Input.get(aj + ag);
      ai = ai !== undefined ? parseInt(ai) : 0;
      F(aj, ai);
    });
  }
  function F(aq, ak) {
    if ($("#schedules").hasClass("restricted")) {
      return;
    }
    var ai = ["forex", "gcal", "olympics"];
    if (ai.indexOf(aq) < 0) {
      throw new Error("Trying to toggle unsupported calendar: " + aq);
    }
    if ([undefined, 1, 0].indexOf(ak) < 0) {
      throw new Error(
        "Cannot toggle calendar to unsupported targetSetting: ",
        ak
      );
    }
    var ag = $("#bttn-" + aq + "-switch");
    var av = aq;
    var au = (au = parseInt(Input.get(av + "_mode")) || 0);
    var ap = (au + 1) % 2;
    var aj = $('.schedule[tag="' + av + '"]');
    var at = aj.length > 0 && !aj.hasClass("loading");
    var ao = aj.attr("cid");
    var an = av.charAt(0).toUpperCase() + av.slice(1);
    _gaq.push(["_trackEvent", "Settings", an, au > 0 ? "OFF" : "ON"]);
    au = ak === undefined ? ap : ak;
    if (au) {
      av == "olympics"
        ? ag.addClass("bttn-pressed").removeClass("bttn-normal")
        : ag.addClass("setting-on");
      if (at) {
        aj.show();
      } else {
        var ar = $("#home").closest(".container");
        var ah = ar.attr("orig-lid");
        if (!ah) {
          ah = ar.attr("lid");
        }
        var al = ($('.schedule[tag="' + av + '"]').length > 0) | 0;
        $loading = aj;
        var am = { sts: window.sts, h: ah, eo: al, r: Math.random() };
        $.get(
          "helper/" + av + "_schedule/",
          am,
          (function (aw, ax) {
            return function (aA, ay) {
              var az = $(aA);
              ax.eq(0).after(az);
              ax.remove();
              aj.removeClass("loading");
            };
          })(av, $loading)
        );
      }
    } else {
      av == "olympics"
        ? ag.removeClass("bttn-pressed").addClass("bttn-normal")
        : ag.removeClass("setting-on");
      aj.hide();
    }
    Input.set(av + "_mode", au);
    Input.applyWithPingback(window.loggedIn);
    updateLinkToPage();
  }
  $("#bttn-cal-settings").bind("mousedown", function (ag) {
    ag.preventDefault();
    CalendarSettings.open();
  });
  $(".sort-up").mousedown(function () {
    _gaq.push(["_trackEvent", "Location Management", "Sort", "Up"]);
    n(1);
  });
  $(".sort-down").mousedown(function () {
    _gaq.push(["_trackEvent", "Location Management", "Sort", "Down"]);
    n(-1);
  });
  function n(ak) {
    var aj = [];
    var ai = window.locationRows;
    var ag = containerLocationIds();
    ai.sort(function (an, am) {
      var ap = parseFloat($(".icon > span", an).text());
      var ao = parseFloat($(".icon > span", am).text());
      return (ap - ao) * ak;
    });
    r.append(ai);
    window.locationRows = ai;
    for (var ah = 0; ah < ai.length; ah++) {
      var al = ai.eq(ah);
      aj.push(al.attr("lid"));
      al.attr("data-itemidx", ah);
    }
    d();
    if (ag.join(",") != aj.join(",")) {
      Input.set("locations", aj.join(","));
      Input.applyWithPingback(window.loggedIn);
    }
  }
  $(".bttn-explicit-link").mousedown(function () {
    _gaq.push(["_trackEvent", "Misc", "Get Link", "Open"]);
  });
  $("#b_cws").mousedown(function () {
    _gaq.push(["_trackEvent", "Misc", "Chrome Webstore Link"]);
  });
  $("#b_twb").mousedown(function () {
    _gaq.push(["_trackEvent", "Misc", "Twitter Link"]);
  });
  $(".tabs li.hformat a[href]").mousedown(function () {
    var ag = { st24: "24", stAM: "AMP/PM", stMX: "Mixed" };
    _gaq.push(["_trackEvent", "Settings", "Hour Format", ag[this.id]]);
    if (Input.source == "cookie" && Input.get("chosen_date", null) != null) {
      Input.apply();
    }
  });
  $(".makeHome").mousedown(function () {
    _gaq.push(["_trackEvent", "Location Management", "Make Home"]);
    var ah = $(this).closest(".container");
    var ag = "h=" + ah.attr("lid");
    navigateTo(ag);
  });
  $(".action-replace-location")
    .mousedown(function () {
      _gaq.push([
        "_trackEvent",
        "Location Management",
        "Replace Inactive TZ",
        getPageLabel(),
      ]);
    })
    .click(function () {
      var ai = $(this).closest(".container");
      var ah = parseInt(ai.attr("data-itemidx"));
      var ag = containerLocationIds("array");
      ag[ah] = $(this).attr("data-location-id");
      Input.set("locations", ag.join(","));
      Input.apply(true);
      return false;
    });
  $(".close").mousedown(function (aj) {
    aj.preventDefault();
    aj.stopPropagation();
    if (window.actionInProgress) {
      return;
    }
    window.actionInProgress = true;
    _gaq.push(["_trackEvent", "Location Management", "Delete"]);
    var ai = $(".container");
    var ao = $(this).closest(".container");
    var am = ai.index(ao) < ai.index($("#home").closest(".container"));
    $(this).unbind("mousedown");
    function ah(aw) {
      var ar = [];
      var av = originalLocationIndex(aw);
      i.deleteLocationAtIndex(av);
      window.locationRows = window.locationRows.not(":eq(" + av + ")");
      window.locations.splice(av, 1);
      var au = $(".container");
      for (var at = 0; at < au.length; at++) {
        if (au.eq(at)[0] != aw[0]) {
          ar.push(au.eq(at).attr("lid"));
        }
      }
      aw.remove();
      K.trigger("resize");
      $(window).trigger("resize");
      var au = $(".container");
      if (au.length == 1) {
        $(".close", au).remove();
      }
      if (window.embedded_script) {
        sendDocHeight();
      }
      if (!$("#home", aw).length > 0) {
        Input.set("locations", ar.join(","));
        Input.applyWithPingback(window.loggedIn);
      }
      updateLinkToPage();
      window.actionInProgress = false;
    }
    if (
      $("#home", ao).length > 0 &&
      window.locationRows.find("#home").length == 1
    ) {
      var an = containerLocationIds("string", ao);
      Input.set("locations", an);
      Input.apply(true);
    }
    d(am ? "bottom" : "top", false);
    var ak = $('<div class="container"></div>').insertAfter(ao);
    var ag = 300;
    var aq = ao.outerHeight();
    var ap = -aq;
    var al = ag;
    ao.css({ position: "absolute", "z-index": 400 });
    ao.animate(
      { opacity: 0 },
      { duration: al / 1.4, easing: "linear", queue: false }
    );
    ak.animate(
      { height: 0, paddingTop: 0, paddingBottom: 0 },
      {
        duration: ag,
        easing: "swing",
        queue: false,
        complete: function () {
          ak.remove();
          ah(ao);
        },
      }
    );
  });
  d(undefined, false);
  var R = new Date();
  var a = $(".hourline ul:eq(0) li").index(
    $(".hourline ul:eq(0) li.tod_selected")
  );
  var x = o ? 0 : a;
  var P = o || window.quickmeeting ? null : a;
  var f = { onColumnChange: null, onMouseDown: null, onMouseUp: null };
  W(x, P, window.quickmeeting ? f : {});
  if (!window.quickmeeting) {
    h.show();
  }
  var ad = h.data("vars");
  $(document).mouseup(function (ag) {
    if (
      !(
        $(ag.target).closest(".toolbar").length > 0 ||
        $(ag.target).closest(".tipsy").length > 0
      )
    ) {
      if (!window.quickmeeting) {
        S(null);
      }
    }
    var ah = ".bttn-explicit-link";
    if (ah.length > 0 && $(".tipsy").is(":visible")) {
      if (
        !(
          $(ag.target).closest(".bttn-explicit-link").length > 0 ||
          $(ag.target).closest(".tipsy").length > 0
        )
      ) {
        $(".tipsy").remove();
      }
    }
  });
  var N = function () {
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimout);
      window.resizeTimeout = setTimeout(function () {
        window.resizeTimeout = null;
      }, 200);
      return;
    } else {
      window.resizeTimeout = setTimeout(function () {
        window.resizeTimeout = null;
      }, 200);
    }
    K.resize();
    if (ad.mode == 1) {
      ab(h, null, false);
      ab(z, null, false);
    } else {
      g(h, ad.startIndex, ad.endIndex);
      ab(z, null, false);
      if (ad.mode == 3) {
        var ag = y.data("vars");
        var ak = s.data("vars");
        g(y, ag.startIndex, ag.endIndex);
        g(s, ak.startIndex, ak.endIndex);
      }
    }
    var aj = $(".schedule");
    if (aj) {
      var ah = K.css("left").replace("px", "");
      var ai = K.css("right").replace("px", "");
      aj.css({ paddingLeft: ah + "px", paddingRight: ai + "px" });
    }
  };
  $(window).resize(N);
  $(window).resize();
  $("#bttn-fullscreen").mousedown(function (ag) {
    ag.preventDefault();
    _gaq.push(["_trackEvent", "Misc", "Fullscreen", "On"]);
    U();
  });
  if (Input.get("fullscreen", -1) == Input.get("current_tab")) {
    U(false);
  }
  ab(h, null, false);
  if (!o) {
    ab(z, null, false);
  }
  if (!window.originalMeetingMode) {
    $(".band-handle")
      .bind("mousedown", function (ag) {
        t(h, "hide");
        ad.mouseDownIndex =
          $(this).attr("id") == "band-handle-left"
            ? ad.endIndex - window.hoursPerActiveRegion
            : ad.startIndex;
        K.css("cursor", "w-resize");
        return false;
      })
      .bind("mouseover", function (ah) {
        var ag = $(this).attr("id") == "band-handle-left" ? "left" : "right";
        h.addClass("adjusting_" + ag);
      })
      .bind("mouseout", function (ah) {
        if (ad.mouseDownIndex < 0) {
          var ag = $(this).attr("id") == "band-handle-left" ? "left" : "right";
          h.removeClass("adjusting_" + ag);
          K.css("cursor", "default");
        }
      });
  }
  function B(ah, ag) {
    if (ag == undefined) {
      return ad[ah];
    }
    if (ad[ah] != ag) {
      ad[ah] = ag;
    }
  }
  function M(ah) {
    var ak = ad.mode;
    if (ak == 1) {
      w(h, 2);
      ad.mouseDownIndex = ah;
      var ag = window.minSelection;
      var aj = Math.floor(ah / ag) * ag;
      var ai = aj + ag;
      g(h, aj, ai);
    } else {
      if (ak == 3) {
        w(h, 1);
        ab(h, Math.floor(ah));
        $("div", h).show();
        _gaq.push(["_trackEvent", "Scheduling", "Deselect Range"]);
      }
    }
  }
  function S(ag) {
    var ah = ad.mode;
    if (ah == 2) {
      w(h, 3);
      var ai = Math.abs(ad.startIndex - ad.endIndex);
      ai = Math.floor(ai * 60);
      _gaq.push(["_trackEvent", "Scheduling", "Select Range", "", ai]);
    } else {
      if (ah == 3 && ad.mouseDownIndex >= 0) {
        w(h, 3);
      } else {
        if (ah == 3) {
          w(h, 1);
          $(".dst_note").stop(true, true).fadeIn(400, "linear");
          ab(h, null);
          _gaq.push(["_trackEvent", "Scheduling", "Deselect Range (out)"]);
        }
      }
    }
  }
  function ac(ao, aj, an) {
    var am = ad.mode;
    if (am == 1) {
      if (aj == null && ao != null) {
        G.stop(true, true).fadeOut(200, "linear");
        $("div", h).show();
      }
      if (aj != null && ao == null) {
        G.stop(true, true).fadeIn(400, "linear");
        $("div", h).hide();
      }
      hourIndex = ao == null ? null : Math.floor(ao);
      if (hourIndex == null || aj == null || hourIndex != Math.floor(aj)) {
        ab(
          h,
          hourIndex,
          $.browser.webkit || $.browser.mozilla || ao == null ? true : false
        );
      }
      if (hourIndex != Math.floor(aj)) {
        if (C) {
          clearTimeout(C);
        }
        if (hourIndex != null) {
          C = setTimeout(function () {
            window.clientEvent("vconv:" + hourIndex);
          }, 2000);
        }
      }
    } else {
      if (
        (am == 2 && ao != null) ||
        (am == 3 && ad.mouseDownIndex >= 0 && ao != null)
      ) {
        var ai = ad.mouseDownIndex;
        var ap = ao;
        var ah = ad.mouseDownIndex > ao ? "right" : "left";
        var ar = null;
        var ag = window.minSelection;
        if (am == 3 && an.shiftKey) {
          ag = window.hoursPerActiveRegion;
        }
        if (ai > ap) {
          ar = ai;
          ai = ap;
          ap = ar;
        }
        var aq = Math.floor(ai / ag) * ag;
        var al = Math.floor(ap / ag) * ag + ag;
        if (am == 3) {
          if (ah == "right") {
            al = ad.endIndex;
          } else {
            aq = ad.startIndex;
          }
        }
        var ak = g(h, aq, al);
        if (am == 3 && ak) {
          T();
          m();
        }
      }
    }
  }
  function w(ag, aj) {
    var ai = ag.data("vars");
    switch (aj) {
      case 1:
        ag.removeClass("customizing").removeClass("customized");
        K.css("cursor", "");
        ai.mouseDownIndex = -1;
        if (ai.mode == 3) {
          A(ag, "enable");
          if ((window.scheduling_widget || window.embedded_script) && XD) {
            var ah = { action: "deselect", locations: [] };
            message_str = JSON.stringify(ah);
            XD.postMessage(message_str, "*", window.parent);
          }
        }
        band_options("hide");
        p("default");
        break;
      case 2:
        if (C) {
          clearTimeout(C);
        }
        $("div", ag).hide();
        ag.addClass("customizing").removeClass("customized");
        K.css("cursor", "w-resize");
        if (ai.mode == 3) {
          A(ag, "enable");
        }
        break;
      case 3:
        ag.removeClass("customizing").addClass("customized");
        K.css("cursor", "default");
        A(ag, "disable");
        ai.mouseDownIndex = -1;
        $(".band-handle").mouseout();
        if (!window.quickmeeting) {
          band_options("show");
        }
        p("meeting");
        break;
      default:
        return;
    }
    ai.mode = aj;
  }
  function t(ah, ai) {
    if (window.originalMeetingMode) {
      return;
    }
    if (ai == "hide") {
      $(".band-handle").removeClass("band-handle-shown");
    } else {
      var ak = ah.position();
      var aj = ah.height();
      var ag = ah.width();
      $("#band-handle-left").css({ top: ak.top, left: ak.left, height: aj });
      $("#band-handle-right").css({
        top: ak.top,
        left: ak.left + ag - 1,
        height: aj,
      });
      $(".band-handle").addClass("band-handle-shown");
    }
  }
  function T(ag) {
    ad = h.data("vars");
    var ah = Math.min(ad.startIndex, ad.endIndex);
    var ai = Math.max(ad.startIndex, ad.endIndex);
    ag = ag == undefined ? true : false;
    if (ah >= 0) {
      if (ah != y.data("vars").endIndex) {
        g(y, 0, ah);
      }
      y.css("filter", "alpha(opacity=70)");
      ag && y.not(":visible")
        ? y.stop(true, true).fadeIn(200, "linear")
        : y.show();
    }
    if (ai <= 24) {
      if (ai != s.data("vars").startIndex) {
        g(s, ai, 24);
      }
      s.css("filter", "alpha(opacity=70)");
      ag && s.not(":visible")
        ? s.stop(true, true).fadeIn(200, "linear")
        : s.show();
    }
  }
  function A(aj, ak) {
    if (ak == "enable") {
      y.stop(true, true).fadeOut(200, "linear");
      s.stop(true, true).fadeOut(200, "linear");
      z.stop(true, true).fadeTo(200, 0.1);
      t(aj, "hide");
    } else {
      if (ak == "disable") {
        var al = aj.data("vars");
        var ah = Math.min(al.startIndex, al.endIndex);
        var ai = Math.max(al.startIndex, al.endIndex);
        var ag = ah + "," + ai;
        clientEvent("select-range:" + ag);
        T();
        z.stop(true, true).fadeTo(200, 0.05);
        t(aj, "show");
      }
    }
  }
  function ab(ai, ah, ak) {
    if (!ai) {
      return;
    }
    var al = ai.data("vars");
    if (ak == undefined) {
      ak = true;
    }
    if (ah == null) {
      ah = al.defaultIndex;
    }
    var aj = K.data("computed");
    var ag = {
      top: aj.glassDim.top + al.adjust.top,
      left: aj.glassDim.left + ah * aj.columnWidth + al.adjust.left,
      right:
        aj.glassDim.right + (24 - ah - 1) * aj.columnWidth + al.adjust.right,
      bottom: aj.glassDim.bottom + al.adjust.bottom,
    };
    if (!ak) {
      ai.css(ag);
    } else {
      ai.stop(true, true).animate(ag, {
        duration: 100,
        easing: "linear",
        queue: false,
      });
    }
    al.currentIndex = ah;
    al.startIndex = ah;
    al.endIndex = ah + window.hourPerActiveRegion;
  }
  function g(ah, al, aj) {
    var ak = ah.data("vars");
    ak.startIndex = al;
    ak.endIndex = aj;
    ah.stop(true, true);
    var ai = K.data("computed");
    var ag = {
      top: ai.glassDim.top + ak.adjust.top,
      left: ai.glassDim.left + al * ai.columnWidth + ak.adjust.left,
      right: ai.glassDim.right + (24 - aj) * ai.columnWidth + ak.adjust.right,
      bottom: ai.glassDim.bottom + ak.adjust.bottom,
    };
    ah.css(ag);
    return true;
  }
  function p(ah) {
    if (!window.time_script) {
      return;
    }
    var ag = window.quickmeeting ? "css" : "animate";
    if (ah == "meeting") {
      if (!i.freezeUpdates) {
        i.setFreezeUpdates(true);
        $("#toolbar-default").hide();
        $("#toolbar-meeting").show();
        $("#toolbar-meeting > #tm-buttons")
          .css({ marginRight: "10px" })
          ["css"]({ marginRight: "20px" });
        $(".data").css({ width: "170px", "margin-left": "-70px" });
      }
      $(".location")["css"]({ width: "80px" });
      m();
    } else {
      $("#toolbar-default").show();
      $("#toolbar-meeting").hide();
      $(".data").stop().css({ width: "90px", "margin-left": "0px" });
      $(".location").stop().css({ width: "" });
      i.setFreezeUpdates(false);
      i.refresh(true);
      if (o) {
        m(true);
      }
    }
  }
  function m(aK) {
    var aC, aj, aE;
    if (aK == undefined) {
      aK = false;
    }
    if (aK) {
      aC = h.data("vars");
      aC.startIndex = 0;
      aC.endIndex = 0;
    }
    var aN = get_sharing_options();
    if (aK) {
      aC.startIndex = -1;
      aC.endIndex = -1;
    }
    var aw = aN[0];
    var az = aN[1];
    var ao = aN[2];
    var ai = [];
    var aB = window.locationRows;
    var ar = null;
    var ay = window.meeting_range;
    var am = location_list_for_export();
    if (!ay) {
      var aC = $(".band").data("vars");
      ay = { startIndex: aC.startIndex, endIndex: aC.endIndex };
    }
    var aq = az.startDate;
    var ap = window.location.pathname;
    var an = encodeURI(
      window.location.protocol +
        "//" +
        window.location.host +
        ap +
        "?qm=1&lid=" +
        am.lids +
        "&h=" +
        am.home +
        "&date=" +
        aq.getUTCFullYear() +
        "-" +
        (aq.getUTCMonth() + 1) +
        "-" +
        aq.getUTCDate() +
        "&sln=" +
        ay.startIndex +
        "-" +
        ay.endIndex
    );
    var aL = Input.get("forex_mode");
    var al = Input.get("olympics_mode");
    if (aL == 1) {
      an += "&fx=1";
    }
    if (al == 1) {
      an += "&cc=1";
    }
    an += "&hf=" + Input.get("ampm_mode");
    if (window.cnum) {
      an += "&c=" + window.cnum;
    }
    $("#meeting-link").attr("href", an);
    var ag = ay.endIndex - ay.startIndex;
    var aH = "";
    if (ag > 0 && ag - Math.floor(ag) < 0.0001) {
      aH = Math.floor(ag) + " hour" + (Math.floor(ag) != 1 ? "s" : "");
    } else {
      if (ag < 1) {
        aH = round2((ag - Math.floor(ag)) * 60, 0) + " minutes";
      } else {
        aH =
          Math.floor(ag) + "h " + round2((ag - Math.floor(ag)) * 60, 0) + "m";
      }
    }
    $("#meeting-duration").text(aH);
    $.each(aw, function (aP, aQ) {
      $("#sb_" + aQ.className)
        .parent()
        .attr("href", aQ.link);
    });
    for (var aG = 0; aG < ao.length; aG++) {
      var aM = ao[aG].startDate.toWTBDate(ao[aG].ampmMode, {});
      var av = ao[aG].endDate.toWTBDate(ao[aG].ampmMode, {});
      var aD = {
        start_hour: aM.hours,
        start_ampm: aM.ampm,
        start_minute: aM.minutes,
        start_date: aM.dayOfWeek + ", " + aM.month + " " + aM.date,
        start_year: aM.year,
        end_hour: av.hours,
        end_ampm: av.ampm,
        end_minute: av.minutes,
        end_date: av.dayOfWeek + ", " + av.month + " " + av.date,
        end_year: av.year,
        index: ao[aG].index,
        cIndex: aG,
      };
      if (az.index == ao[aG].index) {
        ar = aG;
      }
      ai.push(aD);
    }
    var au = $("div.data");
    var at = au.find("span.th");
    var ak = au.find("span.tm");
    var aF = au.find("span.ampm");
    var aI = au.find("div.date");
    for (var aG = 0; aG < ai.length; aG++) {
      var ax = ai[aG];
      var aA = aB.eq(aG);
      var ah;
      if (o || window.quickmeeting) {
        !aK
          ? au.eq(aG).removeClass("data_faded")
          : au.eq(aG).addClass("data_faded");
      }
      var aJ = aG * 2;
      var aO = aJ + 1;
      at.eq(aJ).text(ax.start_hour);
      ak.eq(aJ).text(ax.start_minute);
      aF.eq(aJ).text(ax.start_ampm);
      aI.eq(aJ).text(ax.start_date);
      at.eq(aO).text(ax.end_hour);
      ak.eq(aO).text(ax.end_minute);
      aF.eq(aO).text(ax.end_ampm);
      aI.eq(aO).text(ax.end_date);
      if (
        ai[ar].start_date != ax.start_date ||
        ai[ar].end_date != ax.end_date
      ) {
        aI.eq(aJ).addClass("dateHighlight");
        aI.eq(aO).addClass("dateHighlight");
      } else {
        aI.eq(aJ).removeClass("dateHighlight");
        aI.eq(aO).removeClass("dateHighlight");
      }
    }
  }
  function Q(ag) {
    if (H) {
      H.type(ag);
    }
    if (ag > 0) {
      if (O.is(":visible")) {
        O.hide();
        V.removeClass("icSearch");
      }
    } else {
      O.show();
      D.val("");
      V.addClass("icSearch");
    }
  }
  var H = {
    states: { blank: 1, input: 2, blurred: 3 },
    prevState: null,
    currentState: null,
    activateTimestamp: null,
    chars: 0,
    debug: false,
    firstTime: true,
    focus: function () {
      if (this.chars == 0) {
        this.setState(this.states.blank);
      } else {
        this.setState(this.states.input);
      }
    },
    type: function (ag) {
      if (this.currentState == this.states.blank) {
        if (ag > 0) {
          this.chars = ag;
          this.setState(this.states.input);
        }
      }
      if (this.currentState == this.states.input) {
        if (ag == 0) {
          this.chars = 0;
          this.setState(this.states.blank);
        }
      }
    },
    pick: function () {
      if (this.currentState == this.states.input) {
        this.fire("Success (Picked)");
        this.chars = 0;
        this.setState(this.states.blank);
      }
    },
    blur: function () {
      this.setState(this.states.blurred);
    },
    activate: function () {
      this.activateTimestamp = new Date();
      if (this.debug) {
        $("#suggState").text(
          $("#suggState").text() + "IsActivated = " + this.isActivated() + "\n"
        );
      }
    },
    deactivate: function () {
      this.activateTimestamp = null;
      if (this.debug) {
        $("#suggState").text(
          $("#suggState").text() + "IsActivated = " + this.isActivated() + "\n"
        );
      }
    },
    isActivated: function () {
      return this.activateTimestamp != null;
    },
    fire: function (ah) {
      if (this.isActivated()) {
        var ai = new Date();
        var ag = ai.getTime() - this.activateTimestamp.getTime();
        if (!af) {
          _gaq.push(["_trackEvent", "Location Suggestions", ah, "", ag]);
        }
        if (this.debug) {
          $("#suggEvents").text(
            $("#suggEvents").text() + ah + " in " + ag + " ms\n"
          );
        }
        this.deactivate();
      }
    },
    setState: function (ah) {
      this.prevState = this.currentState;
      this.currentState = ah;
      if (this.prevState == this.states.blank && ah == this.states.input) {
        this.activate();
        if (this.firstTime) {
          var ai = new Date();
          var ag = ai.getTime() - window.scriptDate.getTime();
          var aj;
          if (ag > 60000) {
            aj = "1m";
          } else {
            if (ag > 45000) {
              aj = "45s";
            } else {
              if (ag > 30000) {
                aj = "30s";
              } else {
                if (ag > 20000) {
                  aj = "20s";
                } else {
                  if (ag > 10000) {
                    aj = "10s";
                  } else {
                    if (ag > 5000) {
                      aj = "5s";
                    } else {
                      aj = "0s";
                    }
                  }
                }
              }
            }
          }
          _gaq.push([
            "_trackEvent",
            "Location Suggestions",
            "Activated",
            aj,
            ag,
          ]);
        }
      }
      if (this.isActivated() && ah == this.states.blank) {
        this.fire("Fail (Cleared)");
      }
      if (this.isActivated() && ah == this.states.blurred) {
        this.fire("Fail (Blurred)");
      }
      if (this.debug) {
        $("#suggState").text(
          $("#suggState").text() + "state = " + this.currentState + "\n"
        );
      }
    },
  };
  init_search();
  var i = {
    locationsSelector: ".clientarea",
    timeSelector: ".clientarea .container .data > .time",
    dateSelector: ".clientarea .container .data > .date",
    offsetSelector: ".icon > span",
    hourSelector: ".th",
    minuteSelector: ".tm",
    semiSelector: ".ts",
    ampmSelector: ".ampm",
    semiToggleClass: "blink",
    $locations: null,
    $allTimes: null,
    $allDates: null,
    $allSemis: null,
    allOffsets: Array(),
    prevJsTimestamp: 0,
    homeTimestamp: null,
    homeLocationIndex: null,
    freezeUpdates: false,
    reloadLater: false,
    ampmMode: true,
    init: function (am) {
      this.ampmMode = am;
      var ah = new Date();
      var an = ah;
      var ap = Date.UTC(
        an.getFullYear(),
        an.getMonth(),
        an.getDate(),
        an.getHours(),
        an.getMinutes(),
        an.getSeconds()
      );
      this.$allTimes = $(this.timeSelector);
      this.$allDates = $(this.dateSelector);
      this.$locations = $(this.locationsSelector);
      for (var al = 0; al < this.$allTimes.length; al++) {
        var ag = this.$allTimes.eq(al).text();
        var aj = window.locations[al].date;
        var aq = parseDateTime(aj, ag);
        aq.setSeconds(ah.getSeconds(), ah.getMilliseconds());
        var ao = new Date();
        var ak = aq;
        var ai = Date.UTC(
          ak.getFullYear(),
          ak.getMonth(),
          ak.getDate(),
          ak.getHours(),
          ak.getMinutes(),
          ak.getSeconds()
        );
        ao.setTime(ai);
        this.allOffsets[al] = ai - ap;
      }
      setInterval(
        (function (ar) {
          return function () {
            ar.refresh();
          };
        })(this),
        1000
      );
    },
    deleteLocationAtIndex: function (ag) {
      if (this.$allTimes) {
        this.$allTimes = this.$allTimes.not(":eq(" + ag + ")");
        this.$allDates = this.$allDates.not(":eq(" + ag + ")");
        this.allOffsets.splice(ag, 1);
      }
    },
    setFreezeUpdates: function (ag) {
      this.freezeUpdates = ag;
      if (this.$locations) {
        this.$locations.removeClass("blink");
      }
    },
    refresh: function (al) {
      if (!this.$locations) {
        return;
      }
      if (al == undefined) {
        al = false;
      }
      if (!this.freezeUpdates) {
        this.$locations.toggleClass("blink");
      }
      var ak = new Date();
      if (
        (this.prevJsTimestamp &&
          Math.abs((ak.getTime() - this.prevJsTimestamp) / (3600 * 1000 * 1)) >
            3) ||
        (this.reloadLater && B("mode") == 1)
      ) {
        reloadPage();
      }
      if (
        al ||
        Math.floor((ak.getTime() + this.allOffsets[0]) / 60000) !=
          Math.floor((this.prevJsTimestamp + this.allOffsets[0]) / 60000)
      ) {
        var aj = new Date();
        var an = 0;
        if (this.prevJsTimestamp) {
          aj.setTime(this.prevJsTimestamp);
          an = ak.getTimezoneOffset() - aj.getTimezoneOffset();
        }
        this.prevJsTimestamp = ak.getTime();
        var am = new Array();
        for (var ah = 0; ah < this.$allTimes.length; ah++) {
          if (an != 0) {
            this.allOffsets[ah] += an * 60000;
          }
          var ag = ak;
          var ai = Date.UTC(
            ag.getFullYear(),
            ag.getMonth(),
            ag.getDate(),
            ag.getHours(),
            ag.getMinutes(),
            ag.getSeconds()
          );
          am[ah] = ai + this.allOffsets[ah];
          if (locations[ah].is_home) {
            this.homeTimestamp = am[ah];
            this.homeLocationIndex = ah;
          }
        }
        for (var ah = 0; ah < this.$allTimes.length; ah++) {
          if (!this.freezeUpdates) {
            this.updateUX(
              am[ah],
              this.$allTimes.eq(ah),
              this.$allDates.eq(ah),
              ah
            );
          }
          this.updateSchedule();
        }
      }
    },
    updateSchedule: function () {
      var al = $(".schedule");
      if (al.length == 0) {
        return;
      }
      var ak = $(".event-inst", al);
      for (var aj = 0; aj < ak.length; aj++) {
        var ai = ak.eq(aj);
        var ah = ai.attr("start") * 1000;
        var ag = ai.attr("end") * 1000;
        if (this.homeTimestamp >= ah && this.homeTimestamp < ag) {
          ai.addClass("active");
        } else {
          ai.removeClass("active");
          if (this.homeTimestamp >= ag) {
            ai.addClass("finished");
          }
        }
      }
    },
    updateUX: function (aj, at, ah, an) {
      var aD = new Date();
      aD.setTime(aj);
      var ak = 0;
      var aG = 0;
      if (locations[an].dst_on_hourline && !locations[an].dst_same_index) {
        var al = !locations[an].now_before_dst;
        if (al) {
          aG = locations[an].dst_move > 0 ? -1 : 1;
        } else {
          var ay = parseInt(
            "" +
              aD.getUTCDate() +
              (aD.getUTCHours() < 10 ? "0" : "") +
              aD.getUTCHours(),
            10
          );
          var ai = parseInt(
            "" + locations[an].dst_day + locations[an].dst_hour,
            10
          );
          if (locations[an].now_before_dst && ay >= ai) {
            ak = locations[an].dst_move / 3600;
            if (locations[an].is_home) {
              this.homeTimestamp += locations[an].dst_move * 1000;
            }
          }
        }
      }
      if (window.ampmMode == 2) {
        this.ampmMode = window.locations[an].ampm_mode;
      }
      var aC = aD.getUTCHours() + ak;
      var aA = this.ampmMode
        ? aC == 12
          ? 12
          : aC % 12
        : aC.toString().pad(2, "0");
      var ap = this.ampmMode && aA == 0 ? 12 : aA;
      var av = aC > 11 ? "p" : "a";
      var aw = (aD.getUTCMinutes() < 10 ? "0" : "") + aD.getUTCMinutes();
      var ar = round2(
        (aj - this.homeTimestamp + ak * 3600 * 1000) / (3600 * 1000),
        2
      );
      var am = ar >= 0 ? "+" : "";
      $(this.hourSelector, at).text(ap);
      $(this.minuteSelector, at).text(aw);
      if (this.ampmMode) {
        $(this.ampmSelector, at).text(av);
      }
      $(this.offsetSelector, at.closest(".container")).text(am + ar);
      var az = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        aD.getUTCDay()
      ];
      var aF = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][aD.getUTCMonth()];
      var aE = aD.getUTCDate();
      var aq = aD.getUTCFullYear();
      var au = az + ", " + aF + " " + aE;
      ah.text(au);
      if (this.$allDates.eq(this.homeLocationIndex).text() != au) {
        ah.addClass("dateHighlight");
      } else {
        ah.removeClass("dateHighlight");
      }
      var ax = B("defaultIndex");
      var ao = (aD.getUTCHours() + aG) % 24;
      if (locations[an].is_home && ao != ax) {
        if (ax == 23 && ao == 0) {
          if (B("mode") == 1) {
            var ag = Math.floor(Math.random() * 59 * 1000);
            setTimeout(reloadPage, ag);
          } else {
            this.reloadLater = true;
          }
          return;
        }
        var aB = ax;
        B("defaultIndex", ao);
        var aH = z.data("vars");
        aH.defaultIndex = ao;
        z.data("vars", aH);
        if (!o) {
          ab(z, null, false);
        }
        if (B("currentIndex") == aB && B("mode") == 1) {
          ab(h, null);
        }
      }
    },
  };
  if (!o && window.time_script) {
    i.init(ampmMode);
  }
  if (window.quickmeeting) {
    g(h, window.meeting_range.startIndex, window.meeting_range.endIndex);
    T();
    w(h, 3);
    h.show();
    y.show();
    s.show();
    $(".container").parent().dragsort("disable");
  }
  I();
  $(".datepicker_input")
    .date_input({
      selected_date: Input.get("chosen_date", "").replace(/\|\d/, ""),
      day_selected_callback: function (ag) {
        _gaq.push(["_trackEvent", "Calendar", "Select Date"]);
        Input.set("chosen_date", ag + "|3");
        Input.apply(true);
      },
    })
    .mousedown(function () {
      _gaq.push(["_trackEvent", "Calendar", "Open Calendar"]);
    });
  $(".datepicker_revert").mousedown(function () {
    _gaq.push(["_trackEvent", "Calendar", "Revert to Auto"]);
  });
  $(".loc-tab[class~=active] .loc-tab-open").inlineEdit({
    maxInputLength: 20,
    minInputLength: 1,
    saveCallback: function (ah, ag) {
      $.getJSON("/helper/edit_tab", {
        tab_id: $(ah).parent().attr("tab-id"),
        tab_name: ag,
      });
      _gaq.push(["_trackEvent", "Tab Management", "Rename Tab"]);
    },
  });
  if (window.loggedIn) {
    $(".city b").mousedown(function (ag) {
      ag.stopPropagation();
    });
    $(".city b").inlineEdit({
      maxInputLength: 20,
      minInputLength: 1,
      saveCallback: function (al, ah, ai) {
        var ag = $(al).closest(".container");
        var ak = ag.attr("lid");
        var aj = Input.get("current_tab");
        $.ajax({
          url: "/helper/edit_location",
          data: { lid: ak, new_name: ah },
          type: "GET",
          error: function (am, ao, an) {
            alert(
              "Error communicating with the server. Please try to refresh the page or contact our support."
            );
          },
          success: function (aq, ar, ap) {
            var am = Input.get("current_tab");
            var ao = am !== aj;
            if (aq && aq.cid && !ao) {
              if (aq.cid != ag.attr("lid")) {
                if (ag.attr("alias") != 1) {
                  ag.attr("orig-lid", ag.attr("lid"));
                  ag.attr("orig-name", ai);
                  ag.attr("alias", 1);
                }
                ag.attr("lid", aq.cid);
                ag.attr("encoded-alias", aq.encoded_alias);
                var an = originalLocationIndex(ag);
                window.locations[an].id = aq.cid;
                if (window.locations[an].is_home) {
                  Input.set("home", aq.cid);
                }
                Input.set("locations", containerLocationIds("string"));
                Input.applyWithPingback(window.loggedIn);
              }
            } else {
              alert(
                "Error while saving settings to the server. Please try to refresh the page or contact our support."
              );
            }
          },
          dataType: "json",
        });
        _gaq.push(["_trackEvent", "Location Management", "Rename Location"]);
      },
    });
    $(".removeAlias").mousedown(function () {
      var ag = $(this).closest(".container");
      var aj = ag.attr("lid");
      var ah = $(".city b", ag);
      var ai = Input.get("current_tab");
      $.ajax({
        url: "/helper/remove_alias",
        data: { lid: aj },
        type: "GET",
        error: function (ak, am, al) {
          alert(
            "Error communicating with the server. Please try to refresh the page or contact our support."
          );
        },
        success: function (ap, aq, ao) {
          var ak = Input.get("current_tab");
          var an = ak !== ai;
          if (ap && ap.code == "200" && !an) {
            var am = ag.attr("orig-lid");
            ah.text(ag.attr("orig-name"));
            ag.attr("lid", am);
            ag.attr("alias", 0);
            ag.removeAttr("orig-name");
            ag.removeAttr("orig-lid");
            ag.removeAttr("encoded-alias");
            var al = originalLocationIndex(ag);
            window.locations[al].id = am;
            if (window.locations[al].is_home) {
              Input.set("home", am);
            }
            Input.set("locations", containerLocationIds("string"));
            Input.applyWithPingback(window.loggedIn);
          } else {
            alert(
              "Error while saving settings to the server. Please try to refresh the page or contact our support."
            );
          }
        },
        dataType: "json",
      });
      _gaq.push(["_trackEvent", "Location Management", "Remove Alias"]);
    });
  }
  $("#explicit-link-text").live("mousedown", function () {
    _gaq.push(["_trackEvent", "Misc", "Get Link", "Click Link"]);
  });
  Button = function (ag) {
    function ai(ak, am, aj) {
      var al = parseInt(ak.css("marginTop"));
      var an = parseInt(ak.css("marginBottom"));
      ak.css({ marginTop: al + am, marginBottom: an + aj });
    }
    function ah(aj) {
      if (aj.hasClass("bttn-pressed2")) {
        aj.removeClass("bttn-pressed2");
        ai(aj, -1, 1);
      }
    }
    $(ag)
      .bind("mousedown", function (ak) {
        var aj = $(this);
        if (!aj.hasClass("bttn-pressed") && !aj.hasClass("bttn-skip-fx")) {
          aj.addClass("bttn-pressed2");
          ai(aj, 1, -1);
        }
      })
      .bind("mouseup", function (ak) {
        var aj = $(this);
        ah(aj);
      })
      .bind("mouseout", function (ak) {
        var aj = $(this);
        ah(aj);
      });
  };
  new Button(".bttn-normal");
})();
function ChangeLocation(a) {
  _gaq.push(["_trackEvent", "Location Management", "Add"]);
  addLocation(a.value, true);
}
function getLocationIds() {
  var a = Input.get("locations", "");
  if (a.length == 0) {
    return [];
  } else {
    return a.split(",");
  }
}
function addLocation(c, b) {
  if (c < 0) {
    return;
  }
  var a = getLocationIds();
  if (a.length < window.maxLocations) {
    a.push(c);
    if (b) {
      reloadPage(a);
    }
  } else {
    alert(
      "Each tab allows for a maximum of " +
        window.maxLocations +
        " locations. Please remove some of the locations before adding new ones. Or start a new locations tab (requires signin)."
    );
  }
}
function reloadPage(a, b) {
  if (a) {
    Input.set("locations", a.join(","));
  }
  if (b === undefined) {
    b = true;
  }
  Input.apply(b);
}
function parseDateTime(b, a) {
  if (!(b && a)) {
    return null;
  }
  var e = new Date();
  e.setTime(Date.parse(b));
  var c = a.match(/(\d+)(:(\d\d))?\s*([ap]?)/);
  c[1] = parseInt(c[1], 10) == 12 && c[4] == "a" ? 0 : c[1];
  e.setHours(
    parseInt(c[1], 10) + (parseInt(c[1], 10) < 12 && c[4] == "p" ? 12 : 0)
  );
  e.setMinutes(parseInt(c[3], 10) || 0);
  e.setSeconds(0, 0);
  return e;
}
function parseDate(c, b, a) {
  if (c == undefined || b == undefined) {
    return null;
  }
  if ((timezone = undefined)) {
    timezone = "";
  }
  var e = b.match(/(\d+)(:(\d\d))?\s*([ap]?)/);
  e[1] = parseInt(e[1], 10) == 12 && e[4] == "a" ? 0 : e[1];
  b =
    parseInt(e[1], 10) +
    (parseInt(e[1], 10) < 12 && e[4] == "p" ? 12 : 0) +
    ":" +
    (parseInt(e[3], 10) || 0) +
    ":00";
  var f = new Date();
  f.setTime(Date.parse(c + " " + b + " " + a));
  return f;
}
function round2(b, a) {
  return Math.round(b * Math.pow(10, a)) / Math.pow(10, a);
}
band_options = function (b, a) {
  if (!window.originalMeetingMode && !window.event_script) {
    return;
  }
  if (!(window.time_script || a == true)) {
    return;
  }
  if (b == "show") {
    if ($(".bttn-explicit-link div").length > 0) {
      $(".bttn-explicit-link div").tipsy("hide");
    }
    $(".band").tipsy("show");
  } else {
    if (b == "hide") {
      $(".band").tipsy("hide");
    }
  }
};
var deltaYear = 365 * 24 * 60 * 60 * 1000;
var deltaMonth = 30 * 24 * 60 * 60 * 1000;
var deltaDay = 24 * 60 * 60 * 1000;
var deltaHour = 60 * 60 * 1000;
var deltaMinute = 60 * 1000;
function findDstTransitions(e, g, q, b) {
  var o = [];
  var c = new Date();
  var a = new Date();
  if (b == undefined) {
    b = 0;
  }
  c.setTime(e);
  a.setTime(g);
  for (var h = e; h < g; h += q) {
    c.setTime(h);
    var l = c.getTimezoneOffset();
    a.setTime(h + q);
    var d = a.getTimezoneOffset();
    var p = l - d;
    if (p != 0) {
      var f = h;
      var n = h + q;
      c.setTime(a.getTime() - c.getTimezoneOffset() * 60 * 1000);
      switch (q) {
        case deltaMonth:
          newDelta = deltaDay;
          break;
        case deltaDay:
          newDelta = deltaHour;
          break;
        case deltaHour:
          newDelta = deltaMinute;
          break;
        default:
          var k = (p < 0 ? 0 : p) * 60;
          var j = -(d * 60) - k;
          return {
            gmt_offset: j,
            dst_add: k,
            ts_u: a.getTime() / 1000,
            ts_w: c.getTime() / 1000,
          };
      }
      var m = findDstTransitions(f, n, newDelta, b + 1);
      if (m) {
        o = o.concat(m);
      }
    }
  }
  return o;
}
function cleanQS(a) {
  if (a == undefined) {
    a = window.location.search;
  }
  return a.replace(/&et=[^&]*/g, "").replace(/&ed=[^&]*/g, "");
}
function sendDocHeight() {
  XD.postMessage($("body").outerHeight(true), "*", window.parent);
}
function sendRefreshEvent() {
  XD.postMessage("refresh", "*", window.parent);
}
(function abub() {
  var b = Math.random() < 0.2;
  if (b && window.isShowingAds !== true) {
    var a = window.loggedIn;
    window.loggedIn = 1;
    clientEvent("abub:1");
    window.loggedIn = a;
  }
})();
function selectText(b) {
  var d = document,
    e = d.getElementById(b),
    a,
    c;
  if (d.body.createTextRange) {
    a = d.body.createTextRange();
    a.moveToElementText(e);
    a.select();
  } else {
    if (window.getSelection) {
      c = window.getSelection();
      a = d.createRange();
      a.selectNodeContents(e);
      c.removeAllRanges();
      c.addRange(a);
    }
  }
}
function getPageLabel() {
  var b = "-converter";
  var a = window.location.pathname;
  if (a.indexOf(b) >= 0) {
    a = a.replace(b, "");
  } else {
    if (a == "/") {
      a = "/";
    } else {
      a = "others";
    }
  }
  return a;
}
$("#converter-from, #converter-to").bind("change", function (c) {
  var b = $("#converter" + (this.id.indexOf("-from") > 0 ? "-to" : "-from"));
  var a = this.selectedIndex;
  if (b[0].selectedIndex != a) {
    b[0].selectedIndex = a;
  }
});
/*
	/* Part of this script uses: 
	 * Cross-browser JSON Serialization in JavaScript by Craig Buckler from
	 * http://www.sitepoint.com/javascript-json-serialization/
	 */
var JSON = JSON || {};
JSON.stringify =
  JSON.stringify ||
  function (e) {
    var d = typeof e;
    if (d != "object" || e === null) {
      if (d == "string") {
        e = '"' + e + '"';
      }
      return String(e);
    } else {
      var f,
        b,
        c = [],
        a = e && e.constructor == Array;
      for (f in e) {
        b = e[f];
        d = typeof b;
        if (d == "string") {
          b = '"' + b + '"';
        } else {
          if (d == "object" && b !== null) {
            b = JSON.stringify(b);
          }
        }
        c.push((a ? "" : '"' + f + '":') + String(b));
      }
      return (a ? "[" : "{") + String(c) + (a ? "]" : "}");
    }
  };
if (window.embedded_script) {
  sendDocHeight();
}
var CalendarSettings = (function () {
  var b = "calendarSettings";
  return {
    open: function () {
      a();
    },
    close: function () {
      jmpopups.closePopupLayer(b);
    },
  };
  function a() {
    var d = false;
    var e = {};
    var c = null;
    if (jmpopups.openPopupLayer) {
      jmpopups.openPopupLayer({
        name: b,
        width: 400,
        height: 500,
        target: b,
        beforeClose: function () {
          var f = window.frames["calendar-settings-frame"];
          d = f.settingsChanged || f.location.hash == "#disconnected";
          e = f.enabledCalendarsByGroup.all;
        },
        afterClose: function () {
          if (d) {
            clientEvent(
              "save-calendars: " + encodeURIComponent(e),
              "applyWithReload"
            );
          }
        },
        success: function () {
          var f =
            '<iframe name="calendar-settings-frame" style="width: 100%; height: 100%" src="/calendar_settings" frameborder="0" />';
          $("#popupLayer_" + b)
            .css({
              border: "4px solid #292929",
              padding: "1px",
              background: "#ffffff",
              borderRadius: "4px",
            })
            .html(f);
        },
      });
    } else {
      setTimeout(function () {
        a();
      }, 50);
    }
  }
})();
