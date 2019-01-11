/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
    initialDate = new Date(),

    $document = $(document),
    $window = $(window),
    $html = $("html"),

    isDesktop = $html.hasClass("desktop"),
    isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    onloadCaptchaCallback,

    plugins = {
      pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
      smoothScroll: $html.hasClass("use--smoothscroll") ? "js/smoothscroll.min.js" : false,
      rdParallax: $(".rd-parallax"),
      responsiveTabs: $(".responsive-tabs"),
      rdNavbar: $(".rd-navbar"),
      owl: $(".owl-carousel"),
      resizable: $(".resizable"),
      scroller: $(".scroll-wrap"),
      viewAnimate: $('.animateItem'),
      sectionAnimate: $('.section-animate')
    };

/**
 * Initialize All Scripts
 */
$document.ready(function () {

  /**
   * isScrolledIntoView
   * @description  check the element whas been scrolled into the view
   */
  function isScrolledIntoView(elem) {
    var $window = $(window);

    if (elem.outerHeight() == 0) {
      return false;
    }

    return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
  }


  /**
   * addAnimation
   * @description  add animation on item
   */
  function addAnimation(item, activeClass) {
    item.addClass(activeClass);
    var delay = item.attr('data-delay') ? item.attr('data-delay') : 0,
        duration = item.attr('data-duration') ? item.attr('data-duration') : 1;
    item.css('animation-name', item.attr('data-animation'));
    item.css('animation-delay', delay + 's');
    item.css('animation-duration', duration + 's');
  }


  /**
   * animateSection
   * Create animate effects ob scroll section
   */
  function animateSection() {
    var scrollTop = $(window).scrollTop(),
        windowHeight = $(window).height(),
        windowWidth = $(window).width();

    for (var i = 0; i < plugins.sectionAnimate.length; i++) {
      var actualBlock = $(plugins.sectionAnimate[i]),
          childrenDiv = actualBlock.children('div'),
          offset = scrollTop - actualBlock.offset().top;

      var animationValues = setSectionAnimation(offset, windowHeight);

      //Scrollbar
      if (isDesktop) {
        windowWidth += 17;
      }

      if (windowWidth <= 991) {
        animationValues[0] = 0;
        animationValues[1] = 1;
      }

      childrenDiv.velocity({
        translateY: animationValues[0] + 'vh',
        opacity: animationValues[1],
        translateZ: 0
      }, 0);

      ( offset >= 0 && offset < windowHeight ) ? actualBlock.addClass('visible') : actualBlock.removeClass('visible');
    }

    requestAnimationFrame(animateSection);
  }

  /**
   * setSectionAnimation
   * Calculate translate value for section animate
   */
  function setSectionAnimation(sectionOffset, windowHeight) {
    // select section animation - normal scroll
    var translateY = 100,
        opacity = 1;

    if (sectionOffset >= -windowHeight && sectionOffset <= 0) {
      // section entering the viewport
      translateY = (-sectionOffset) * 100 / windowHeight;
      opacity = 1;
    } else if (sectionOffset > 0 && sectionOffset <= windowHeight) {
      //section leaving the viewport - still has the '.visible' class
      translateY = 0;
      opacity = 1;
    } else if (sectionOffset < -windowHeight) {
      //section not yet visible
      translateY = 100;
    } else {
      //section not visible anymore
      opacity = 0;
      translateY = 0;
    }
    return [translateY, opacity];
  }


  /**
   * makeParallax
   * @description  create swiper parallax scrolling effect
   */
  function makeParallax(el, speed, wrapper, prevScroll) {
    var scrollY = window.scrollY || window.pageYOffset;

    if (prevScroll != scrollY) {
      prevScroll = scrollY;
      el.addClass('no-transition');
      el[0].style['transform'] = 'translate3d(0,' + -scrollY * (1 - speed) + 'px,0)';
      el.height();
      el.removeClass('no-transition');

      if (el.attr('data-fade') === 'true') {
        var bound = el[0].getBoundingClientRect(),
            offsetTop = bound.top * 2 + scrollY,
            sceneHeight = wrapper.outerHeight(),
            sceneDevider = wrapper.offset().top + sceneHeight / 2.0,
            layerDevider = offsetTop + el.outerHeight() / 2.0,
            pos = sceneHeight / 6.0,
            opacity;
        if (sceneDevider + pos > layerDevider && sceneDevider - pos < layerDevider) {
          el[0].style["opacity"] = 1;
        } else {
          if (sceneDevider - pos < layerDevider) {
            opacity = 1 + ((sceneDevider + pos - layerDevider) / sceneHeight / 3.0 * 5);
          } else {
            opacity = 1 - ((sceneDevider - pos - layerDevider) / sceneHeight / 3.0 * 5);
          }
          el[0].style["opacity"] = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity.toFixed(2);
        }
      }
    }

    requestAnimationFrame(function () {
      makeParallax(el, speed, wrapper, prevScroll);
    });
  }


  /**
   * onloadCaptchaCallback
   * @description  init google reCaptcha
   */
  onloadCaptchaCallback = function () {
    for (i = 0; i < plugins.captcha.length; i++) {
      var $capthcaItem = $(plugins.captcha[i]);

      grecaptcha.render(
          $capthcaItem.attr('id'),
          {
            sitekey: $capthcaItem.attr('data-sitekey'),
            size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
            theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
            callback: function (e) {
              $('.recaptcha').trigger('propertychange');
            }
          }
      );
      $capthcaItem.after("<span class='form-validation'></span>");
    }
  };

  /**
   * IE Polyfills
   * @description  Adds some loosing functionality to IE browsers
   */
  if (isIE) {
    if (isIE < 10) {
      $html.addClass("lt-ie-10");
    }

    if (isIE < 11) {
      if (plugins.pointerEvents) {
        $.getScript(plugins.pointerEvents)
            .done(function () {
              $html.addClass("ie-10");
              PointerEventsPolyfill.initialize({});
            });
      }
    }

    if (isIE === 11) {
      $("html").addClass("ie-11");
    }

    if (isIE === 12) {
      $("html").addClass("ie-edge");
    }
  }


  /**
   * ViewPort Universal
   * @description Add class in viewport
   */
  if (plugins.viewAnimate.length && isDesktop) {
    var i,
        sectionAnimateContet = $('.animate-content'),
        sectionAnimateContetisAnimate = false;

    for (i = 0; i < plugins.viewAnimate.length; i++) {
      var $view = $(plugins.viewAnimate[i]);

      $document.on("scroll", $.proxy(function () {
            var _this = $(this);
            if (!_this.parents('.animate-content').length || sectionAnimateContetisAnimate) {
              if (isScrolledIntoView(_this)) {
                addAnimation(_this, 'animate');
              }
            }

          }, $view))
          .trigger("scroll");
    }


    //Custom animation on fixed section
    if (sectionAnimateContet.length) {
      sectionAnimateContetisAnimate = true;

      $document.on("scroll", function () {
        $window.scrollTop() + $window.height();
        if ($window.scrollTop() + $window.height() / 2 - 100 >= sectionAnimateContet.offset().top) {
          var animateItems = sectionAnimateContet.find('.animateItem');

          for (i = 0; i < animateItems.length; i++) {
            var item = $(animateItems[i]);
            addAnimation(item, 'active-animate');
          }
        }
      });
    }
  }


  /**
   * Copyright Year
   * @description  Evaluates correct copyright year
   */
  var o = $("#copyright-year");
  if (o.length) {
    o.text(initialDate.getFullYear());
  }

  /**
   * Smooth scrolling
   * @description  Enables a smooth scrolling for Google Chrome (Windows)
   */
  if (plugins.smoothScroll) {
    $.getScript(plugins.smoothScroll);
  }


  /**
   * Responsive Tabs
   * @description Enables Responsive Tabs plugin
   */
  if (plugins.responsiveTabs.length) {
    var i = 0;
    for (i = 0; i < plugins.responsiveTabs.length; i++) {
      var $this = $(plugins.responsiveTabs[i]);
      $this.easyResponsiveTabs({
        type: $this.attr("data-type"),
        tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
      });
    }
  }


  /**
   * WOW
   * @description Enables Wow animation plugin
   */
  if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
    new WOW().init();
  }


  /**
   * @module       Owl carousel
   * @version      2.0.0
   * @author       Bartosz Wojciechowski
   * @license      The MIT License (MIT)
   */
  if (plugins.owl.length) {

    for (i = 0; i < plugins.owl.length; i++) {
      var c = $(plugins.owl[i]),
          responsive = {};

      var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-"],
          values = [0, 480, 768, 992, 1200],
          j, k;

      for (j = 0; j < values.length; j++) {
        responsive[values[j]] = {};
        for (k = j; k >= -1; k--) {
          if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
            responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"));
          }
          if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
            responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"));
          }
          if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
            responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"));
          }
        }
      }

      c.owlCarousel({
        autoplay: c.attr("data-autoplay") === "true",
        loop: c.attr("data-loop") !== "false",
        items: 1,
        dotsContainer: c.attr("data-pagination-class") || false,
        navContainer: c.attr("data-navigation-class") || false,
        mouseDrag: c.attr("data-mouse-drag") !== "false",
        nav: c.attr("data-nav") === "true",
        dots: c.attr("data-dots") === "true",
        dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each")) : false,
        responsive: responsive,
        navText: [],
        onInitialized: function () {
          if (c.attr("data-active")) {
            c.trigger("to.owl.carousel", c.attr("data-active") - 1);
          }

          $(c).next().find('.current-counter').html((this._current + 1));
          c.trigger('resize');

          var length = $(c).find('.owl-item').length,
              activeLength = $(c).find('.active').length,
              slideCount = (length / activeLength) + (activeLength - 1);
          var outputCounter = $(this.$element).attr('data-output-counter');
          $(outputCounter).find('.carousel-count').html(length);
        },
        onTranslate: function () {
          var outputCounter = $(this.$element).attr('data-output-counter');
          $(outputCounter).find('.current-counter').html(this._current + 1);
        },
        onResize: function () {
          var _this = this;

          setTimeout(function () {
            var length = $(_this).find('.owl-item').length,
                activeLength = $(_this).find('.active').length,
                slideCount = (length / activeLength) + (activeLength - 1),
                outputCounter = $(_this).attr('data-output-counter');
            $(outputCounter).find('.carousel-count').html(slideCount);
          }, 200);
        }
      });
    }
  }


  /**
   * RD Navbar
   * @description Enables RD Navbar plugin
   */
  if (plugins.rdNavbar.length) {
    plugins.rdNavbar.RDNavbar({
      stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone")) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
      stickUpOffset: (plugins.rdNavbar.attr("data-stick-up-offset")) ? plugins.rdNavbar.attr("data-stick-up-offset") : 1,
      anchorNavOffset: -120
    });
    if (plugins.rdNavbar.attr("data-body-class")) {
      document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
    }
  }


  /**
   * UI To Top
   * @description Enables ToTop Button
   */
  if (isDesktop) {
    $().UItoTop({
      easingType: 'easeOutQuart',
      containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
    });
  }


  /**
   * RD Parallax
   * @description Enables RD Parallax plugin
   */
  if (plugins.rdParallax.length) {
    var i;
    $.RDParallax();

    if (!isIE && !isMobile) {
      $(window).on("scroll", function () {
        for (i = 0; i < plugins.rdParallax.length; i++) {
          var parallax = $(plugins.rdParallax[i]);
          if (isScrolledIntoView(parallax)) {
            parallax.find(".rd-parallax-inner").css("position", "fixed");
          } else {
            parallax.find(".rd-parallax-inner").css("position", "absolute");
          }
        }
      });
    }

    $("a[href='#']").on("click", function (e) {
      setTimeout(function () {
        $(window).trigger("resize");
      }, 300);
    });
  }

  /**
   * Custom navigation
   * @description  Enable progress bar
   */
  var navigations = document.getElementsByClassName("navigation");
  if (navigations.length) {
    for (i = 0; i < navigations.length; i++) {
      var navigation = $(navigations[i]);
      $window
          .on("scroll load", $.proxy(function () {
            var sectionTop = this.parents(".section-navigation").offset().top;
            var position = $window.scrollTop() - sectionTop + (window.innerHeight / 2);
            this[0].style["top"] = position + "px";
          }, navigation));
    }
  }

  /**
   * JQuery mousewheel plugin
   * @description  Enables jquery mousewheel plugin
   */
  if (plugins.scroller.length) {
    var i;
    for (i = 0; i < plugins.scroller.length; i++) {
      var scrollerItem = $(plugins.scroller[i]);

      scrollerItem.mCustomScrollbar({
        scrollInertia: 0,
        axis: "x",
        theme: "dark-3",
        mouseWheel: {
          enable: false
        },
        callbacks: {
          onInit: function () {

            var _this = scrollerItem;
            setTimeout(function () {
              _this.mCustomScrollbar('scrollTo', '#right-position');
            }, 100);
          }
        },
        advanced: {
          updateOnImageLoad: false,
          autoExpandHorizontalScroll: true,
        }
      })
    }
  }

  /**
   * Section animate
   * @description  Enables animate section effect on scroll
   */
  if (plugins.sectionAnimate.length) {
    if (isDesktop) {
      requestAnimationFrame(animateSection);
    }

    $(window).resize(function () {
      var windowWidth = $(window).width();

      if (isDesktop) {
        //Scrollbar
        windowWidth += 17;

        if (windowWidth <= 991) {
          plugins.sectionAnimate.removeClass('start');
        } else {
          if (!plugins.sectionAnimate.hasClass('start')) {
            plugins.sectionAnimate.addClass('start');
          }
        }
      }
    }).trigger('resize');
  }
});