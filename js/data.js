let examples = [
    {
        "name": "Animated Circle",
        "data": svgObjects.circle.getShape([
            {
                "attributeName": "r",
                "from": 10,
                "to": 30,
                "dur": "3s",
                "repeatCount": "indefinite"
            }
        ]),
    },
    {
        "name": "Animated Rectangle",
        "data": svgObjects.rect.getShape([
            {
                "attributeName": "width",
                "from": 30,
                "to": 50,
                "dur": "2s"
            }
        ]),
    }
]