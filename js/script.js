/**
 * Global variables
 */
"use strict";

(function () {
  var userAgent = navigator.userAgent.toLowerCase(),
    isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false;

  // Unsupported browsers
  if (isIE !== false && isIE < 12) {
    console.warn("[Core] detected IE" + isIE + ", load alert");
    var script = document.createElement("script");
    script.src = "./js/support.js";
    document.querySelector("head").appendChild(script);
  }

  var initialDate = new Date(),

    $document = $(document),
    $window = $(window),
    $html = $("html"),
    $body = $("body"),


    isRtl = $html.attr("dir") === "rtl",
    isDesktop = $html.hasClass("desktop"),
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isNoviBuilder = window.xMode,
    plugins = {
      bootstrapTooltip:        $("[data-bs-toggle='tooltip']"),
      bootstrapTabs:           $(".tabs"),
      captcha:                 $('.recaptcha'),
      rdNavbar:                $(".rd-navbar"),
      mfp:                     $('[data-lightbox]').not('[data-lightbox="gallery"] [data-lightbox]'),
      mfpGallery:              $('[data-lightbox^="gallery"]'),
      wow:                     $(".wow"),
      owl:                     $(".owl-carousel"),
      swiper:                  $('.swiper-container'),
      isotope:                 $(".isotope"),
      slick:                   $('.slick-slider'),
      selectFilter:            $("select"),
      rdInputLabel:            $(".form-label"),
      bootstrapDateTimePicker: $("[data-time-picker]"),
      customWaypoints:         $('[data-custom-scroll-to]'),
      lightGallery:            $("[data-lightgallery='group']"),
      lightGalleryItem:        $("[data-lightgallery='item']"),
      lightDynamicGalleryItem: $("[data-lightgallery='dynamic']"),
      stepper:                 $("input[type='number']"),
      radio:                   $("input[type='radio']"),
      checkbox:                $("input[type='checkbox']"),
      customToggle:            $("[data-custom-toggle]"),
      rdMailForm:              $(".rd-mailform"),
      regula:                  $("[data-constraints]"),
      pageLoader:              $(".page-loader"),
      search:                  $(".rd-search"),
      searchResults:           $('.rd-search-results'),
      pageTitles:              $('.page-title'),
      copyrightYear:           $(".copyright-year"),
      materialParallax:        $(".parallax-container"),
      mailchimp:               $('.mailchimp-mailform'),
      campaignMonitor:         $('.campaign-mailform'),
      maps:                    $('.google-map-container'),
      counter:                 document.querySelectorAll('.counter'),
      progressLinear:          document.querySelectorAll('.progress-linear'),
      countdown:               document.querySelectorAll('.countdown')
    };

  $window.on('load', function () {
    /**
     * Page loader
     * @description Enables Page loader
     */
    if (plugins.pageLoader.length) {
      plugins.pageLoader.addClass("loaded");
      $window.trigger("resize");
    }

    /**
     * Isotope
     * @description Enables Isotope plugin
     */
    if (plugins.isotope.length) {
      var isogroup = [];
      for (var i = 0; i < plugins.isotope.length; i++) {
        var isotopeItem = plugins.isotope[i],
          isotopeInitAttrs = {
            itemSelector: '.isotope-item',
            layoutMode: isotopeItem.getAttribute('data-isotope-layout') ? isotopeItem.getAttribute('data-isotope-layout') : 'masonry',
            filter: '*'
          };

        if (isotopeItem.getAttribute('data-column-width')) {
          isotopeInitAttrs.masonry = {
            columnWidth: parseFloat(isotopeItem.getAttribute('data-column-width'))
          };
        } else if (isotopeItem.getAttribute('data-column-class')) {
          isotopeInitAttrs.masonry = {
            columnWidth: isotopeItem.getAttribute('data-column-class')
          };
        }

        var iso = new Isotope(isotopeItem, isotopeInitAttrs);
        isogroup.push(iso);
      }


      setTimeout(function () {
        for (var i = 0; i < isogroup.length; i++) {
          isogroup[i].element.className += " isotope--loaded";
          isogroup[i].layout();
        }
      }, 200);

      var resizeTimout;

      $("[data-isotope-filter]").on("click", function (e) {
        e.preventDefault();
        var filter = $(this);
        clearTimeout(resizeTimout);
        filter.parents(".isotope-filters").find('.active').removeClass("active");
        filter.addClass("active");
        var iso = $('.isotope[data-isotope-group="' + this.getAttribute("data-isotope-group") + '"]'),
          isotopeAttrs = {
            itemSelector: '.isotope-item',
            layoutMode: iso.attr('data-isotope-layout') ? iso.attr('data-isotope-layout') : 'masonry',
            filter: this.getAttribute("data-isotope-filter") === '*' ? '*' : '[data-filter*="' + this.getAttribute("data-isotope-filter") + '"]'
          };
        if (iso.attr('data-column-width')) {
          isotopeAttrs.masonry = {
            columnWidth: parseFloat(iso.attr('data-column-width'))
          };
        } else if (iso.attr('data-column-class')) {
          isotopeAttrs.masonry = {
            columnWidth: iso.attr('data-column-class')
          };

        }
        iso.isotope(isotopeAttrs);
      }).eq(0).trigger("click")
    }

    /**
     * Material Parallax
     * @description Enables Material Parallax plugin
     */
    if (plugins.materialParallax.length) {
      if (!isNoviBuilder && !isIE && !isMobile) {
        plugins.materialParallax.parallax();
      } else {
        for (var i = 0; i < plugins.materialParallax.length; i++) {
          var parallax = $(plugins.materialParallax[i]),
            imgPath = parallax.data("parallax-img");

          parallax.css({
            "background-image": 'url(' + imgPath + ')',
            "background-size": "cover"
          });
        }
      }
    }

    // Counter
    if (plugins.counter) {
      for (let i = 0; i < plugins.counter.length; i++) {
        let
          node = plugins.counter[i],
          counter = aCounter({
            node: node,
            duration: node.getAttribute('data-duration') || 1000
          }),
          scrollHandler = (function () {
            if (Util.inViewport(this) && !this.classList.contains('animated-first')) {
              this.counter.run();
              this.classList.add('animated-first');
            }
          }).bind(node),
          blurHandler = (function () {
            this.counter.params.to = parseInt(this.textContent, 10);
            this.counter.run();
          }).bind(node);

        if (isNoviBuilder) {
          node.counter.run();
          node.addEventListener('blur', blurHandler);
        } else {
          scrollHandler();
          window.addEventListener('scroll', scrollHandler);
        }
      }
    }

    // Progress Bar
    if (plugins.progressLinear) {
      for (let i = 0; i < plugins.progressLinear.length; i++) {
        let
          container = plugins.progressLinear[i],
          counter = aCounter({
            node: container.querySelector('.progress-linear-counter'),
            duration: container.getAttribute('data-duration') || 1000,
            onStart: function () {
              this.custom.bar.style.width = this.params.to + '%';
            }
          });

        counter.custom = {
          container: container,
          bar: container.querySelector('.progress-linear-bar'),
          onScroll: (function () {
            if ((Util.inViewport(this.custom.container) && !this.custom.container.classList.contains('animated')) || isNoviBuilder) {
              this.run();
              this.custom.container.classList.add('animated');
            }
          }).bind(counter),
          onBlur: (function () {
            this.params.to = parseInt(this.params.node.textContent, 10);
            this.run();
          }).bind(counter)
        };

        if (isNoviBuilder) {
          counter.run();
          counter.params.node.addEventListener('blur', counter.custom.onBlur);
        } else {
          counter.custom.onScroll();
          document.addEventListener('scroll', counter.custom.onScroll);
        }
      }
    }
  })
  /**
   * Initialize All Scripts
   */
  $(function () {
    /**
     * @desc Initialize the gallery with set of images
     * @param {object} itemsToInit - jQuery object
     * @param {string} addClass - additional gallery class
     */
    function initLightGallery(itemsToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemsToInit).lightGallery({
          thumbnail: $(itemsToInit).attr("data-lg-thumbnail") === "false",
          selector: "[data-lightgallery='item']",
          autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
          pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
          addClass: addClass,
          mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
          loop: $(itemsToInit).attr("data-lg-loop") !== "false"
        });
      }
    }

    /**
     * @desc Initialize the gallery with dynamic addition of images
     * @param {object} itemsToInit - jQuery object
     * @param {string} addClass - additional gallery class
     */
    function initDynamicLightGallery(itemsToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemsToInit).on("click", function () {
          $(itemsToInit).lightGallery({
            thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
            selector: "[data-lightgallery='item']",
            autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
            pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
            addClass: addClass,
            mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
            loop: $(itemsToInit).attr("data-lg-loop") !== "false",
            dynamic: true,
            dynamicEl: JSON.parse($(itemsToInit).attr("data-lg-dynamic-elements")) || []
          });
        });
      }
    }

    /**
     * @desc Initialize the gallery with one image
     * @param {object} itemToInit - jQuery object
     * @param {string} addClass - additional gallery class
     */
    function initLightGalleryItem(itemToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemToInit).lightGallery({
          selector: "this",
          addClass: addClass,
          counter: false,
          youtubePlayerParams: {
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
            controls: 0
          },
          vimeoPlayerParams: {
            byline: 0,
            portrait: 0
          }
        });
      }
    }

    /**
     * @desc Google map function for getting latitude and longitude
     */
    function getLatLngObject(str, marker, map, callback) {
      let coordinates = {};
      try {
        coordinates = JSON.parse(str);
        callback(new google.maps.LatLng(
          coordinates.lat,
          coordinates.lng
        ), marker, map)
      } catch (e) {
        map.geocoder.geocode({'address': str}, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            let latitude = results[0].geometry.location.lat();
            let longitude = results[0].geometry.location.lng();

            callback(new google.maps.LatLng(
              parseFloat(latitude),
              parseFloat(longitude)
            ), marker, map)
          }
        })
      }
    }

    /**
     * @desc Initialize Google maps
     */
    function initMaps() {
      let key;

      for (let i = 0; i < plugins.maps.length; i++) {
        if (plugins.maps[i].hasAttribute("data-key")) {
          key = plugins.maps[i].getAttribute("data-key");
          break;
        }
      }

      $.getScript('//maps.google.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'libraries=geometry,places&v=quarterly', function () {
        let geocoder = new google.maps.Geocoder;
        for (let i = 0; i < plugins.maps.length; i++) {
          let zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
          let styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
          let center = plugins.maps[i].getAttribute("data-center") || "New York";

          // Initialize map
          let map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
            zoom: zoom,
            styles: styles,
            scrollwheel: false,
            center: {
              lat: 0,
              lng: 0
            }
          });

          // Add map object to map node
          plugins.maps[i].map = map;
          plugins.maps[i].geocoder = geocoder;
          plugins.maps[i].keySupported = true;
          plugins.maps[i].google = google;

          // Get Center coordinates from attribute
          getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
            mapElement.map.setCenter(location);
          });

          // Add markers from google-map-markers array
          let markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

          if (markerItems.length) {
            let markers = [];
            for (let j = 0; j < markerItems.length; j++) {
              let markerElement = markerItems[j];
              getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function (location, markerElement, mapElement) {
                let icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
                let activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
                let info = markerElement.getAttribute("data-description") || "";
                let infoWindow = new google.maps.InfoWindow({
                  content: info
                });
                markerElement.infoWindow = infoWindow;
                let markerData = {
                  position: location,
                  map: mapElement.map
                }
                if (icon) {
                  markerData.icon = icon;
                }
                let marker = new google.maps.Marker(markerData);
                markerElement.gmarker = marker;
                markers.push({
                  markerElement: markerElement,
                  infoWindow: infoWindow
                });
                marker.isActive = false;
                // Handle infoWindow close click
                google.maps.event.addListener(infoWindow, 'closeclick', (function (markerElement, mapElement) {
                  let markerIcon = null;
                  markerElement.gmarker.isActive = false;
                  markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
                  markerElement.gmarker.setIcon(markerIcon);
                }).bind(this, markerElement, mapElement));


                // Set marker active on Click and open infoWindow
                google.maps.event.addListener(marker, 'click', (function (markerElement, mapElement) {
                  let markerIcon;
                  if (markerElement.infoWindow.getContent().length === 0) return;
                  let gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
                  for (let k = 0; k < markers.length; k++) {
                    if (markers[k].markerElement === markerElement) {
                      currentInfoWindow = markers[k].infoWindow;
                    }
                    gMarker = markers[k].markerElement.gmarker;
                    if (gMarker.isActive && markers[k].markerElement !== markerElement) {
                      gMarker.isActive = false;
                      markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
                      gMarker.setIcon(markerIcon);
                      markers[k].infoWindow.close();
                    }
                  }

                  currentMarker.isActive = !currentMarker.isActive;
                  if (currentMarker.isActive) {
                    if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")) {
                      currentMarker.setIcon(markerIcon);
                    }

                    currentInfoWindow.open(map, marker);
                  } else {
                    if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")) {
                      currentMarker.setIcon(markerIcon);
                    }
                    currentInfoWindow.close();
                  }
                }).bind(this, markerElement, mapElement))
              })
            }
          }
        }
      });
    }


    /**
     * Is Mac os
     * @description  add additional class on html if mac os.
     */
    if (navigator.platform.match(/(Mac)/i)) $html.addClass("mac");

    /**
     * Wrapper to eliminate json errors
     * @param {string} str - JSON string
     * @returns {object} - parsed or empty object
     */
    function parseJSON(str) {
      try {
        if (str) return JSON.parse(str);
        else return {};
      } catch (error) {
        console.warn(error);
        return {};
      }
    }

    /**
     * @desc Sets slides background images from attribute 'data-slide-bg'
     * @param {object} swiper - swiper instance
     */
    function setBackgrounds(swiper) {
      let swipersBg = swiper.el.querySelectorAll('[data-slide-bg]');

      for (let i = 0; i < swipersBg.length; i++) {
        let swiperBg = swipersBg[i];
        swiperBg.style.backgroundImage = 'url(' + swiperBg.getAttribute('data-slide-bg') + ')';
      }
    }

    /**
     * toggleSwiperCaptionAnimation
     * @description  toggle swiper animations on active slides
     */
    function toggleSwiperCaptionAnimation(swiper) {
      let prevSlide = $(swiper.$el[0]),
        nextSlide = $(swiper.slides[swiper.activeIndex]);

      prevSlide
        .find("[data-caption-animate]")
        .each(function () {
          let $this = $(this);
          $this
            .removeClass("animated")
            .removeClass($this.attr("data-caption-animate"))
            .addClass("not-animated");
        });

      nextSlide
        .find("[data-caption-animate]")
        .each(function () {
          let $this = $(this),
            delay = $this.attr("data-caption-delay");


          if (!isNoviBuilder) {
            setTimeout(function () {
              $this
                .removeClass("not-animated")
                .addClass($this.attr("data-caption-animate"))
                .addClass("animated");
            }, delay ? parseInt(delay) : 0);
          } else {
            $this
              .removeClass("not-animated")
          }
        });
    }

    /**
     * isScrolledIntoView
     * @description  check the element whas been scrolled into the view
     */
    function isScrolledIntoView(elem) {
      if (!isNoviBuilder) {
        return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
      } else {
        return true;
      }
    }

    /**
     * initOnView
     * @description  calls a function when element has been scrolled into the view
     */
    function lazyInit(element, func) {
      $document.on('scroll', function () {
        if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
          func.call();
          element.addClass('lazy-loaded');
        }
      }).trigger("scroll");
    }

    /**
     * Live Search
     * @description  create live search results
     */
    function liveSearch(options) {
      $('#' + options.live).removeClass('cleared').html();
      options.current++;
      options.spin.addClass('loading');
      $.get(handler, {
        s: decodeURI(options.term),
        liveSearch: options.live,
        dataType: "html",
        liveCount: options.liveCount,
        filter: options.filter,
        template: options.template
      }, function (data) {
        options.processed++;
        var live = $('#' + options.live);
        if (options.processed == options.current && !live.hasClass('cleared')) {
          live.find('> #search-results').removeClass('active');
          live.html(data);
          setTimeout(function () {
            live.find('> #search-results').addClass('active');
          }, 50);
        }
        options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading');
      })
    }

    /**
     * @desc Attach form validation to elements
     * @param {object} elements - jQuery object
     */
    function attachFormValidator(elements) {
      // Custom validator - phone number
      regula.custom({
        name:           'PhoneNumber',
        defaultMessage: 'Invalid phone number format',
        validator:      function () {
          if (this.value === '') return true;
          else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
        }
      });

      for (let i = 0; i < elements.length; i++) {
        let o = $(elements[i]), v;
        o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
        v = o.parent().find(".form-validation");
        if (v.is(":last-child")) o.addClass("form-control-last-child");
      }

      elements.on('input change propertychange blur', function (e) {
        let $this = $(this), results;

        if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
        if ($this.parents('.rd-mailform').hasClass('success')) return;

        if ((results = $this.regula('validate')).length) {
          for (let i = 0; i < results.length; i++) {
            $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
          }
        } else {
          $this.siblings(".form-validation").text("").parent().removeClass("has-error")
        }
      }).regula('bind');

      let regularConstraintsMessages = [
        {
          type:       regula.Constraint.Required,
          newMessage: "The text field is required."
        },
        {
          type:       regula.Constraint.Email,
          newMessage: "The email is not a valid email."
        },
        {
          type:       regula.Constraint.Numeric,
          newMessage: "Only numbers are required"
        },
        {
          type:       regula.Constraint.Selected,
          newMessage: "Please choose an option."
        }
      ];


      for (let i = 0; i < regularConstraintsMessages.length; i++) {
        let regularConstraint = regularConstraintsMessages[i];

        regula.override({
          constraintType: regularConstraint.type,
          defaultMessage: regularConstraint.newMessage
        });
      }
    }

    /**
     * @desc Check if all elements pass validation
     * @param {object} elements - object of items for validation
     * @param {object} captcha - captcha object for validation
     * @return {boolean}
     */
    function isValidated(elements, captcha) {
      let results, errors = 0;

      if (elements.length) {
        for (let j = 0; j < elements.length; j++) {

          let $input = $(elements[j]);
          if ((results = $input.regula('validate')).length) {
            for (let k = 0; k < results.length; k++) {
              errors++;
              $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
            }
          } else {
            $input.siblings(".form-validation").text("").parent().removeClass("has-error")
          }
        }

        if (captcha) {
          if (captcha.length) {
            return validateReCaptcha(captcha) && errors === 0
          }
        }

        return errors === 0;
      }
      return true;
    }


    /**
     * @desc Validate google reCaptcha
     * @param {object} captcha - captcha object for validation
     * @return {boolean}
     */
    function validateReCaptcha(captcha) {
      let captchaToken = captcha.find('.g-recaptcha-response').val();

      if (captchaToken.length === 0) {
        captcha
          .siblings('.form-validation')
          .html('Please, prove that you are not robot.')
          .addClass('active');
        captcha
          .closest('.form-wrap')
          .addClass('has-error');

        captcha.on('propertychange', function () {
          let $this = $(this),
            captchaToken = $this.find('.g-recaptcha-response').val();

          if (captchaToken.length > 0) {
            $this
              .closest('.form-wrap')
              .removeClass('has-error');
            $this
              .siblings('.form-validation')
              .removeClass('active')
              .html('');
            $this.off('propertychange');
          }
        });

        return false;
      }

      return true;
    }


    /**
     * @desc Initialize Google reCaptcha
     */
    window.onloadCaptchaCallback = function () {
      for (let i = 0; i < plugins.captcha.length; i++) {
        let
          $captcha = $(plugins.captcha[i]),
          resizeHandler = (function () {
            let
              frame = this.querySelector('iframe'),
              inner = this.firstElementChild,
              inner2 = inner.firstElementChild,
              containerRect = null,
              frameRect = null,
              scale = null;

            inner2.style.transform = '';
            inner.style.height = 'auto';
            inner.style.width = 'auto';

            containerRect = this.getBoundingClientRect();
            frameRect = frame.getBoundingClientRect();
            scale = containerRect.width / frameRect.width;

            if (scale < 1) {
              inner2.style.transform = 'scale(' + scale + ')';
              inner.style.height = (frameRect.height * scale) + 'px';
              inner.style.width = (frameRect.width * scale) + 'px';
            }
          }).bind(plugins.captcha[i]);

        grecaptcha.render(
          $captcha.attr('id'),
          {
            sitekey:  $captcha.attr('data-sitekey'),
            size:     $captcha.attr('data-size') ? $captcha.attr('data-size') : 'normal',
            theme:    $captcha.attr('data-theme') ? $captcha.attr('data-theme') : 'light',
            callback: function () {
              $('.recaptcha').trigger('propertychange');
            }
          }
        );

        $captcha.after("<span class='form-validation'></span>");

        if (plugins.captcha[i].hasAttribute('data-auto-size')) {
          resizeHandler();
          window.addEventListener('resize', resizeHandler);
        }
      }
    };

    /**
     * Google ReCaptcha
     * @description Enables Google ReCaptcha
     */
    if (plugins.captcha.length) {
      $.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
    }

    /**
     * Init Bootstrap tooltip
     * @description  calls a function when need to init bootstrap tooltips
     */
    function initBootstrapTooltip(tooltipPlacement) {
      if (window.innerWidth < 576) {
        plugins.bootstrapTooltip.tooltip('dispose');
        plugins.bootstrapTooltip.tooltip({
          placement: 'bottom'
        });
      } else {
        plugins.bootstrapTooltip.tooltip('dispose');
        plugins.bootstrapTooltip.tooltip({
          placement: tooltipPlacement
        });
      }
    }

    /**
     * Google map
     */
    if (plugins.maps.length) {
      lazyInit(plugins.maps, initMaps);
    }

    /**
     * Copyright Year
     * @description  Evaluates correct copyright year
     */
    if (plugins.copyrightYear.length) {
      plugins.copyrightYear.text(initialDate.getFullYear());
    }

    /**
     * IE Polyfills
     * @description  Adds some loosing functionality to IE browsers
     */
    if (isIE) {
      if (isIE === 12) $html.addClass("ie-edge");
      if (isIE === 11) $html.addClass("ie-11");
      if (isIE < 10) $html.addClass("lt-ie-10");
      if (isIE < 11) $html.addClass("ie-10");
    }

    /**
     * Bootstrap Tooltips
     * @description Activate Bootstrap Tooltips
     */
    if (plugins.bootstrapTooltip.length) {
      var tooltipPlacement = plugins.bootstrapTooltip.attr('data-bs-placement');
      initBootstrapTooltip(tooltipPlacement);

      $window.on('resize orientationchange', function () {
        initBootstrapTooltip(tooltipPlacement);
      });
    }

    /**
     * @module       Magnific Popup
     * @author       Dmitry Semenov
     * @see          http://dimsemenov.com/plugins/magnific-popup/
     * @version      v1.0.0
     */
    if (!isNoviBuilder && (plugins.mfp.length || plugins.mfpGallery.length)) {
      if (plugins.mfp.length) {
        for (var i = 0; i < plugins.mfp.length; i++) {
          var mfpItem = plugins.mfp[i];

          $(mfpItem).magnificPopup({
            type: mfpItem.getAttribute("data-lightbox")
          });
        }
      }
      if (plugins.mfpGallery.length) {
        for (var i = 0; i < plugins.mfpGallery.length; i++) {
          var mfpGalleryItem = $(plugins.mfpGallery[i]).find('[data-lightbox]');

          for (var c = 0; c < mfpGalleryItem.length; c++) {
            $(mfpGalleryItem).addClass("mfp-" + $(mfpGalleryItem).attr("data-lightbox"));
          }

          mfpGalleryItem.end()
            .magnificPopup({
              delegate: '[data-lightbox]',
              type: "image",
              gallery: {
                enabled: true
              }
            });
        }
      }
    }


    /**
     * Bootstrap Date time picker
     */
    if (!isNoviBuilder && plugins.bootstrapDateTimePicker.length) {
      for (var i = 0; i < plugins.bootstrapDateTimePicker.length; i++) {
        var $dateTimePicker = $(plugins.bootstrapDateTimePicker[i]);
        var options = {};

        options['format'] = 'dddd DD MMMM YYYY - HH:mm';
        if ($dateTimePicker.attr("data-time-picker") == "date") {
          options['format'] = 'dddd DD MMMM YYYY';
          options['minDate'] = new Date();
        } else if ($dateTimePicker.attr("data-time-picker") == "time") {
          options['format'] = 'HH:mm';
        }

        options["time"] = ($dateTimePicker.attr("data-time-picker") != "date");
        options["date"] = ($dateTimePicker.attr("data-time-picker") != "time");
        options["shortTime"] = true;

        $dateTimePicker.bootstrapMaterialDatePicker(options);
      }
    }

    /**
     * Select2
     * @description Enables select2 plugin
     */
    if (plugins.selectFilter.length) {
      for (var i = 0; i < plugins.selectFilter.length; i++) {
        var select = $(plugins.selectFilter[i]);

        select.select2({
          theme: select.attr('data-custom-theme') ? select.attr('data-custom-theme') : "bootstrap"
        }).next().addClass(select.attr("class").match(/(input-sm)|(input-lg)|($)/i).toString().replace(new RegExp(",", 'g'), " "));
      }
    }

    /**
     * Stepper
     * @description Enables Stepper Plugin
     */
    if (plugins.stepper.length) {
      plugins.stepper.stepper({
        labels: {
          up: "",
          down: ""
        }
      });
    }

    /**
     * Radio
     * @description Add custom styling options for input[type="radio"]
     */
    if (plugins.radio.length) {
      for (let i = 0; i < plugins.radio.length; i++) {
        $(plugins.radio[i]).addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
      }
    }

    /**
     * Checkbox
     * @description Add custom styling options for input[type="checkbox"]
     */
    if (plugins.checkbox.length) {
      for (let i = 0; i < plugins.checkbox.length; i++) {
        $(plugins.checkbox[i]).addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
      }
    }


    /**
     * UI To Top
     * @description Enables ToTop Button
     */
    if (isDesktop && !isNoviBuilder) {
      $().UItoTop({
        easingType: 'easeOutQuart',
        containerClass: 'ui-to-top fa fa-angle-up',
        scrollSpeed: 100
      });
    }

    /**
     * RD Navbar
     * @description Enables RD Navbar plugin
     */
    if (plugins.rdNavbar.length) {
      var aliaces, i, j, len, value, values, responsiveNavbar;

      aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"];
      values = [0, 576, 768, 992, 1200, 1600];
      responsiveNavbar = {};

      for (i = j = 0, len = values.length; j < len; i = ++j) {
        value = values[i];
        if (!responsiveNavbar[values[i]]) {
          responsiveNavbar[values[i]] = {};
        }
        if (plugins.rdNavbar.attr('data' + aliaces[i] + 'layout')) {
          responsiveNavbar[values[i]].layout = plugins.rdNavbar.attr('data' + aliaces[i] + 'layout');
        }
        if (plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout')) {
          responsiveNavbar[values[i]]['deviceLayout'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout');
        }
        if (plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on')) {
          responsiveNavbar[values[i]]['focusOnHover'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on') === 'true';
        }
        if (plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height')) {
          responsiveNavbar[values[i]]['autoHeight'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height') === 'true';
        }

        if (isNoviBuilder) {
          responsiveNavbar[values[i]]['stickUp'] = false;
        } else if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up')) {
          responsiveNavbar[values[i]]['stickUp'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up') === 'true';
        }

        if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset')) {
          responsiveNavbar[values[i]]['stickUpOffset'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset');
        }
      }

      plugins.rdNavbar.RDNavbar({
        anchorNav: !isNoviBuilder,
        stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
        responsive: responsiveNavbar,
        callbacks: {
          onStuck: function () {
            var navbarSearch = this.$element.find('.rd-search input');

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange');
            }
          },
          onDropdownOver: function () {
            return !isNoviBuilder;
          },
          onUnstuck: function () {
            if (this.$clone === null)
              return;

            var navbarSearch = this.$clone.find('.rd-search input');

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange');
              navbarSearch.trigger('blur');
            }

          }
        }
      });


      if (plugins.rdNavbar.attr("data-body-class")) {
        document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
      }
    }


    // Swiper
    if (plugins.swiper.length) {
      for (let i = 0; i < plugins.swiper.length; i++) {

        let
          node = plugins.swiper[i],
          params = parseJSON(node.getAttribute('data-swiper')),
          defaults = {
            speed: 1000,
            loop: node.getAttribute('data-loop') !== 'false',
            effect: node.hasAttribute('data-slide-effect') ? node.getAttribute('data-slide-effect') : 'slide',
            pagination: {
              el: '.swiper-pagination',
              clickable: true
            },
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev'
            },
            autoplay: {
              enabled: node.getAttribute('data-autoplay') !== 'false',
              delay: !isNaN(Number(node.getAttribute('data-autoplay'))) ? node.getAttribute('data-autoplay') : 5000,
            },
            simulateTouch: node.getAttribute('data-simulate-touch') !== 'false',
          },
          xMode = {
            autoplay: false,
            loop: false,
            simulateTouch: false
          };

        params.on = {
          init: function () {
            setBackgrounds(this);
            toggleSwiperCaptionAnimation(this);

            // Real Previous Index must be set recent
            this.on('slideChangeTransitionEnd', function () {
              toggleSwiperCaptionAnimation(this);
            });
          }
        };

        new Swiper(node, Util.merge(isNoviBuilder ? [defaults, params, xMode] : [defaults, params]));
      }
    }

    /**
     * RD Search
     * @description Enables search
     */
    if (plugins.search.length || plugins.searchResults) {
      var handler = "bat/rd-search.php";
      var defaultTemplate = '<h6 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h6>' +
        '<p>...#{token}...</p>' +
        '<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
      var defaultFilter = '*.html';

      if (plugins.search.length) {

        for (i = 0; i < plugins.search.length; i++) {
          var searchItem = $(plugins.search[i]),
            options = {
              element: searchItem,
              filter: (searchItem.attr('data-search-filter')) ? searchItem.attr('data-search-filter') : defaultFilter,
              template: (searchItem.attr('data-search-template')) ? searchItem.attr('data-search-template') : defaultTemplate,
              live: (searchItem.attr('data-search-live')) ? searchItem.attr('data-search-live') : false,
              liveCount: (searchItem.attr('data-search-live-count')) ? parseInt(searchItem.attr('data-search-live-count')) : 4,
              current: 0, processed: 0, timer: {}
            };

          if ($('.rd-navbar-search-toggle').length) {
            var toggle = $('.rd-navbar-search-toggle');
            toggle.on('click', function () {
              if (!($(this).hasClass('active'))) {
                searchItem.find('input').val('').trigger('propertychange');
              }
            });
          }

          if (options.live) {
            var clearHandler = false;

            searchItem.find('input').on("input propertychange", $.proxy(function () {
              this.term = this.element.find('input').val().trim();
              this.spin = this.element.find('.input-group-addon');

              clearTimeout(this.timer);

              if (this.term.length > 2) {
                this.timer = setTimeout(liveSearch(this), 200);

                if (clearHandler == false) {
                  clearHandler = true;

                  $("body").on("click", function (e) {
                    if ($(e.toElement).parents('.rd-search').length == 0) {
                      $('#rd-search-results-live').addClass('cleared').html('');
                    }
                  })
                }

              } else if (this.term.length == 0) {
                $('#' + this.live).addClass('cleared').html('');
              }
            }, options, this));
          }

          searchItem.submit($.proxy(function () {
            $('<input />').attr('type', 'hidden')
              .attr('name', "filter")
              .attr('value', this.filter)
              .appendTo(this.element);
            return true;
          }, options, this))
        }
      }

      if (plugins.searchResults.length) {
        var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
        var match = regExp.exec(location.search);

        if (match != null) {
          $.get(handler, {
            s: decodeURI(match[1]),
            dataType: "html",
            filter: match[2],
            template: defaultTemplate,
            live: ''
          }, function (data) {
            plugins.searchResults.html(data);
          })
        }
      }
    }

    /**
     * Slick carousel
     * @description  Enable Slick carousel plugin
     */
    /**
     * Slick carousel
     * @description  Enable Slick carousel plugin
     */
    if (plugins.slick.length) {
      for (var i = 0; i < plugins.slick.length; i++) {
        var $slickItem = $(plugins.slick[i]);

        $slickItem.slick({
          slidesToScroll: parseInt($slickItem.attr('data-slide-to-scroll'), 10) || 1,
          asNavFor: $slickItem.attr('data-for') || false,
          dots: $slickItem.attr("data-dots") === "true",
          infinite: isNoviBuilder ? false : $slickItem.attr("data-loop") === "true",
          focusOnSelect: true,
          arrows: $slickItem.attr("data-arrows") === "true",
          swipe: $slickItem.attr("data-swipe") === "true",
          autoplay: $slickItem.attr("data-autoplay") === "true",
          vertical: $slickItem.attr("data-vertical") === "true",
          centerMode: $slickItem.attr("data-center-mode") === "true",
          centerPadding: $slickItem.attr("data-center-padding") ? $slickItem.attr("data-center-padding") : '0.50',
          mobileFirst: true,
          rtl: isRtl,
          responsive: [
            {
              breakpoint: 0,
              settings: {
                slidesToShow: parseInt($slickItem.attr('data-items'), 10) || 1
              }
            },
            {
              breakpoint: 576,
              settings: {
                slidesToShow: parseInt($slickItem.attr('data-sm-items'), 10) || 1
              }
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: parseInt($slickItem.attr('data-md-items'), 10) || 1
              }
            },
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: parseInt($slickItem.attr('data-lg-items'), 10) || 1
              }
            },
            {
              breakpoint: 1600,
              settings: {
                slidesToShow: parseInt($slickItem.attr('data-xl-items'), 10) || 1
              }
            }
          ]
        })
          .on('afterChange', function (event, slick, currentSlide, nextSlide) {
            var $this = $(this),
              childCarousel = $this.attr('data-child');

            if (childCarousel) {
              $(childCarousel + ' .slick-slide').removeClass('slick-current');
              $(childCarousel + ' .slick-slide').eq(currentSlide).addClass('slick-current');
            }
          });

      }
    }

    /**
     * Owl carousel
     * @description Enables Owl carousel plugin
     */
    if (plugins.owl.length) {
      for (var i = 0; i < plugins.owl.length; i++) {
        var c = $(plugins.owl[i]);
        plugins.owl[i] = c;

        initOwlCarousel(c);
      }
    }

    /**
     * initOwlCarousel
     * @description  Init owl carousel plugin
     */
    function initOwlCarousel(c) {
      var aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"],
        values = [0, 576, 768, 992, 1200, 1600],
        responsive = {};

      for (var j = 0; j < values.length; j++) {
        responsive[values[j]] = {};
        for (var k = j; k >= -1; k--) {
          if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
            responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
          }
          if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
            responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
          }
          if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
            responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
          }
        }
      }

      // Create custom Pagination
      if (c.attr('data-dots-custom')) {
        c.on("initialized.owl.carousel", function (event) {
          var carousel = $(event.currentTarget),
            customPag = $(carousel.attr("data-dots-custom")),
            active = 0;

          if (carousel.attr('data-active')) {
            active = parseInt(carousel.attr('data-active'));
          }

          carousel.trigger('to.owl.carousel', [active, 300, true]);
          customPag.find("[data-owl-item='" + active + "']").addClass("active");

          customPag.find("[data-owl-item]").on('click', function (e) {
            e.preventDefault();
            carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item")), 300, true]);
          });

          carousel.on("translate.owl.carousel", function (event) {
            customPag.find(".active").removeClass("active");
            customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
          });
        });
      }

      // Create custom Numbering
      if (typeof (c.attr("data-numbering")) !== 'undefined') {
        var numberingObject = $(c.attr("data-numbering"));

        c.on('initialized.owl.carousel changed.owl.carousel', function (numberingObject) {
          return function (e) {
            if (!e.namespace) return;
            numberingObject.find('.numbering-current').text(e.item.index + 1);
            numberingObject.find('.numbering-count').text(e.item.count);
          };
        }(numberingObject));
      }

      c.owlCarousel({
        autoplay: isNoviBuilder ? false : c.attr("data-autoplay") === "true",
        loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
        items: 1,
        rtl: isRtl,
        center: c.attr("data-center") === "true",
        dotsContainer: c.attr("data-pagination-class") || false,
        navContainer: c.attr("data-navigation-class") || false,
        mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
        nav: c.attr("data-nav") === "true",
        dots: c.attr("data-dots") === "true",
        dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
        animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
        animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
        responsive: responsive,
        navText: function () {
          try {
            return JSON.parse(c.attr("data-nav-text"));
          } catch (e) {
            return [];
          }
        }(),
        navClass: function () {
          try {
            return JSON.parse(c.attr("data-nav-class"));
          } catch (e) {
            return ['owl-prev', 'owl-next'];
          }
        }()
      });
    }

    /**
     * RD Input Label
     * @description Enables RD Input Label Plugin
     */
    if (plugins.rdInputLabel.length) {
      plugins.rdInputLabel.RDInputLabel();
    }

    /**
     * Regula
     * @description Enables Regula plugin
     */
    if (plugins.regula.length) {
      attachFormValidator(plugins.regula);
    }

    // MailChimp Ajax subscription
    if (plugins.mailchimp.length) {
      for (let i = 0; i < plugins.mailchimp.length; i++) {
        let $mailchimpItem = $(plugins.mailchimp[i]),
          $email = $mailchimpItem.find('input[type="email"]');

        // Required by MailChimp
        $mailchimpItem.attr('novalidate', 'true');
        $email.attr('name', 'EMAIL');

        $mailchimpItem.on('submit', $.proxy(function ($email, event) {
          event.preventDefault();

          let $this = this;

          let data = {},
            url = $this.attr('action').replace('/post?', '/post-json?').concat('&c=?'),
            dataArray = $this.serializeArray(),
            $output = $("#" + $this.attr("data-form-output"));

          for (i = 0; i < dataArray.length; i++) {
            data[dataArray[i].name] = dataArray[i].value;
          }

          $.ajax({
            data:       data,
            url:        url,
            dataType:   'jsonp',
            error:      function (resp, text) {
              $output.html('Server error: ' + text);

              setTimeout(function () {
                $output.removeClass("active");
              }, 4000);
            },
            success:    function (resp) {
              $output.html(resp.msg).addClass('active');
              $email[0].value = '';
              let $label = $('[for="' + $email.attr('id') + '"]');
              if ($label.length) $label.removeClass('focus not-empty');

              setTimeout(function () {
                $output.removeClass("active");
              }, 6000);
            },
            beforeSend: function (data) {
              let isNoviBuilder = window.xMode;

              let isValidated = (function () {
                let results, errors = 0;
                let elements = $this.find('[data-constraints]');
                let captcha = null;
                if (elements.length) {
                  for (let j = 0; j < elements.length; j++) {

                    let $input = $(elements[j]);
                    if ((results = $input.regula('validate')).length) {
                      for (let k = 0; k < results.length; k++) {
                        errors++;
                        $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
                      }
                    } else {
                      $input.siblings(".form-validation").text("").parent().removeClass("has-error")
                    }
                  }

                  if (captcha) {
                    if (captcha.length) {
                      return validateReCaptcha(captcha) && errors === 0
                    }
                  }

                  return errors === 0;
                }
                return true;
              })();

              // Stop request if builder or inputs are invalide
              if (isNoviBuilder || !isValidated)
                return false;

              $output.html('Submitting...').addClass('active');
            }
          });

          return false;
        }, $mailchimpItem, $email));
      }
    }

    // Campaign Monitor ajax subscription
    if (plugins.campaignMonitor.length) {
      for (let i = 0; i < plugins.campaignMonitor.length; i++) {
        let $campaignItem = $(plugins.campaignMonitor[i]);

        $campaignItem.on('submit', $.proxy(function (e) {
          let data = {},
            url = this.attr('action'),
            dataArray = this.serializeArray(),
            $output = $("#" + plugins.campaignMonitor.attr("data-form-output")),
            $this = $(this);

          for (i = 0; i < dataArray.length; i++) {
            data[dataArray[i].name] = dataArray[i].value;
          }

          $.ajax({
            data:       data,
            url:        url,
            dataType:   'jsonp',
            error:      function (resp, text) {
              $output.html('Server error: ' + text);

              setTimeout(function () {
                $output.removeClass("active");
              }, 4000);
            },
            success:    function (resp) {
              $output.html(resp.Message).addClass('active');

              setTimeout(function () {
                $output.removeClass("active");
              }, 6000);
            },
            beforeSend: function (data) {
              // Stop request if builder or inputs are invalide
              if (isNoviBuilder || !isValidated($this.find('[data-constraints]')))
                return false;

              $output.html('Submitting...').addClass('active');
            }
          });

          // Clear inputs after submit
          let inputs = $this[0].getElementsByTagName('input');
          for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
            let label = document.querySelector('[for="' + inputs[i].getAttribute('id') + '"]');
            if (label) label.classList.remove('focus', 'not-empty');
          }

          return false;
        }, $campaignItem));
      }
    }

    // RD Mailform
    if (plugins.rdMailForm.length) {
      let i, j, k,
        msg = {
          'MF000': 'Successfully sent!',
          'MF001': 'Recipients are not set!',
          'MF002': 'Form will not work locally!',
          'MF003': 'Please, define email field in your form!',
          'MF004': 'Please, define type of your form!',
          'MF254': 'Something went wrong with PHPMailer!',
          'MF255': 'Aw, snap! Something went wrong.'
        };

      for (i = 0; i < plugins.rdMailForm.length; i++) {
        let $form = $(plugins.rdMailForm[i]),
          formHasCaptcha = false;

        $form.attr('novalidate', 'novalidate').ajaxForm({
          data:         {
            "form-type": $form.attr("data-form-type") || "contact",
            "counter":   i
          },
          beforeSubmit: function (arr, $form, options) {
            if (isNoviBuilder)
              return;

            let form = $(plugins.rdMailForm[this.extraData.counter]),
              inputs = form.find("[data-constraints]"),
              output = $("#" + form.attr("data-form-output")),
              captcha = form.find('.recaptcha'),
              captchaFlag = true;

            output.removeClass("active error success");

            if (isValidated(inputs, captcha)) {

              // veify reCaptcha
              if (captcha.length) {
                let captchaToken = captcha.find('.g-recaptcha-response').val(),
                  captchaMsg = {
                    'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
                    'CPT002': 'Something wrong with google reCaptcha'
                  };

                formHasCaptcha = true;

                $.ajax({
                  method: "POST",
                  url:    "bat/reCaptcha.php",
                  data:   {'g-recaptcha-response': captchaToken},
                  async:  false
                })
                  .done(function (responceCode) {
                    if (responceCode !== 'CPT000') {
                      if (output.hasClass("snackbars")) {
                        output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

                        setTimeout(function () {
                          output.removeClass("active");
                        }, 3500);

                        captchaFlag = false;
                      } else {
                        output.html(captchaMsg[responceCode]);
                      }

                      output.addClass("active");
                    }
                  });
              }

              if (!captchaFlag) {
                return false;
              }

              form.addClass('form-in-process');

              if (output.hasClass("snackbars")) {
                output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
                output.addClass("active");
              }
            } else {
              return false;
            }
          },
          error:        function (result) {
            if (isNoviBuilder)
              return;

            let output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
              form = $(plugins.rdMailForm[this.extraData.counter]);

            output.text(msg[result]);
            form.removeClass('form-in-process');

            if (formHasCaptcha) {
              grecaptcha.reset();
              window.dispatchEvent(new Event('resize'));
            }
          },
          success:      function (result) {
            if (isNoviBuilder)
              return;

            let form = $(plugins.rdMailForm[this.extraData.counter]),
              output = $("#" + form.attr("data-form-output")),
              select = form.find('select');

            form
              .addClass('success')
              .removeClass('form-in-process');

            if (formHasCaptcha) {
              grecaptcha.reset();
              window.dispatchEvent(new Event('resize'));
            }

            result = result.length === 5 ? result : 'MF255';
            output.text(msg[result]);

            if (result === "MF000") {
              if (output.hasClass("snackbars")) {
                output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
              } else {
                output.addClass("active success");
              }
            } else {
              if (output.hasClass("snackbars")) {
                output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
              } else {
                output.addClass("active error");
              }
            }

            form.clearForm();

            if (select.length) {
              select.select2("val", "");
            }

            form.find('input, textarea').trigger('blur');

            setTimeout(function () {
              output.removeClass("active error success");
              form.removeClass('success');
            }, 3500);
          }
        });
      }
    }

    // lightGallery
    if (plugins.lightGallery.length) {
      for (var i = 0; i < plugins.lightGallery.length; i++) {
        initLightGallery(plugins.lightGallery[i]);
      }
    }

    // lightGallery item
    if (plugins.lightGalleryItem.length) {
      // Filter carousel items
      var notCarouselItems = [];

      for (var z = 0; z < plugins.lightGalleryItem.length; z++) {
        if (!$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length && !$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length && !$(plugins.lightGalleryItem[z]).parents('.slick-slider').length) {
          notCarouselItems.push(plugins.lightGalleryItem[z]);
        }
      }

      plugins.lightGalleryItem = notCarouselItems;

      for (var i = 0; i < plugins.lightGalleryItem.length; i++) {
        initLightGalleryItem(plugins.lightGalleryItem[i]);
      }
    }

    // Dynamic lightGallery
    if (plugins.lightDynamicGalleryItem.length) {
      for (var i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
        initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
      }
    }

    /**
     * Custom Toggles
     */
    if (plugins.customToggle.length) {
      for (var i = 0; i < plugins.customToggle.length; i++) {
        var $this = $(plugins.customToggle[i]);

        $this.on('click', $.proxy(function (event) {
          event.preventDefault();

          var $ctx = $(this);
          $($ctx.attr('data-custom-toggle')).add(this).toggleClass('active');
        }, $this));

        if ($this.attr("data-custom-toggle-hide-on-blur") === "true") {
          $body.on("click", $this, function (e) {
            if (e.target !== e.data[0]
              && $(e.data.attr('data-custom-toggle')).find($(e.target)).length
              && e.data.find($(e.target)).length === 0) {
              $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
            }
          })
        }

        if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
          $body.on("click", $this, function (e) {
            if (e.target !== e.data[0] && $(e.data.attr('data-custom-toggle')).find($(e.target)).length === 0 && e.data.find($(e.target)).length === 0) {
              $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
            }
          })
        }
      }
    }

    /**
     * Custom Waypoints
     */
    if (plugins.customWaypoints.length && !isNoviBuilder) {
      for (var i = 0; i < plugins.customWaypoints.length; i++) {
        var $this = $(plugins.customWaypoints[i]);

        $this.on('click', function (e) {
          e.preventDefault();
          $("body, html").stop().animate({
            scrollTop: $("#" + $(this).attr('data-custom-scroll-to')).offset().top
          }, 1000, function () {
            $window.trigger("resize");
          });
        });
      }
    }

    /**
     * Page title
     * @description Enables page-title plugin
     */
    if (plugins.pageTitles.length && !isNoviBuilder) {
      var varCount = 30;

      for (var i = 0; i < plugins.pageTitles.length; i++) {
        var pageTitle = $(plugins.pageTitles[i]);

        var header = pageTitle.children()[0];
        var wrapper = $(document.createElement('div'));
        wrapper.addClass('page-title-inner');

        var pageTitleLeft = $(document.createElement('div')),
          pageTitleCenter = $(document.createElement('div')),
          pageTitleRight = $(document.createElement('div'));

        pageTitleLeft.addClass('page-title-left');
        pageTitleCenter.addClass('page-title-center');
        pageTitleRight.addClass('page-title-right');

        for (var j = 0; j < varCount; j++) {
          pageTitleLeft.append(header.cloneNode(true));
          pageTitleRight.append(header.cloneNode(true));
        }

        pageTitleCenter.append(header.cloneNode(true));
        pageTitle.children(0).remove();

        wrapper.append(pageTitleLeft);
        wrapper.append(pageTitleCenter);
        wrapper.append(pageTitleRight);

        pageTitle.append(wrapper);
      }
    }

    /**
     * WOW
     * @description Enables Wow animation plugin
     */
    if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
      new WOW().init();
    }
  });

  // Countdown
  if (plugins.countdown.length) {
    for (let i = 0; i < plugins.countdown.length; i++) {
      let
        node = plugins.countdown[i],
        countdown = aCountdown({
          node: node,
          from: node.getAttribute('data-from'),
          to: node.getAttribute('data-to'),
          count: node.getAttribute('data-count'),
          tick: 100,
        });
    }
  }
})();
