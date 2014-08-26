  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  *
  *
  * Chart.js sample data structure
  * Line & Bar & Radar chart
  * var data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
              label: "My Second dataset",
              fillColor: "rgba(151,187,205,0.2)",
              strokeColor: "rgba(151,187,205,1)",
              pointColor: "rgba(151,187,205,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(151,187,205,1)",
              data: [28, 48, 40, 19, 86, 27, 90]
          }
      ]
  };
  *
  * Polar Area & Pie & Donut charts
  * var data = [
      {
          value: 300,
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "Red"
      },
      {
          value: 50,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Green"
      },
      {
          value: 120,
          color: "#4D5360",
          highlight: "#616774",
          label: "Dark Grey"
      }
    ];
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    var errors = {
    };
    
    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function handleRemoval(){
      this._chart.clearChart();
    }

    /**
     * Unpacks the data from dataform's table. Basically, it takes the table and rotates it
     * 90 degrees.
     * TODO: Might need different unpackers depending on which visualization it is.
     * @param  {[2D array]} table [the dataform 2d array]
     * @return {[2D array]}       [the resulting array that is compatible with chart's column structure]
     */
    var _unpackLBR = function(table) {
      var plucked = [];
      var numberOfColumns = table[0].length;
      // Construct new table
      for(var x = 0; x < numberOfColumns; x++) {
        plucked.push([]);
      }
      // The first item in the table will be the names
      for(var i = 0; i < table.length; i++) {
        for(var j = 0; j < numberOfColumns; j++) {
          plucked[j].push(table[i][j]);
        }
      }
      var datasets = [];
      for(i = 1; i < plucked.length; i++) {
        datasets.push({
          label: plucked[i].shift(),
          data: plucked[i]
        });
      }

      return {
        labels: plucked.shift().slice(1),
        datasets: datasets
      };
    };

    var _unpackPPD = function(table) {
      var plucked = [];
      var numberOfColumns = table[0].length - 1;
      for(var x = 0; x < numberOfColumns; x++) {
        plucked.push(0);
      }
      for(var i = 1; i < table.length; i++) {
        for(var j = 0; j < numberOfColumns; j++) {
          plucked[j] += table[i][j + 1];
        }
      }
      var datasets = [];
      for(i = 0; i < plucked.length; i++) {
        datasets.push({
          value: plucked[i],
          label: table[0][i + 1]
        });
      }

      return datasets;
    };

    var chartTypes = ['Line', 'Bar', 'Radar', 'PolarArea', 'Pie', 'Doughnut'];
    var charts = {};

    // Create chart types
    // -------------------------------

    _each(chartTypes, function (chart, index) {
      charts[chart] = Keen.Visualization.extend({
        initialize: function(){
          if(parseInt(index, 10) > 2) {
            this.data.chart = _unpackPPD(this.data.table);
          } else {
            this.data.chart = _unpackLBR(this.data.table);
          }

          this.render();
        },
        render: function(){
          var self = this;
          // Chart.js usage: new Chart(ctx).PolarArea(data);

          // Binding and defaulting
          var options = {
          };

          _extend(options, this.chartOptions);

          // Make chart
          var chartNode = self.el;
          chartNode.setAttribute('width', this.chartOptions.width);
          chartNode.setAttribute('height', this.chartOptions.height);
          var context = chartNode.getContext("2d");

          self._chart = new Chart(context)[chart](this.data.chart, options);
        },
        update: function(){
          var unpacked = _unpack(this.data.table);
          // this._chart.load({
          //   columns: unpacked
          // });
        },
        remove: function(){
          handleRemoval.call(this);
        }
      });

    });

    // Register library + types
    // -------------------------------
    
    Keen.Visualization.register('chart.js', charts, {
      dependencies: [{
        type: 'script',
        url: 'http://cdnjs.cloudflare.com/ajax/libs/Chart.js/0.2.0/Chart.js'
      }]
    });

  })(Keen);
