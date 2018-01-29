/*
 * jquery-filestyle
 * doc: http://markusslima.github.io/jquery-filestyle/
 * github: https://github.com/markusslima/jquery-filestyle
 *
 * Copyright (c) 2017 Markus Vinicius da Silva Lima
 * Version 2.1.0
 * Licensed under the MIT license.
 */
(function ($) {
    "use strict";
    
    var nextId = 0;
    
    var JFilestyle = function (element, options) {
        this.options = options;
        this.$elementjFilestyle = [];
        this.$element = $(element);
    };

    JFilestyle.prototype = {
        clear: function () {
            this.$element.val('');
            this.$elementjFilestyle.find(':text').val('');
            this.$elementjFilestyle.find('.count-jfilestyle').remove();
        },

        destroy: function () {
            this.$element
                .removeAttr('style')
                .removeData('jfilestyle')
                .val('');
            this.$elementjFilestyle.remove();
        },

        dragdrop : function (value) {
            if (value === true || value === false) {
                this.options.dragdrop = value;
            } else {
                return this.options.dragdrop;
            }
        },
        
        disabled : function (value) {
			if (value === true) {
				if (!this.options.disabled) {
					this.$element.attr('disabled', 'true');
					this.$elementjFilestyle.find('label').attr('disabled', 'true');
					this.options.disabled = true;
				}
			} else if (value === false) {
				if (this.options.disabled) {
					this.$element.removeAttr('disabled');
					this.$elementjFilestyle.find('label').removeAttr('disabled');
					this.options.disabled = false;
				}
			} else {
				return this.options.disabled;
			}
		},
		
		buttonBefore : function (value) {
			if (value === true) {
				if (!this.options.buttonBefore) {
					this.options.buttonBefore = true;
					if (this.options.input) {
						this.$elementjFilestyle.remove();
						this.constructor();
						this.pushNameFiles();
					}
				}
			} else if (value === false) {
				if (this.options.buttonBefore) {
					this.options.buttonBefore = false;
					if (this.options.input) {
						this.$elementjFilestyle.remove();
						this.constructor();
						this.pushNameFiles();
					}
				}
			} else {
				return this.options.buttonBefore;
			}
		},

        input: function (value) {
            if (value === true) {
                if (!this.options.input) {
                    this.options.input = true;
                    this.$elementjFilestyle.find('label').before(this.htmlInput());
                    this.$elementjFilestyle.find('.count-jfilestyle').remove();
					this.pushNameFiles();
                }
            } else if (value === false) {
                if (this.options.input) {
                    this.options.input = false;
                    this.$elementjFilestyle.find(':text').remove();
                    var files = this.pushNameFiles();
					if (files.length > 0) {
						this.$elementjFilestyle.find('label').append(' <span class="count-jfilestyle">' + files.length + '</span>');
					}
                }
            } else {
                return this.options.input;
            }
        },

        text: function (value) {
            if (value !== undefined) {
                this.options.text = value;
                this.$elementjFilestyle.find('label span').html(this.options.text);
            } else {
                return this.options.text;
            }
        },

        theme: function (value) {
            if (value !== undefined) {
                console.log(this.$elementjFilestyle.attr('class').replace(/.*(jfilestyle-theme-.*).*/, '$1'));
                this.$elementjFilestyle.removeClass(this.$elementjFilestyle.attr('class').replace(/.*(jfilestyle-theme-.*).*/, '$1'));
                this.options.theme = value;
                this.$elementjFilestyle.addClass('jfilestyle-theme-'+this.options.theme);
            } else {
                return this.options.theme;
            }
        },

        inputSize: function (value) {
            if (value !== undefined) {
                this.options.inputSize = value;
                this.$elementjFilestyle.find(':text').css('width', this.options.inputSize);
            } else {
                return this.options.inputSize;
            }
        },
        
		placeholder : function(value) {
			if (value !== undefined) {
				this.options.placeholder = value;
				this.$elementjFilestyle.find(':text').attr('placeholder', value);
			} else {
				return this.options.placeholder;
			}
		},

        htmlInput: function () {
            if (this.options.input) {
                return '<input type="text" style="width:'+this.options.inputSize+'" placeholder="'+ this.options.placeholder +'" disabled> ';
            } else {
                return '';
            }
        },
        
        // puts the name of the input files
        // return files
		pushNameFiles : function() {
			var content = '', files = [];
			if (this.$element[0].files === undefined) {
				files[0] = {
					'name' : this.$element.value
				};
			} else {
				files = this.$element[0].files;
			}

			for (var i = 0; i < files.length; i++) {
				content += files[i].name.split("\\").pop() + ', ';
			}

			if (content !== '') {
				this.$elementjFilestyle.find(':text').val(content.replace(/\, $/g, ''));
			} else {
				this.$elementjFilestyle.find(':text').val('');
			}
			
			return files;
		},

        constructor: function () {
            var _self = this,
                html = '',
                id = _self.$element.attr('id'),
                $label,
                files = [];

            if (id === '' || !id) {
                id = 'jfilestyle-' + nextId;
                _self.$element.attr({'id': id});
                nextId++;
            }
            
            html = '<span class="focus-jfilestyle">'+
                     '<label for="'+id+'" ' + (_self.options.disabled ? 'disabled="true"' : '') + '>'+
                       '<span>'+_self.options.text+'</span>'+
                     '</label>'+
                   '</span>';
            
            if (_self.options.buttonBefore === true) {
	            html = html + _self.htmlInput();
            } else {
	            html = _self.htmlInput() + html;
            }

            _self.$elementjFilestyle = $('<div class="jfilestyle '
                +(_self.options.input?'jfilestyle-corner':'')+' '
                +(this.options.buttonBefore ? ' jfilestyle-buttonbefore' : '')+' '
                +(_self.options.theme?'jfilestyle-theme-'+_self.options.theme:'')+'">'
                +'<div name="filedrag"></div>'
                +html
                +'</div>');
            _self.$elementjFilestyle.find('.focus-jfilestyle')
                .attr('tabindex', "0")
                .keypress(function (e) {
                    if (e.keyCode === 13 || e.charCode === 32) {
                        _self.$elementjFilestyle.find('label').click();
                        return false;
                    }
                });

            // hidding input file and add filestyle
            _self.$element
                .css({'position': 'absolute', 'clip': 'rect(0px 0px 0px 0px)'})
                .attr('tabindex', "-1")
                .after(_self.$elementjFilestyle);
			
			if (_self.options.disabled) {
				_self.$element.attr('disabled', 'true');
			}

            _self.$elementjFilestyle.find('[name="filedrag"]').css({
                position: 'absolute',
                width: '100%',
                height: _self.$elementjFilestyle.height()+'px',
                'z-index': -1
            });
			
            // Getting input file value
            _self.$element.change(function () {
            	var files = _self.pushNameFiles();
            	
            	if (_self.options.input == false) {
					if (_self.$elementjFilestyle.find('.count-jfilestyle').length == 0) {
						_self.$elementjFilestyle.find('label').append(' <span class="count-jfilestyle">' + files.length + '</span>');
					} else if (files.length == 0) {
						_self.$elementjFilestyle.find('.count-jfilestyle').remove();
					} else {
						_self.$elementjFilestyle.find('.count-jfilestyle').html(files.length);
					}
				} else {
					_self.$elementjFilestyle.find('.count-jfilestyle').remove();
				}

                _self.options.onChange(files);
            });

            // Check if browser is Firefox
            if (window.navigator.userAgent.search(/firefox/i) > -1) {
                // Simulating choose file for firefox
                this.$elementjFilestyle.find('label').click(function () {
                    _self.$element.click();
                    return false;
                });
            }

            /** DRAG AND DROP EVENTS **/
            $(document)
                .on('dragover', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!_self.options.dragdrop) {
                        $('[name="filedrag"]').css('z-index', '9');
                    }
                })
                .on('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!_self.options.dragdrop) {
                        $('[name="filedrag"]').css('z-index', '-1');
                    }
                });

            _self.$elementjFilestyle.find('[name="filedrag"]')
                .on('dragover',
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                )
                .on('dragenter',
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                )
                .on('drop',
                    function (e) {
                        if (e.originalEvent.dataTransfer && !_self.options.disabled && _self.options.dragdrop) {
                            if (e.originalEvent.dataTransfer.files.length) {
                                e.preventDefault();
                                e.stopPropagation();
                                _self.$element[0].files = e.originalEvent.dataTransfer.files;
                                var files = _self.pushNameFiles();
                
                                if (_self.options.input == false) {
                                    if (_self.$elementjFilestyle.find('.count-jfilestyle').length == 0) {
                                        _self.$elementjFilestyle.find('label').append(' <span class="count-jfilestyle">' + files.length + '</span>');
                                    } else if (files.length == 0) {
                                        _self.$elementjFilestyle.find('.count-jfilestyle').remove();
                                    } else {
                                        _self.$elementjFilestyle.find('.count-jfilestyle').html(files.length);
                                    }
                                } else {
                                    _self.$elementjFilestyle.find('.count-jfilestyle').remove();
                                }

                                $('[name="filedrag"]').css('z-index', '-1');
                            }
                        }
                    }
                );
        }
    };

    var old = $.fn.jfilestyle;

    $.fn.jfilestyle = function (option, value) {
        var get = '',
            element = this.each(function () {
                if ($(this).attr('type') === 'file') {
                    var $this = $(this),
                        data = $this.data('jfilestyle'),
                        options = $.extend({}, $.fn.jfilestyle.defaults, option, typeof option === 'object' && option);

                    if (!data) {
                        $this.data('jfilestyle', (data = new JFilestyle(this, options)));
                        data.constructor();
                    }

                    if (typeof option === 'string') {
                        get = data[option](value);
                    }
                }
            });

        if (typeof get !== undefined) {
            return get;
        } else {
            return element;
        }
    };

    $.fn.jfilestyle.defaults = {
        'text': 'Choose file',
        'input': true,
        'disabled': false,
        'buttonBefore': false,
        'inputSize': '200px',
        'placeholder': '',
        'dragdrop': true,
        'theme': 'default',
        'onChange': function () {}
    };

    $.fn.jfilestyle.noConflict = function () {
        $.fn.jfilestyle = old;
        return this;
    };

    $(function() {
        // Data attributes register
        $('.jfilestyle').each(function () {
            var $this = $(this),
                options = {
                    'text': $this.attr('data-text'),
                    'input': $this.attr('data-input') !== 'false',
                    'disabled': $this.attr('data-disabled') === 'true',
                    'buttonBefore': $this.attr('data-buttonBefore') === 'true',
                    'inputSize': $this.attr('data-inputSize'),
                    'placeholder': $this.attr('data-placeholder'),
                    'theme': $this.attr('data-theme'),
                    'dragdrop': $this.attr('data-dragdrop') !== 'false'
                };
    
            $this.jfilestyle(options);
        });
    });
})(window.jQuery);