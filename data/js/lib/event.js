/**
 * The passbolt event module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The event module.
  var event = {};

  // Passbolt context passed by add-on events.
  passbolt.context = passbolt.context || {};

  self.port.on('passbolt.context.set', function(name, value) {
    passbolt.context[name] = value;
  });

  self.port.on('passbolt.event.trigger_to_page', function(name, value) {
    passbolt.event.triggerToPage(name, value);
  });

  /**
   * Set a context on a given worker.
   * @param worker
   * @param name
   * @param value
   */
  event.dispatchContext = function(worker, name, value) {
    self.port.emit('passbolt.context.dispatch', worker, name, value);
  };

  /**
   * Trigger an event to the page
   * @param eventData
   */
  event.triggerToPage = function (event, data) {
    // Bundle the event data;
    var eventData = {
      event: event,
      data: data
    };
    var cloned = cloneInto(eventData, document.defaultView);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('addon-message', true, true, cloned);
    document.documentElement.dispatchEvent(event);
  };

  passbolt.event = event;

})( passbolt );
