svgObjects = (function () {

    circle = (function () {

        getCircle = () => {
            return {
                type: 'circle',
                props: {
                    'cx': 50,
                    'cy': 50,
                    'r': 10,
                    'fill': '#dcdcdc',
                    'stroke': '#000',
                    'stroke-width': 2
                },
                haveAnimation: false,
                animations: []
            };
        }

        return {
            getCircle
        }
    })();
    
    ellipse = (function () {

        getEllipse = () => {
            return {
                type: 'ellipse',
                props: {
                    'cx': 50,
                    'cy': 50,
                    'rx': 25,
                    'ry': 10,
                    'fill': '#dcdcdc',
                    'stroke': '#000',
                    'stroke-width': 2
                },
                haveAnimation: false,
                animations: []
            };
        }

        return {
            getEllipse
        }
    })();

    rect = (function () {

        getRect = () => {
            return {
                type: 'rect',
                props: {
                    'x': 10,
                    'y': 10,
                    'width': 30,
                    'height': 30,
                    'fill': 'none',
                    'stroke': '#000',
                    'stroke-width': 2
                },
                animations: []
            };
        }


        return {
            getRect
        }
    })();

    
    line = (function () {

        getLine = () => {
            return {
                type: 'line',
                props: {
                    'x1': 10,
                    'y1': 10,
                    'x2': 30,
                    'y2': 30,
                    'stroke': '#000',
                    'stroke-width': 2
                },
                animations: []
            };
        }


        return {
            getLine
        }
    })();


    animate = (function(){
        const animateProps = [
          'attributeName', 'begin', 'dur', 'end', 'min', 'max', 'restart', 'repeatCount', 'repeatDur', 'fill', 'calcMode', 'values', 'keyTimes', 'keySplines', 'from', 'to', 'by', 
        ]
        getAnimateProperties = (obj = {}) => {     
            let keys = Object.keys(obj);
            return animateProps.filter((el) => {
                return !keys.includes(el);
            });
        }

        addProp = (name, obj) => {
            if(!obj)
                obj = {};
            // animateProps = animateProps.filter((item) => item != name);
             obj[name] = '';
             return obj;
        }

        return {
            getAnimateProperties,
            addProp
        }
    })();

    return {
        circle,
        rect,
        ellipse,
        line,
        animate
    }
})();