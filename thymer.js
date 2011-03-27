$().ready(function(){
  var timerList = $('#timer-list');

  var timers = [];

  var Thymer = {
    init:function() {
      if ('localStorage' in window) {
        var timersData = window.localStorage.getItem('timers');
        console.log(timersData);
        if (timersData) {
          var timersData = JSON.parse(timersData);
          for (var i in timersData) {
            var t = timersData[i];
            timers.push(new Timer(t.name, t.seconds, t.started, t.finished));
          }
          this._start();
        }
      }
    },
    addTimer:function(timer) {
      timers.push(timer);
      this._saveTimers();
      this._start();
    },
    removeTimer:function(timer) {
      for (var i in timers) {
        if (timers[i] == timer) {
          timers.splice(i,1);
          this._saveTimers();
          break;
        }
      }
    },
    _saveTimers:function() {
      if ('localStorage' in window) {
        var arr = [];
        for (var i in timers) {
          arr.push(timers[i].toObject());
        }
        window.localStorage.setItem('timers', JSON.stringify(arr));
      }
    },
    _start:function() {
      if (!this.started) {
        this.started = true;
        this.interval = setInterval(function(){
          Thymer._update();
        },1000);
      }
    },
    _update:function() {
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

  var Timer = function(name, seconds, started, finished) {
    this.name = name;
    this.seconds = seconds;
    this.started = started ? started : new Date().getTime();
    this.finished = finished || false;

    if (!this.name || this.name.trim() == "") {
      this.name = name = "Timer " + Timer.counter++;
    }

    this.el = $("<li><h2 class=name></h2><div class=status></div><div class=progress-box><div class=progress></div></div><a href=# class=remove title=Remove><img alt='Remove Icon' src=minus_alt_16x16.png></a></li>");
    timerList.append(this.el);

    this.el.children('.name').text(name);
    this.el.children('.remove').click(this, function(event){ event.data.remove(); });

    this.status   = this.el.children('.status');
    this.progress = this.el.find('.progress');

    if (this.finished) {
      this._displayCompleted();
    } else {
      this.update();
    }
  };
  Timer.prototype = {
    update:function() {
      if (!this.finished) {
        if (this.check()) {
          this._displayCompleted();
        } else {
          this.status.text(this._buildDisplayString());
          this._setProgress(this.elapsed() / this.seconds);
        }
      }
    },
    remove:function() {
      this.el.remove();
      Thymer.removeTimer(this);
    },
    check:function() {
      var remaining = this.calculateRemaining();
      if (remaining <= 0) {
        this.finished = true;
        return true;
      }
      return false;
    },
    elapsed:function() {
      return Math.floor((new Date().getTime() - this.started) / 1000);
    },
    calculateRemaining:function() {
      return this.seconds - this.elapsed();
    },
    _setProgress:function(v) {
      this.progress.css('width', Math.floor(v * 100) + '%');
    },
    _displayCompleted:function() {
      this.status.text('Completed');
      this._setProgress(1);
    },
    _buildDisplayString:function() {
      var s = [];

      var remaining = this.calculateRemaining();
      remaining = this.buildTimeSegment('h', 60*60, remaining, s);
      remaining = this.buildTimeSegment('m', 60, remaining, s);
      s.push(remaining + 's');

      return s.join(' ');
    },
    buildTimeSegment:function(suffix, divisor, secondsRemaining, segments) {
      var units = Math.floor(secondsRemaining / divisor);
      if (units > 0) {
        segments.push(units + suffix);
        return secondsRemaining % divisor;
      }
      return secondsRemaining;
    },
    toObject:function() {
      return {
        name: this.name,
        seconds: this.seconds,
        started: this.started,
        finished: this.finished
      };
    }
  };
  Timer.counter = 0;

  var formHint = $('#add-timer-form small');
  $('#add-timer-form input').keypress(function(event) {
    if (event.which == '13') {
      event.preventDefault();
      var seconds = parseInt($('#secs').val()) +
          (parseInt($('#mins').val()) * 60) +
          (parseInt($('#hours').val()) * 60 * 60);

      Thymer.addTimer(new Timer($('#timer-name').val(), seconds));
      $('#timer-name').val('');
    }
  }).focus(function(){
    formHint.css('visibility', 'visible');
  }).blur(function(){
    formHint.css('visibility', 'hidden');
  });
  formHint.css('visibility', 'hidden');

  // load stored timers
  Thymer.init();
});
