svgObjects = (function () {

    circle = (function () {

        getShape = (_anims) => {
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
                haveAnimation: _anims ? true : false,
                animations: _anims ?? []
            };
        }

        return {
            getShape
        }
    })();

    ellipse = (function () {

        getShape = (_anims) => {
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
                haveAnimation: _anims ? true : false,
                animations: _anims ?? []
            };
        }

        return {
            getShape
        }
    })();

    rect = (function () {

        getShape = (_anims) => {
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
                haveAnimation: _anims ? true : false,
                animations: _anims ?? []
            };
        }


        return {
            getShape
        }
    })();


    line = (function () {

        getShape = (_anims) => {
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
                haveAnimation: _anims ? true : false,
                animations: _anims ?? []
            };
        }


        return {
            getShape
        }
    })();


    polygon = (function () {

        getShape = (_anims) => {
            return {
                type: 'polygon',
                break: 'points',
                props: {
                    'points': '50,10 80,90 30,61',
                    'fill': '#dcdcdc',
                    'stroke': '#000',
                    'stroke-width': 2
                },
                haveAnimation: _anims ? true : false,
                animations: _anims ?? []
            };
        }


        return {
            getShape
        }
    })();


    animate = (function () {
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
            if (!obj)
                obj = {};
            // animateProps = animateProps.filter((item) => item != name);

            if (name == null)
                return obj;
            obj[name] = '';
            return obj;
        }

        removeProp = (name, obj) => {
            delete obj[name];
            return obj;
        }

        return {
            getAnimateProperties,
            addProp,
            removeProp
        }
    })();

    return {
        circle,
        rect,
        ellipse,
        line,
        polygon,
        animate
    }
})();