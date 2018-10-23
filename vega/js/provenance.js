var createProvenance = function(matrixChart){

  console.log("Data", matrixChart.data());

  // IMPORTANT
  // All state is maintained as an array of indices into matrixChart.data().nodes
    // Specifically, the ith entry in the array is the index v of the node which
    // means the node at index v has order i
    //
    // this makes checkpoints a bit more obtuse, but swaps on state are straightforward

    // Order Map
    let orderMap = new Map();
    let orderNodes = matrixChart.data().nodes.slice();
    ["alpha", "frequency", "cluster"].forEach(function(order) {
        orderNodes.sort(function(a,b) { return a[order] - b[order]; });
        // console.log("ORDER:", orderNodes.map(function(d) { return d[order]; }));
        orderMap.set(order, orderNodes.map(function(d) { return d.index; }));
        // console.log(order, orderMap.get(order));
    });

    let OrderChange = SIMProv.createChangeClass("OrderChange",
        function() {
            let order = orderMap.get(this.data.orderby);
            let inv_state = new Array(order.length);
            order.forEach(function (d, i) {
                inv_state[d] = i;
            });
            matrixChart.data().nodes.forEach(function (d, i) {
                d.order = inv_state[d.index];
            });
            matrixChart.signal("src", {}).update({'duration': 1000});
        });

    let OrderStateChange = SIMProv.createStateChangeClass("OrderStateChange",
        function(state) {
            return orderMap.get(this.data.orderby).slice();
        }
    );

    let SwapChange = SIMProv.createChangeClass("SwapChange",
        function() {
            this.data.swaps.forEach(function (swap) {
                let srcNode = null, destNode = null;
                matrixChart.data().nodes.forEach(function (node) {
                    if (node.order == swap.src) {
                        srcNode = node;
                    } else if (node.order == swap.dest) {
                        destNode = node;
                    }
                    //if(srcNode && destNode) return true;
                });
                if (srcNode !== null && destNode !== null) {
                    let tempSrcOrder = srcNode.order;
                    srcNode.order = destNode.order;
                    destNode.order = tempSrcOrder;
                } else {
                    throw new Error("srcOrder or destOrder not found.");
                }
            });
            matrixChart.signal("src", {}).update({'duration': 1000});
        }
    );

    let SwapStateChange = SIMProv.createStateChangeClass("SwapStateChange",
        function(state) {
            this.data.swaps.forEach(function (swap) {
                // console.log("START STATE", state);
                // console.log("SWAP:", swap);
                let temp = state[swap.src];
                state[swap.src] = state[swap.dest];
                state[swap.dest] = temp;
                // console.log("END STATE", state);
            });
            return state;

        }
    );

    let SwapAction = SIMProv.createActionClass("SwapAction",
        SwapChange,
        SwapChange,
        SwapStateChange,
        SwapStateChange);

    let OrderAction = SIMProv.createActionClass("OrderAction",
        OrderChange,
        null,
        OrderStateChange);

    // class OrderAction extends SIMProv.Action {
    //     constructor(orderby) {
    //         let data = {"orderby": orderby};
    //         super(new OrderChange(data),
    //             null,
    //             new OrderStateChange(data),
    //             null,
    //             orderby + " Ordering");
    //     }
    // }

    // Get Viz State
    function getVizState(){
        let state = new Array(matrixChart.data().nodes.length);
        matrixChart.data().nodes.forEach(function(d,i) { state[d.order] = d.index; });
        console.log("VIZ STATE", state);
        return state;
        // return matrixChart.data().nodes.map(function(d) { return d.order; }).slice();
    }

    // Set Viz State
    function setVizState(state) {
        // console.log(getVizState());
        let inv_state = new Array(state.length);
        state.forEach(function (d, i) {
            inv_state[d] = i;
        });
        // console.log(inv_state);
        matrixChart.data().nodes.forEach(function (d, i) {
            d.order = inv_state[d.index];
        });
        matrixChart.signal("src", {}).update({'duration': 1000});
    }

    console.log("CREATING TRAIL");

    // Create Trail
  var trail = new SIMProv.UITrail()
    .attr('viz', 'matrix-reorder-shift')
    .addControls()
    .renderTo("#controls")
      .init(getVizState());

  // Add Rule
  trail.checkpoint().addRule(function(change){
    return change.nodeInMasterTrail().childNodes().length > 1;
  });

  let ResetChange = SIMProv.createChangeClass("ResetChange",
      function() {
          setVizState(this.data);
      }, cost=2
  );

    trail.registerClasses([SwapAction, OrderAction, ResetChange]);

    // Get and Set State from Trail
    trail.resetChange = new ResetChange(getVizState());
  trail.getState(getVizState);
  trail.setState(setVizState);

    // Hold
    var swaps = [];

    // When element is selected or released from dragging
    matrixChart.onSignal('src', function(name, src){

      // Elements are swapped
      if(!src._id && swaps.length){

        // Prepare Data
        // var data = { 'type': 'swaps', 'data': swaps };

        // Record
        //   console.log("STATE!!!", getVizState());
          const data = {"swaps": swaps};
          const inv_swaps = swaps.slice();
          inv_swaps.reverse();
          const inv_data = {"swaps": inv_swaps};
          const label = "Swapped " + swaps[0].src + '...' + swaps[swaps.length-1].dest;

          let swapAction = new SwapAction(label, data, inv_data);
        trail.record(swapAction).then(function(action) {
            setTimeout(function () {
                action.setThumbnail(matrixChart.toImageURL());
            }, 1000);
        });

        // Clear Swaps after recording
        swaps = [];

      }

    });

    // Update Order
    matrixChart.onSignal('destOrder', function(name, order){
      if(order){
        var srcOrder = matrixChart.signal('dest').order;
        var destOrder = matrixChart.signal('src').order;
        if(srcOrder !== destOrder)
            swaps.push({src: matrixChart.signal('dest').order, dest: matrixChart.signal('src').order});
      }
    });

    matrixChart.onSignal('orderby', function(name, orderby) {

      // orderby 'user' will be captured by the swap
      if (orderby !== 'user') {

        // Prepare Data
        // var data = { 'type': 'orderby', 'data': orderby };

        // Record
        //   console.log("OSTATEO", getVizState());
          let orderAction = new OrderAction(orderby + " Ordering",
              {orderby: orderby});
        trail.record(orderAction).then(function(change){
  	       setTimeout(function() { change.setThumbnail(matrixChart.toImageURL()); }, 1000);
        });
      }

    });

// Capture
  var captureThumbnail = function(change){
    change.setThumbnail(matrixChart.toImageURL());
  };

  // Capture initial thumbnail
  captureThumbnail(trail.getActionById('root-node'));

    // console.log("STATE!S!", getVizState());
};
