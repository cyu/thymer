$().ready(function(){
  var timerList = $('#timer-list');
  var timers = [];

  var UpdateLoop = {
    start:function() {
      if (!this.started) {
        this.started = true;
        this.interval = setInterval(function(){
          UpdateLoop.update();
        },1000);
      }
    },
    update:function() {
      if (timers.length > 0) {
        for (var i in timers) {
          timers[i].update();
        }

      } else {
        clearInterval(this.interval);
        this.interval = null;
        this.started = false;
      }
    }
  };

  var Timer = function(name, seconds) {
    this.name = name;
    this.seconds = seconds;
    this.finished = false;
    this.start();
  };
  Timer.prototype = {
    start:function() {
      this.started = new Date().getTime();
      this.el = $("<li>" + this.buildDisplayString() + "</li>");
      timerList.append(this.el);
    },
    update:function() {
      if (!this.finished) {
        if (this.check()) {
          var timer = this;
          var removeLink = $('<a href="#">remove</a>').click(function(){
            timer.remove();
          });
          this.el.text('ALARM!!! - ' + this.name + ' ');
          this.el.append(removeLink);
        } else {
          this.el.text(this.buildDisplayString());
        }
      }
    },
    remove:function() {
      this.el.remove();
      for (var i in timers) {
        if (timers[i] == this) {
          timers.splice(i,1);
          break;
        }
      }
    },
    check:function() {
      var remaining = this.calculateRemaining();
      if (remaining <= 0) {
        this.finished = true;
        return true;
      }
      return false;
    },
    calculateRemaining:function() {
      return this.seconds - Math.floor((new Date().getTime() - this.started) / 1000);
    },
    buildDisplayString:function() {
      var s = [];

      var remaining = this.calculateRemaining();
      remaining = this.buildTimeSegment('h', 60*60, remaining, s);
      remaining = this.buildTimeSegment('m', 60, remaining, s);
      s.push(remaining + 's');

      return s.join(' ') + ' - ' + this.name;
    },
    buildTimeSegment:function(suffix, divisor, secondsRemaining, segments) {
      var units = Math.floor(secondsRemaining / divisor);
      if (units > 0) {
        segments.push(units + suffix);
        return secondsRemaining % divisor;
      }
      return secondsRemaining;
    }
  };

  $('#add-timer-form form').submit(function(){
    var seconds = parseInt($('#secs').val()) +
        (parseInt($('#mins').val()) * 60) +
        (parseInt($('#hours').val()) * 60 * 60);
    var timer = new Timer($('#timer-name').val(), seconds)
    timers.push(timer);
    UpdateLoop.start();
    return false;
  });
});
