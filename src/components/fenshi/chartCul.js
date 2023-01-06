/*
  author: wangqidong
*/

/*
  This file is the for the culity and helper functions.
  Which including
    Math calculation methods
    Drawing basics
    Coordinate basics
*/

// var LOG = require('./log.js');

/* eslint-disable */
var cul = {
  Safe: {
    dataCheck: function(data_source){
      var data = data_source.data;
      var fields = data_source.fields;

      var max_index = 0;
      fields.forEach(function(line){
        for (var key in line){
          if ((key.length === 1 || key.indexOf('index') > -1) && typeof line[key] === 'number') {
            if (line[key] > max_index)
              max_index = line[key];
          }
        }
      });

      if (data_source.time_ranges) {
        for (var l = data_source.time_ranges.length; l--;) {
          if (isNaN(data_source.time_ranges[l][0]) ||
              isNaN(data_source.time_ranges[l][1])) {
            throw 'Time ranges contains NaN'
          }
        }
      }

      if (data.length === 0)
        throw 'Chart input data is empty';

      if (data[0].length <= max_index)
        throw 'Chart input data is length(' + data[0].length + ') is less than required data index(' + max_index + ')';
    }
  },
  Animation: {
    linear: function(data_set1, data_set2, val_indexes){
      var diff = data_set1.map(function(d1, index){
        var data2 = data_set2[index];

        var result = d1.slice();
        val_indexes.forEach(function(val_index){
          var diff = data2[val_index] - result[val_index];
          result[val_index] = diff / 60;
        });
        return result;
      });

      return function(){
        data_set1.forEach(function(d1, index){
          val_indexes.forEach(function(val_index){
            d1[val_index] += diff[index][val_index];
          });
        });
      }
    }
  },

  Chart: {
    linkCharts: function(charts){
      charts.forEach(function(chart){
        charts.forEach(function(other_chart){
          if (chart !== other_chart)
            chart.linked_charts.insert(other_chart);
        });
      });
    }
  },
  DataTypes: {
    Set: function(){
      var set = function(d){
        this.d = d || [];
      };
      set.prototype.insert = function(item){
        if (this.d.indexOf(item) < 0)
          this.d.push(item);
      };
      set.prototype.remove = function(item){
        var index = this.d.indexOf(item);
        if (index > -1)
          this.d.splice(index, 1);
      };
      set.prototype.length = function(){
        return this.d.length;
      };
      set.prototype.forEach = function(func){
        this.d.forEach(func);
      };

      return function(lst){
        return new set(lst);
      };
    }()
  },
  Math: {
    sum: function(lst){
      var sum = 0;
      lst.forEach(function(item){
        sum += item;
      });
      return sum;
    },
    // get Standard Deviation
    getSD: function(data, avg){
      if (avg === undefined){
        avg = cul.Math.sum(data) / data.length;
      }
      return Math.sqrt(
              cul.Math.sum(
                data.map(function(item){return Math.pow(item - avg, 2)}))
              / data.length);
    },
    iterOffsetN: function(data, index, n, callback){
      if (!n){
        return;
      }

      var target = index + (Math.abs(n) - 1) * (n > 0 ? 1 : -1);
      if (target < 0)
        target = 0;
      