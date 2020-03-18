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
                //  [{
                //     'attributeName': 'r', 
                //     'begin':'0s',
                //     'dur':'1s',
                //     'repeatCount': 'indefinite',
                //     'from':'5%',
                //     'to':'25%'
                // }]
            };
        }

        return {
            getCircle
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


    animate = (function(){
        let animateProps = [
          'attributeName', 'begin', 'dur', 'end', 'min', 'max', 'restart', 'repeatCount', 'repeatDur', 'fill', 'calcMode', 'values', 'keyTimes', 'keySplines', 'from', 'to', 'by', 
        ]
        getAnimateProperties = () => {
            return animateProps;
        }

        addProp = (name, obj) => {
            if(!obj)
                obj = {};
            animateProps = animateProps.filter((item) => item != name);
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
        animate
    }
})();