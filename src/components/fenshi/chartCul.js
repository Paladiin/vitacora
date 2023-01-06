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

        var result =