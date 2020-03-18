svgWidgets = (function (svgObjects) {

    let widgetList = [];
    let previewBox = document.querySelector('.preview-box');
    let codeBox = document.querySelector('.code-box');
    let widgetHierarchy = document.querySelector('#widgetHierarchy');
    let toolbarControls = document.querySelector('#toolbarControls');

    let _selected = -1, _selectedAnimation = 0;

    let animationContainer = document.querySelector('.animation-control');
    let addAnimationPanel = document.querySelector('#addAnimationPanel');
    let toolbarAnimations = document.querySelector('#toolbarAnimations');

    let saveButton, exportButton;


    init = (props) => {
        saveButton = document.querySelector(props.saveButton);
        saveButton.style.display = 'none';

        exportButton = document.querySelector(props.exportButton);

        exportButton.addEventListener('click', exportSVG);

    }

    function addWidget(type) {
        let widget;
        switch (type) {
            case 'circle':
                widget = svgObjects.circle.getCircle();
                break;
            case 'rect':
                widget = svgObjects.rect.getRect();
                break;
        }

        if (widget) {
            widgetList.push(widget);
            rerender();
        }
    }



    rerender = () => {
        setAnimationProps();
        renderView();
        renderHierarchy();
        renderToolbar();
    }

    renderView = () => {
        previewBox.innerHTML = "";

        let viewBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        viewBox.setAttribute('width', 300);
        viewBox.setAttribute('height', 300);
        viewBox.setAttributeNS(null, 'viewBox', '0 0 100 100');
        viewBox.setAttribute('version', '1.1');
        viewBox.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        for (let item of widgetList) {
            let childWidget = document.createElementNS("http://www.w3.org/2000/svg", item.type);

            for (let [key, value] of Object.entries(item.props)) {
                childWidget.setAttribute(key, value);
            }

            if (item.animations && item.animations.length > 0) {
                item.animations.forEach((anim) => {
                    let animWidget = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                    for (let [key, value] of Object.entries(anim)) {
                        animWidget.setAttribute(key, value);
                    }
                    childWidget.appendChild(animWidget);
                });
            }

            viewBox.appendChild(document.createTextNode('&#13;'));
            viewBox.appendChild(childWidget);
        }
        previewBox.appendChild(viewBox);
        // console.log(viewBox.outerHTML);
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
                saveButton.style.display = 'block';
                renderToolbar();
                renderHierarchy();
            });
        }
    }


    renderToolbar = () => {
        toolbarControls.innerHTML = "";
        const item = widgetList[_selected];
        if (!item)
            return;

        for (let [key, value] of Object.entries(item.props)) {

            toolbarControls.appendChild(createInputRow(key, value, 'control-row'));
        }
        toolbarControls.appendChild(createCheckRow('Animate', item['haveAnimation'], 'control-row', function(){
            item['haveAnimation'] = !item['haveAnimation'];
            item.animations.push({});
            rerender();
        }));

        if(item['haveAnimation'])
            animationContainer.classList.remove('hide');
        else
            animationContainer.classList.add('hide');

        createAnimationBlock(item.animations);

        saveButton.addEventListener('click', function () {
            const item = widgetList[_selected];
            let props = {};
            for (let child of toolbarControls.childNodes) {
                let c = child.childNodes;
                if(c[1])
                    props[c[0].innerHTML.toLowerCase()] = c[1].value;
            }

            item.props = props;
            
            const anims = item.animations;
            let anim = {};
            for (let child of toolbarAnimations.childNodes) {
                let c = child.childNodes;
                anim[c[1].getAttribute('data-key')] = c[1].value;
            }
            anims[0] = anim;
            item.animations = anims;

            // _selected = -1;
            rerender();
        });

        
        renderAnimationProps();
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

        var wrapper = document.createElement('div');
        wrapper.setAttribute('id', 'export-div');
        wrapper.innerHTML = html;
        let textarea = wrapper.querySelector('#export-area');

        // let code = document.createElement('code');
        // code.setAttribute('class', 'xml');
        // textarea.appendChild(code);
        // // code.textContent = previewBox.innerHTML.replace('--new--', '&#13;');
        // c = "<pre><code class='code'>" + previewBox.innerHTML + "</code></pre>";
        textarea.textContent = previewBox.innerHTML;
        // content = previewBox.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"")
        // lines = content.split(/\s*<br ?\/?>\s*/);
        // console.log(lines);

        // textarea.innerHTML = htmlEntities(previewBox.innerHTML);

        // var w = document.createElement('div');
        // w.innerHTML = previewBox.innerHTML;
        // textarea.textContent = w.innerHTML.replace('--new--', '&#13;');

        // console.log(convert(previewBox));

        wrapper.querySelector('#closeButton').addEventListener('click', closeExportBox);

        if (document.body != null)
            document.body.appendChild(wrapper);

        // hljs.configure({ useBR: true });

        // document.querySelectorAll('div#export-area').forEach((block) => {
        //     hljs.highlightBlock(block);
        // });

        // document.querySelectorAll('pre code').forEach((block) => {
        //     hljs.highlightBlock(block);
        // });
    }

    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function closeExportBox() {
        let exportDiv = document.querySelector('#export-div');
        if (exportDiv)
            exportDiv.remove();
    }




    function setAnimationProps() {
        addAnimationPanel.innerHTML = "";

        const animateProps = svgObjects.animate.getAnimateProperties();

        let animateSelect = document.createElement("select");
        animateSelect.setAttribute('id', 'animateSelect');

        animateProps.forEach((item) => {
            let option = document.createElement("option");
            option.text = item;
            option.value = item;
            animateSelect.appendChild(option);
        });

        let addAnimatebutton = document.createElement('input');
        addAnimatebutton.setAttribute('type', 'button');
        addAnimatebutton.value = "+";

        addAnimationPanel.appendChild(animateSelect);
        addAnimationPanel.appendChild(addAnimatebutton);

        addAnimatebutton.addEventListener('click', function () {
            // console.log();
            const item = widgetList[_selected];
            if (item) {
                const anims = item.animations;

                // let props = {};
                // for (let child of toolbarAnimations.childNodes) {
                //     let c = child.childNodes;
                //     props[c[1].getAttribute('data-key')] = c[1].value;
                // }
                // anims[_selectedAnimation] = props;
                saveAnimationProps(anims);

                if (anims) {
                    anims[_selectedAnimation] = svgObjects.animate.addProp(animateProps[animateSelect.selectedIndex], anims[_selectedAnimation]);

                    widgetList[_selected] = item;

                    rerender();
                }
            }
        });
    }

    function saveAnimationProps(anims){
        
        let props = {};
        for (let child of toolbarAnimations.childNodes) {
            let c = child.childNodes;
            props[c[1].getAttribute('data-key')] = c[1].value;
        }
        anims[_selectedAnimation] = props;
    }

    function renderAnimationProps() {
        toolbarAnimations.innerHTML = "";

        const item = widgetList[_selected];
        if (item) {
            const anims = item.animations;
            if (anims) {
                anims.forEach((anim, index) => {     
                    for (let [key, value] of Object.entries(anim)) {  
                        // let childWidget = document.createElement('div');
                        // childWidget.setAttribute('class', 'animation-row');
            
                        // let label = document.createElement('label');
                        // label.innerHTML = key.toUpperCase();
            
                        // let input = document.createElement('input');
                        // input.value = value;
                        // input.setAttribute('data-key', key);
                        // // input.addEventListener('change', function(){
                        // //     ListeningStateChangedEvent();return
                        // // });
            
                        // childWidget.appendChild(label);
                        // childWidget.appendChild(input);
            
                        toolbarAnimations.appendChild(createInputRow(key, value, 'animation-row'));

                    }
                })
            }
        }
        
    }

    function createInputRow(key, value, rowClass){
        
        let childWidget = document.createElement('div');
        childWidget.setAttribute('class', rowClass);

        let label = document.createElement('label');
        label.innerHTML = key.toUpperCase();

        let input = document.createElement('input');
        input.value = value;
        input.setAttribute('data-key', key);

        childWidget.appendChild(label);
        childWidget.appendChild(input);
        return childWidget;
    }

    function createCheckRow(key, value, rowClass, callback){
        
        let childWidget = document.createElement('div');
        childWidget.setAttribute('class', rowClass);

        let label = document.createElement('label');
        label.innerHTML = key.toUpperCase();

        let input = document.createElement('input');
        input.checked = value;
        input.setAttribute('data-key', key);
        input.setAttribute('type', 'checkbox');
        input.addEventListener('change', callback);

        childWidget.appendChild(label);
        childWidget.appendChild(input);
        return childWidget;
    }

    function createAnimationBlock(anims){

        if(anims.length == 0)
            return;
        
        let animationBlocks = document.createElement('div');
        animationBlocks.classList.add('animation-blocks');

        for(let i=0; i<anims.length; i++){
            let chip = document.createElement('a');
            chip.classList.add('chip');
            chip.innerText = 'Animation '+(i+1);
            chip.addEventListener('click', function(){
                saveAnimationProps(anims);
                _selectedAnimation = i;
                renderToolbar();
            });

            if(i === _selectedAnimation)
                chip.classList.add('selected-chip');

            animationBlocks.appendChild(chip);
        }

        
        let chip = document.createElement('a');
        chip.classList.add('chip');
        chip.classList.add('add');
        chip.innerText = '+';
        chip.addEventListener('click', function(){
            saveAnimationProps(anims);
            anims.push({});
            rerender();
        });
        animationBlocks.appendChild(chip);

        console.log(animationBlocks);
        toolbarControls.appendChild(animationBlocks);
    }
    

    return {
        addWidget,
        init
    }
})(svgObjects);