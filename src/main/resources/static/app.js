var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var id = 0;
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    var addPolygonToCanvas = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = '#FF9900';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.fill();
    };
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                var point=JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
            stompClient.subscribe('/topic/newpolygon.' + id, function (eventbody) {
                var polygon=JSON.parse(eventbody.body);
                addPolygonToCanvas(polygon);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            var ctx = can.getContext('2d');
            ctx.canvas.width  = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            
            $(can).click( function (e){
                var pt = getMousePosition(e);
                app.publishPoint(pt.x, pt.y);
                stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));
            });  
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },
        
        connect: function (identifier) {
            id = identifier;
            app.init();
        }
    };

})();