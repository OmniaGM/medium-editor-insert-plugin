/*!
 * medium-editor-insert-plugin v0.1.1 - jQuery insert plugin for MediumEditor
 *
 * Embed Addon
 *
 * https://github.com/orthes/medium-editor-images-plugin
 *
 * Copyright (c) 2013 Pavel Linkesch (http://linkesch.sk)
 * Released under the MIT license
 */

(function ($) {
  'use strict';
  $.fn.mediumInsert.registerAddon('embed', {

    /**
    * Embed initial function
    * @return {void}
    */
    init: function (options) {
     if (options && options.$el) {
        this.$el = options.$el;
      }
      this.options = $.extend(this.default, options);

    },

    default: {
      'supportedProviders': ['youtube', 'vimeo'], // list of strings
      'unsupportedURL': function (url) {
        console.error('un-supported url', url);
      },
      'loadingCallback': $.noop,
      'onSuccess': $.noop,
      'onError': $.noop,
      'onComplete': $.noop,
      'embedlyKey': '7cf354c01bdd4a7aa36591d86cf1f369' // TODO: set default null
    },

    setInputboxEvents: function(){
      var that = this;
      this.$input.click(function(e){
        e.stopPropagation();
        $.fn.mediumInsert.settings.editor.deactivateTextEditor();
      });
      this.$input.focus(function(e){
        e.stopPropagation();
        $.fn.mediumInsert.settings.editor.deactivateTextEditor();
      });
      // this.$input.select(function(e){e.stopPropagation();});
      this.$input.keyup(function(e){
          // e.preventDefault();
          //ENTER key
          if (e.which === 13){
            e.stopPropagation();
            if (that.isSupported(this.value)){
              that.getEmbedCode(this.value);
            }else{
              that.options.unsupportedURL(this.value);
            }
          }
      });
    },

    insertButton: function(buttonLabels){
      var label = 'Embed';
      if (buttonLabels === 'fontawesome') {
        label = '<i class="fa fa-map-marker"></i>';
      }
      return '<button data-addon="embed" data-action="add" class="medium-editor-action medium-editor-action-embed mediumInsert-action">'+label+'</button>';
    },

    /**
    * Add embed to placeholder
    * @param {element} placeholder Placeholder to add embed to
    * @return {void}
    */

    add: function (e, placeholder) {
      this.placeholder = placeholder;
      $.fn.mediumInsert.insert.deselect();
      // TODO change this to placeholder image
      // placeholder.append('<div class="mediumInsert-embed">Embed - Coming soon...</div>');
      this.showInputBox(e, this.placeholder);
    },

    showInputBox: function (e, placeholder){
      e.stopPropagation();
      var $previousInput = $('.mediumInsert-embed-input-url');
      if ($previousInput.length > 0){
        $previousInput.detach();
      }
      this.$input = $('<input class="mediumInsert-embed-input-url mediumInsert-input">');
      this.setInputboxEvents();

      placeholder.prepend(this.$input);
      this.$input.focus();
    },

    isSupported: function (url) {
      var valid = false;
      // if this is url of an image
      if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(url)){
        return true;
      }
      var providers = this.options.supportedProviders;
      var i = this.options.supportedProviders.length;
      while (i >= 0) {
        if (url.toLowerCase().indexOf(providers[i]) !== -1 ) {
          valid = true;
          break;
        }
        i--;
      }
      return valid;
    },

    cancel: function () {
      if (this.promise) {
        return this.promise.reject([{error: true, error_message: 'abort'}]);
      }
    },

    getEmbedCode: function(url){
      var that = this,
          $input = $('.mediumInsert-embed-input-url');
      $input.prop('disabled', true).addClass('loading');
      this.options.loadingCallback($input);
      this.promise = $.embedly.extract([url], {
        key: this.options.embedlyKey
      });
      this.promise.done(function(data){
        if(!data[0].error) {
          $input.detach();
          if (that.placeholder.children().length !== 0){
            var $insertBlock = that.placeholder.parent(),
                $nextInsertBlocks;

            $insertBlock.prev('p').before('<p><br><p>');
            that.$el.keyup();
            $nextInsertBlocks = $insertBlock.prevAll('.mediumInsert').first();
            that.placeholder = $nextInsertBlocks.find('.mediumInsert-placeholder');
          }
          that.options.onSuccess(data[0], that.placeholder);
        }
      });

      this.promise.always(function(data){
        $input.removeClass('loading');
        if (data[0].error) {
          $input.prop('disabled', false);
          $input.focus();
          that.options.onError(data[0]);
        }
        that.options.onComplete(data[0]);
      });
    }

  });

}(jQuery));
