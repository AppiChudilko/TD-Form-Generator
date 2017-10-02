var res = API.getScreenResolutionMaintainRatio();
var formManager = new FormManager();
var inc = 0;

API.onServerEventTrigger.connect(function (name, args) {
    switch (name) {
        case "showForm":
            formManager
                .createWindow('form1', 'Title', 1000, 600, true)
                .addText('form1', 'Test message on the form', (res.Width / 2), (res.Height / 2), 0.4, 0, 255, 255, 255, 255, 1, false, false, 900)
                .addButton('form1', 'BtnTest', 'btnName', (res.Width / 2) + 373, (res.Height / 2) + 318, 100, 40, 4, 33, 150, 243, 120)
                .setHoverable('form1', 'btnName', true, 33, 150, 243, 200)
                .setClickable('form1', 'btnName', true, 'testFunc')
                .show('form1')
            ;
            break;
        case "hideForm":
            formManager.hide();
            break;
    }
});

function testFunc(args) {
    API.displaySubtitle("Btn click: ~g~" + args[0], 5000);
    API.sendNotification("CountClick: " + (++inc));
}

function FormManager() {

    var components = [];    
    var count = 0;
    var showForm = null;

    this.createWindow = function (formName, title, width, height, showCursor, hideChat) {
        title = typeof title !== "undefined" ? title : 'Form';
        formName = typeof formName !== "undefined" ? formName : 'Form';
        width = typeof width !== "undefined" ? width : 1000;
        height = typeof height !== "undefined" ? height : 600;
        showCursor = typeof showCursor !== "undefined" ? showCursor : false;
        hideChat = typeof hideChat !== "undefined" ? hideChat : false;
        floatX = typeof floatX !== "undefined" ? floatX : 1;
        floatY = typeof floatY !== "undefined" ? floatY : 1;

        this.addComponent(formName, this.setProperties('body', (res.Width / 2) - 500, (res.Height / 2) - 221, width, height, 0, 0, 0, 0, 180));
        this.addComponent(formName, this.setProperties('header', (res.Width / 2) - 500, (res.Height / 2) - 221, width, 50, 0, 33, 150, 243, 120));
        this.addComponent(formName, this.setProperties('title', (res.Width / 2) - 490, (res.Height / 2) - 221, 0.8, 0.8, 1, 255, 255, 255, 255, title, 1));
              
        API.showCursor(showCursor);
        API.setChatVisible(!hideChat);
        return this;
    };
    
    this.addButton = function (formName, text, itemName, x, y, width, height, font, r, g, b, a) {
        this.addComponent(formName, this.setProperties(itemName, x, y, width, height, 0, r, g, b, a));
        this.addComponent(formName, this.setProperties(itemName + '-label', x + (width / 2), y + 3, 0.4, 0.4, 1, 255, 255, 255, 255, text, 0, 1));
        return this;
    };
    
    this.addText = function (formName, text, x, y, size, font, r, g, b, a, aligment, shadow, outline, wordWrap) {
        this.addComponent(formName, this.setProperties('text', x, y, size, size, 1, r, g, b, a, text, font, aligment, shadow, outline, wordWrap));
        return this;
    };
    
    this.addComponent = function (formName, component) {
        if (typeof components[formName] === "object")
            components[formName].push(component);
        else
            components[formName] = [component];
    };
    
    this.setProperties = function (name, x, y, width, height, type, colorR, colorG, colorB, colorA, text, font, aligment, shadow, outline, wordWrap) {

        x = typeof x !== "undefined" ? x : (res.Width / 2);
        y = typeof y !== "undefined" ? y : (res.Height / 2);
        width = typeof width !== "undefined" ? width : 1;
        height = typeof height !== "undefined" ? height : 1;
        type = typeof type !== "undefined" ? type : 0; //0 - rectangle, 1 - text
        name = typeof name !== "undefined" ? name : 'empty';
        
        colorR = typeof colorR !== "undefined" ? colorR : 255;
        colorG = typeof colorG !== "undefined" ? colorG : 255;
        colorB = typeof colorB !== "undefined" ? colorB : 255;
        colorA = typeof colorA !== "undefined" ? colorA : 255;
        
        text = typeof text !== "undefined" ? text : "";
        font = typeof font !== "undefined" ? font : 4;
        aligment = typeof aligment !== "undefined" ? aligment : 0;
        shadow = typeof shadow !== "undefined" ? shadow : false;
        outline = typeof outline !== "undefined" ? outline : false;
        wordWrap = typeof wordWrap !== "undefined" ? wordWrap : 0;
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            type: type,
            name: name,
            text: {
                text: text,
                aligment: aligment,
                shadow: shadow,
                outline: outline,
                font: font,
                wordWrap: wordWrap
            },
            color: {
                r: colorR,
                g: colorG,
                b: colorB,
                a: colorA
            },
            events: {
                clickable: false,
                onClick: {
                    functionName: '',
                    args: null
                },
                hoverable: false,
                onHover: {
                    r: colorR,
                    g: colorG,
                    b: colorB,
                    a: colorA,
                }
            }
        }
    };

    this.setHoverable = function (formName, itemName, value, r, g, b, a) {
        components[formName].forEach(function(item, i, arr) {
            if (item.name == itemName) {
                item.events.hoverable = value;
                item.events.onHover.r = r;
                item.events.onHover.g = g;
                item.events.onHover.b = b;
                item.events.onHover.a = a;
            }
        });
        return this;
    };

    this.setClickable = function (formName, itemName, value, functionName) {
        components[formName].forEach(function(item, i, arr) {
            if (item.name == itemName) {
                item.events.clickable = value;
                item.events.onClick.functionName = functionName;
                item.events.onClick.args = [].slice.call(arguments).splice(4);
                item.events.onClick.args = [item.name].concat(item.events.onClick.args);
            }
        });
        return this;
    };

    this.show = function (formName) {
        showForm = formName;
    }

    this.hide = function () {
        showForm = null;
        components = [];
    };

    API.onUpdate.connect(function (sender, args) {
        if (showForm != null) {            
            components[showForm].forEach(function(item, i, arr) {
                if (item.type == 0) {                    
                    if (item.events.hoverable === true) {
                        var mousePos = API.getCursorPositionMaintainRatio();                        
                        if(mousePos.X > item.x && mousePos.X < item.x + item.width && mousePos.Y > item.y && mousePos.Y < item.y + item.height) {
                            API.drawRectangle(item.x, item.y, item.width, item.height, item.events.onHover.r, item.events.onHover.g, item.events.onHover.b, item.events.onHover.a);
                            if (item.events.clickable === true && API.isControlJustPressed(24))
                                eval(item.events.onClick.functionName)(item.events.onClick.args);
                        }
                        else
                            API.drawRectangle(item.x, item.y, item.width, item.height, item.color.r, item.color.g, item.color.b, item.color.a);
                    }
                    else
                        API.drawRectangle(item.x, item.y, item.width, item.height, item.color.r, item.color.g, item.color.b, item.color.a);
                }
                else if (item.type == 1)
                    API.drawText(item.text.text, item.x, item.y, item.width, item.color.r, item.color.g, item.color.b, item.color.a, item.text.font, item.text.aligment, item.text.shadow, item.text.outline, item.text.wordWrap);
            });
        }
    });
}