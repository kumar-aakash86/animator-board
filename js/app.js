svgWidgets = (function (svgObjects) {



    let widgetList = [];
    let previewBox = document.querySelector('.preview-box');
    let codeBox = document.querySelector('.code-box');
    let widgetHierarchy = document.querySelector('#widgetHierarchy');
    let toolbarControls = document.querySelector('#toolbarControls');
    let previewSize = document.querySelector('#previewSize');

    let _selected = -1, _selectedAnimation = 0;

    let animationContainer = document.querySelector('.animation-control');
    let addAnimationPanel = document.querySelector('#addAnimationPanel');
    let toolbarAnimations = document.querySelector('#toolbarAnimations');
    let pathPointBox = document.querySelector('.path-points-box');

    let settingsButton = document.querySelector('#settingsButton');
    let settingBox = document.querySelector('#settingBox');
    let selectExample = document.querySelector('#selectExample');
    let showSetting = false;

    let width = 100, height = 100;

    let svgProps = {
        saveButton: null,
        exportButton: null,
        deleteButton: null,
        deleteAnimationButton: null,
        dimensionButton: null,
        selectedLabel: null,
        frameWidth: null,
        frameHeight: null,
        viewBox: null
    }

    init = (props) => {

        svgProps = Object.assign({}, svgProps, props);

        previewBox.style.width = svgProps.frameWidth.value + 'px';
        previewBox.style.height = svgProps.frameHeight.value + 'px';

        svgProps.saveButton.style.visibility = 'hidden';
        svgProps.deleteButton.style.visibility = 'hidden';
        svgProps.deleteButton.addEventListener('click', deleteWidget);

        svgProps.exportButton.addEventListener('click', exportSVG);

        svgProps.dimensionButton.addEventListener('click', changeDimension);

        generateExampleList();
    }

    function addWidget(type) {
        hideSetting();
        let widget;
        switch (type) {
            case 'circle':
                widget = svgObjects.circle.getShape();
                break;
            case 'rect':
                widget = svgObjects.rect.getShape();
                break;
            case 'ellipse':
                widget = svgObjects.ellipse.getShape();
                break;
            case 'line':
                widget = svgObjects.line.getShape();
                break;
            case 'polygon':
                widget = svgObjects.polygon.getShape();
                break;
        }

        if (widget) {
            widgetList.push(widget);
            rerender();
        }
    }

    changeDimension = () => {
        previewBox.style.width = svgProps.frameWidth.value + 'px';
        previewBox.style.height = svgProps.frameHeight.value + 'px';
        previewSize.innerHTML = svgProps.frameWidth.value + ' x ' + svgProps.frameHeight.value;
        rerender();
    }

    rerender = () => {
        renderView();
        renderHierarchy();
        renderToolbar();
    }

    renderView = () => {
        previewBox.innerHTML = "";

        let viewBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        viewBox.setAttribute('width', svgProps.frameWidth.value);
        viewBox.setAttribute('height', svgProps.frameHeight.value);
        viewBox.setAttributeNS(null, 'viewBox', svgProps.viewBox.value);
        viewBox.setAttribute('version', '1.1');
        viewBox.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        for (let item of widgetList) {
            let childWidget = document.createElementNS("http://www.w3.org/2000/svg", item.type);

            for (let [key, value] of Object.entries(item.props)) {
                childWidget.setAttribute(key, value);
            }

            if (item['haveAnimation'] && item.animations && item.animations.length > 0) {
                item.animations.forEach((anim) => {
                    let animWidget = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                    for (let [key, value] of Object.entries(anim)) {
                        animWidget.setAttribute(key, value);
                    }
                    childWidget.appendChild(animWidget);
                });
            }
            viewBox.appendChild(childWidget);
        }
        previewBox.appendChild(viewBox);
    }

    renderHierarchy = () => {
        widgetHierarchy.innerHTML = "";

        for (const [index, item] of widgetList.entries()) {
            let childWidget = document.createElement("li");
            if (index == _selected)
                childWidget.classList.add('selected');

            let button = document.createElement('a');
            button.setAttribute('data-index', index);
            button.innerText = item.type.toUpperCase();
            childWidget.appendChild(button);

            widgetHierarchy.appendChild(childWidget);

            button.addEventListener('click', function () {
                _selected = this.getAttribute('data-index');
                _selectedAnimation = 0;
                svgProps.saveButton.style.visibility = 'visible';
                svgProps.deleteButton.style.visibility = 'visible';
                renderToolbar();
                renderHierarchy();
                hideSetting();
            });
        }
    }

    renderToolbar = () => {
        toolbarControls.innerHTML = "";
        const item = widgetList[_selected];
        if (!item) {
            svgProps.selectedLabel.textContent = "";
            svgProps.saveButton.style.visibility = 'hidden';
            svgProps.deleteButton.style.visibility = 'hidden';
            return;
        }

        svgProps.selectedLabel.textContent = item.type;

        const pointKey = item['break'];
        if (pointKey)
            pathPointBox.style.visibility = 'visible';
        else
            pathPointBox.style.visibility = 'hidden';

        for (let [key, value] of Object.entries(item.props)) {
            if (key != pointKey)
                toolbarControls.appendChild(createInputRow(key, value, 'control-row'));
        }

        toolbarControls.appendChild(createCheckRow('Animate', item['haveAnimation'], 'control-row-skip', function () {
            item['haveAnimation'] = !item['haveAnimation'];
            // item.animations.push({});
            rerender();
        }));

        svgProps.saveButton.removeEventListener('click', saveSettings);
        svgProps.saveButton.addEventListener('click', saveSettings);

        if (item.hasOwnProperty('break')) {
            createPointsBlock(item.props[item['break']]);
        }

        if (item['haveAnimation']) {
            createAnimationBlock(item.animations);

            if (item.animations.length > 0) {
                animationContainer.classList.remove('hide');
                setAnimationProps(item);
                renderAnimationProps(item.animations);
            }
            else {
                animationContainer.classList.add('hide');
                setAnimationProps(null);
                renderAnimationProps(null);
            }
        }
        else
            animationContainer.classList.add('hide');
    }

    function saveSettings(e) {
        const item = widgetList[_selected];
        let props = {};

        for (let child of toolbarControls.childNodes) {
            const c = child.childNodes;
            if (c.length > 1) {
                const input = c[1].childNodes;
                if ((!c[0].hasAttribute('data-key') || c[0].getAttribute('data-key') != 'skip-this') && input[0])
                    props[c[0].innerHTML.toLowerCase()] = input[0].value;
            }
        }

        const pointKey = item['break'];
        if (pointKey) {
            props[pointKey] = savePoints();
        }

        item.props = props;

        const anims = item.animations;
        if (anims.length > 0) {
            let anim = {};
            for (let child of toolbarAnimations.childNodes) {
                const c = child.childNodes;
                const input = c[1].childNodes;
                if (!c[0].hasAttribute('data-key') || c[0].getAttribute('data-key') != 'skip-this')
                    anim[input[0].getAttribute('data-key')] = input[0].value;
            }
            anims[_selectedAnimation] = anim;
            item.animations = anims;
        }

        rerender();
    }


    function exportSVG() {
        let html = `<div class="cover"></div>
        <div class="code-box">
            <div class="export-box-header">
                <h3>EXPORT</h3>
                <a href="#" id="closeButton" >X</a>
            </div>
            <div class="export-code-body">
                <pre id="export-area" ></per>
            </div>
        </div>`;

        const wrapper = document.createElement('div');
        wrapper.setAttribute('id', 'export-div');
        wrapper.innerHTML = html;
        const textarea = wrapper.querySelector('#export-area');

        textarea.textContent = previewBox.innerHTML;

        wrapper.querySelector('#closeButton').addEventListener('click', closeExportBox);

        hideSetting();
        if (document.body != null)
            document.body.appendChild(wrapper);
    }

    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function closeExportBox() {
        let exportDiv = document.querySelector('#export-div');
        if (exportDiv)
            exportDiv.remove();
    }

    function setAnimationProps(item) {
        addAnimationPanel.innerHTML = "";

        if (!item)
            return;

        let anim = item.animations[_selectedAnimation];

        const animateProps = svgObjects.animate.getAnimateProperties(anim);

        let animateSelect = document.createElement("select");
        animateSelect.setAttribute('id', 'animateSelect');

        animateProps.forEach((prop) => {
            let option = document.createElement("option");
            option.text = prop;
            option.value = prop;
            animateSelect.appendChild(option);
        });

        let addAnimatebutton = document.createElement('input');
        addAnimatebutton.setAttribute('type', 'button');
        addAnimatebutton.value = "+";

        addAnimationPanel.appendChild(animateSelect);
        addAnimationPanel.appendChild(addAnimatebutton);

        addAnimatebutton.addEventListener('click', function () {
            if (item) {
                const anims = item.animations;

                saveAnimationProps(anims);

                if (anims) {
                    anims[_selectedAnimation] = svgObjects.animate.addProp(animateProps[animateSelect.selectedIndex], anims[_selectedAnimation]);

                    widgetList[_selected] = item;

                    renderToolbar();
                }
            }
        });

        svgProps.deleteAnimationButton.removeEventListener('click', deleteAnimation);
        svgProps.deleteAnimationButton.addEventListener('click', deleteAnimation);
    }

    function saveAnimationProps(anims) {
        return new Promise((resolve, reject) => {
            let props = {};
            for (let child of toolbarAnimations.childNodes) {
                const c = child.childNodes;
                const input = c[1].childNodes;
                props[input[0].getAttribute('data-key')] = input[0].value;
            }
            anims[_selectedAnimation] = props;
            resolve(anims);
        });
    }

    function renderAnimationProps(anims) {
        toolbarAnimations.innerHTML = "";

        if (anims) {
            let anim = anims[_selectedAnimation];
            if (anim)
                for (let [key, value] of Object.entries(anim)) {
                    toolbarAnimations.appendChild(createInputRow(key, value, 'animation-row', async function (e) {
                        await saveAnimationProps(anims);
                        const key = e.currentTarget.getAttribute('data-key');
                        anims[_selectedAnimation] = svgObjects.animate.removeProp(key, anims[_selectedAnimation]);
                        renderToolbar();
                    }));

                }
        }
    }

    function createInputRow(key, value, rowClass, removeCallback) {

        let childWidget = document.createElement('div');
        childWidget.setAttribute('class', rowClass);

        let label = document.createElement('label');
        label.innerHTML = key;
        if (rowClass === 'control-row-skip')
            label.setAttribute('data-key', 'skip-this');

        let inputContainer = document.createElement('div');
        let input = document.createElement('input');
        input.value = value;
        input.setAttribute('data-key', key);
        inputContainer.appendChild(input);

        if (removeCallback) {
            let removeButton = document.createElement('a');
            let buttonBody = `<div class="glyph fs1">
                <div class="clearfix pbs">
                    <svg class="icon icon-cancel-circle"><use xlink:href="styles/symbol-defs.svg#icon-cancel-circle"></use></svg>
                </div>
            </div>`;
            removeButton.classList.add('remove-btn');
            removeButton.setAttribute('data-key', key);
            removeButton.innerHTML = buttonBody;
            removeButton.addEventListener('click', removeCallback);
            inputContainer.appendChild(removeButton);
        }

        childWidget.appendChild(label);
        childWidget.appendChild(inputContainer);
        return childWidget;
    }

    function createCheckRow(key, value, rowClass, callback) {

        let childWidget = document.createElement('div');
        childWidget.setAttribute('class', rowClass);

        let label = document.createElement('label');
        label.innerHTML = key;
        if (rowClass === 'control-row-skip') {
            label.setAttribute('data-key', 'skip-this');
        }

        let input = document.createElement('input');
        input.checked = value;
        input.setAttribute('data-key', key);
        input.setAttribute('type', 'checkbox');
        input.removeEventListener('change', callback);
        input.addEventListener('change', callback);

        childWidget.appendChild(label);
        childWidget.appendChild(input);
        return childWidget;
    }

    function createAnimationBlock(anims) {


        let animationBlocks = document.createElement('div');
        animationBlocks.classList.add('animation-blocks');

        for (let i = 0; i < anims.length; i++) {
            let chip = document.createElement('a');
            chip.setAttribute('data-key', 'skip-this');
            chip.classList.add('chip');
            chip.innerText = 'Animation ' + (i + 1);
            chip.addEventListener('click', function () {
                saveAnimationProps(anims);
                _selectedAnimation = i;
                renderToolbar();
            });

            if (i === _selectedAnimation)
                chip.classList.add('selected-chip');

            animationBlocks.appendChild(chip);
        }

        let chip = document.createElement('a');
        chip.classList.add('chip');
        chip.classList.add('add');
        chip.innerText = '+';
        chip.addEventListener('click', async function () {
            anims.push({});
            anims = await saveAnimationProps(anims);
            renderToolbar();
        });
        animationBlocks.appendChild(chip);

        toolbarControls.appendChild(animationBlocks);
    }

    function createPointsBlock(value) {
        pathPointBox.innerHTML = "";

        if (!value || value.length == 0)
            return;

        let pointsBlocks = document.createElement('div');
        pointsBlocks.classList.add('animation-blocks');

        let points = value.split(' ');
        for (let p of points) {
            let chip = document.createElement('input');
            chip.classList.add('point-chip');
            chip.setAttribute('data-key', 'read');
            chip.value = p;

            pointsBlocks.appendChild(chip);
        }

        let chip = document.createElement('a');
        chip.classList.add('chip');
        chip.classList.add('add');
        chip.innerText = '+';
        chip.addEventListener('click', function () {
            const item = widgetList[_selected];
            if (item) {
                const props = item['props'];
                props[item['break']] = savePoints("0,0");
                item['props'] = props;
                widgetList[_selected] = item;
            }
            renderToolbar();
        });
        pointsBlocks.appendChild(chip);
        pathPointBox.appendChild(pointsBlocks);
    }

    function savePoints(newValue) {
        let points = '';
        let pointList = pathPointBox.childNodes[0];
        for (let child of pointList.childNodes) {
            if (child.hasAttribute('data-key') && child.getAttribute('data-key') == 'read') {
                points += child.value + ' ';
            }
        }
        if (newValue)
            points += newValue;

        return points.trim();
    }

    function deleteWidget() {
        if (_selected < 0)
            return;

        let response = confirm('Are you sure you want to delete current shape ?');
        if (response) {
            widgetList.splice(_selected, 1);
            _selected = -1;
            createPointsBlock();
            addAnimationPanel.innerHTML = "";
            toolbarAnimations.innerHTML = "";
            animationContainer.classList.add('hide');
            rerender();
        }
    }

    function deleteAnimation() {
        let response = confirm('Are you sure, you want to delete this animation ?');

        if (response) {
            let item = widgetList[_selected];
            if (item) {
                let anims = item.animations;
                if (anims) {
                    anims.splice(_selectedAnimation, 1);
                }
            }
            rerender();
        }
    }

    settingsButton.addEventListener('click', function () {
        showSetting = !showSetting;
        if (showSetting) {
            settingBox.classList.remove('hide');
        }
        else {
            hideSetting();
        }
    });

    function hideSetting() {
        selectExample.selectedIndex = 0;
        settingBox.classList.add('hide');
    }

    function generateExampleList() {
        let option = document.createElement('option');
        option.innerHTML = "Select";
        selectExample.appendChild(option);
        examples.forEach(function (item, i) {
            option = document.createElement('option');
            option.value = i;
            option.innerHTML = item.name;
            selectExample.appendChild(option);
        });
    }

    selectExample.addEventListener('change', function () {
        if (selectExample.selectedIndex > 0) {
            console.log(examples[selectExample.selectedIndex - 1].data);
            widgetList.push(examples[selectExample.selectedIndex - 1].data);
            rerender();
        }
    })

    return {
        addWidget,
        init
    }
})(svgObjects);