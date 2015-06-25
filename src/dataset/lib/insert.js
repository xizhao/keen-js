var each = require("../../core/utils/each");
var createNullList = require('../utils/create-null-list');
var append = require('./append');

var appendRow = append.appendRow,
    appendColumn = append.appendColumn;

module.exports = {
  "insertColumn": insertColumn,
  "insertRow": insertRow
};

function insertColumn(index, str, input){
  var self = this, label;

  label = (str !== undefined) ? str : null;

  if (typeof input === "function") {

    self.data.output[0].splice(index, 0, label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        self.data.output[i].splice(index, 0, cell);
      }
    });

  }

  else if (!input || input instanceof Array) {
    self.data.output[0].splice(index, 0, label);
    input = input || [];

    if (input.length <= self.output().length - 1) {
      input = input.concat( createNullList(self.output().length - 1 - input.length) );
    }
    else {
      // If this new column is longer than existing columns,
      // we need to update the rest to match ...
      each(input, function(value, i){
        if (self.data.output.length -1 < input.length) {
          appendRow.call(self, String( self.data.output.length ));
        }
      });
    }

    each(input, function(value, i){
      self.data.output[i+1].splice(index, 1, value);
    });

  }
  return self;
}

function insertRow(index, str, input){
  var self = this, label, newRow = [];

  label = (str !== undefined) ? str : null;
  newRow.push(label);

  if (typeof input === "function") {
    each(self.output()[0], function(label, i){
      var col, cell;
      if (i > 0) {
        col = self.selectColumn(i);
        cell = input.call(self, col, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        newRow.push(cell);
      }
    });
    self.data.output.splice(index, 0, newRow);
  }

  else if (!input || input instanceof Array) {
    input = input || [];

    if (input.length <= self.data.output[0].length - 1) {
      input = input.concat( createNullList( self.data.output[0].length - 1 - input.length ) );
    }
    else {
      each(input, function(value, i){
        if (self.data.output[0].length -1 < input.length) {
          appendColumn.call(self, String( self.data.output[0].length ));
        }
      });
    }

    self.data.output.splice(index, 0, newRow.concat(input) );
  }

  return self;
}
