// Get DomComponents module
var comps = editor.DomComponents;

// Get the model and the view from the default Component type
var defaultType = comps.getType('default');
var defaultModel = defaultType.model;
var defaultView = defaultType.view;

var inputTypes = [
    {value: 'text', name: 'Text'},
    {value: 'email', name: 'Email'},
    {value: 'password', name: 'Password'},
    {value: 'number', name: 'Number'},
];

comps.addType('banana', {
    isComponent: el => {
        if(el.tagName == 'BANANA'){
            return {type: 'banana'};
        }
    },
    // Define the Model
    model: {
            // Extend default properties
            defaults: {
                tagName: 'input',
                // Can be dropped only inside `form` elements
                // draggable: 'form, form *',
                draggable: true,
                // Can't drop other elements inside it
                droppable: false,
                // Traits (Settings)
                traits: [
                    'name',
                    'placeholder',
                    {
                        // Change the type of the input (text, password, email, etc.)
                        type: 'select',
                        label: 'Type',
                        name: 'type',
                        options: inputTypes,
                        changeProp: true
                    },{
                        // Can make it required for the form
                        type: 'checkbox',
                        label: 'Required',
                        name: 'required',
                    },
                    {
                        type: 'checkbox',
                        label: 'Repeat',
                        name: 'repeat',
                        changeProp: true
                    }
                ],
                style: {
                    'font-size': '24px'
                },

                script: function() {
                    console.log('inside script', arguments, this);
                }
            },

        init() {
            console.log('Local hook: model.init', this);
            this.listenTo(this, 'change:type', this.onTypeChange);
            this.listenTo(this, 'change:repeat', this.onRepeatChange);
            // this.listenTo(this, 'change:testprop', this.handlePropChange);
            // Here we can listen global hooks with editor.on('...')
        },

        onTypeChange() {
            console.log('trait changed', this);
            console.log(this.model, this.view);
            // this.view.el.setAttribute('type', this.changed.type);
            this.addAttributes({
                type: this.changed.type
            });
            // this.setAttributes({
            //     ...this.getAttributes(),
            //     type: this.changed.type
            // });
        },

        onRepeatChange() {
            const isRepeat = this.changed.repeat;
            console.log(this.parent().find('h5'));
            if (isRepeat) {
                this.parent().append({
                    id: 'something',
                    tagName: 'h5',
                    content: 'Added'
                });
            } else {
                this.parent().find('h5')[0].remove();
            }
        }

        // updated(property, value, prevValue) {
        //     console.log('Local hook: model.updated',
        //         'property', property, 'value', value, 'prevValue', prevValue);
        // },
        // removed() {
        //     console.log('Local hook: model.removed');
        // },
        // handlePropChange() {
        //     console.log('The value of testprop', this.get('testprop'));
        // }

    },
    // Define the View
    view: {
        // Bind events
        events: {
            // If you want to bind the event to children elements
            // 'click .someChildrenClass': 'methodName',
            click: 'handleClick',
            dblclick: 'handleDblClick'
        },

        // init() {
        //     console.log('Local hook: view.init');
        // },
        // onRender() {
        //     console.log('Local hook: view.onRender');
        // },

        // It doesn't make too much sense this method inside the component
        // but it's ok as an example
        randomHex: function() {
            return '#' + Math.floor(Math.random()*16777216).toString(16);
        },

        handleClick: function(e) {
            this.model.set('style', {color: this.randomHex()}); // <- Affects the final HTML code
            this.el.style.backgroundColor = this.randomHex(); // <- Doesn't affect the final HTML code
            // Tip: updating the model will reflect the changes to the view, so, in this case,
            // if you put the model change after the DOM one this will override the backgroundColor
            // change made before
        },

        handleDblClick: function(e) {
            alert('hi');
        },

        init() {
            console.log('view init', this.model);

            // const components = this.model.get('components');
            // if (!components.length) {
            //     console.log('new component');
            //     components.reset();
            //     components.add(`
            //         <h4>Banana Input</h4>
            //         <input />
            //     `);
            // }
        },

        // render: function() {
        //     console.log('render', this);
        //     return this;
        // }

        // The render() should return 'this'
        // render: function () {
        //     console.log('view render', this.el);
        //     // Extend the original render method
        //     defaultType.view.prototype.render.apply(this, arguments);
        //     this.el.placeholder = 'Text here'; // <- Doesn't affect the final HTML code
        //     return this;
        // },
    },
});

/*
// The `input` will be the Component type ID
comps.addType('input', {
    // Define the Model
    model: defaultModel.extend({
            // Extend default properties
            defaults: Object.assign({}, defaultModel.prototype.defaults, {
                // Can be dropped only inside `form` elements
                // draggable: 'form, form *',
                draggable: true,
                // Can't drop other elements inside it
                droppable: false,
                // Traits (Settings)
                traits: ['name', 'placeholder', {
                    // Change the type of the input (text, password, email, etc.)
                    type: 'select',
                    label: 'Type',
                    name: 'type',
                    options: inputTypes,
                },{
                    // Can make it required for the form
                    type: 'checkbox',
                    label: 'Required',
                    name: 'required',
                }],
            }),
        },
        // The second argument of .extend are static methods and we'll put inside our
        // isComponent() method. As you're putting a new Component type on top of the stack,
        // not declaring isComponent() might probably break stuff, especially if you extend
        // the default one.
        {
            isComponent: function(el) {
                if(el.tagName == 'INPUT'){
                    return {type: 'input'};
                }
            },
        }),

    // Define the View
    view: defaultType.view.extend({
        // Bind events
        events: {
            // If you want to bind the event to children elements
            // 'click .someChildrenClass': 'methodName',
            click: 'handleClick',
            dblclick: 'handleDblClick'
        },

        // It doesn't make too much sense this method inside the component
        // but it's ok as an example
        randomHex: function() {
            return '#' + Math.floor(Math.random()*16777216).toString(16);
        },

        handleClick: function(e) {
            this.model.set('style', {color: this.randomHex()}); // <- Affects the final HTML code
            this.el.style.backgroundColor = this.randomHex(); // <- Doesn't affect the final HTML code
            // Tip: updating the model will reflect the changes to the view, so, in this case,
            // if you put the model change after the DOM one this will override the backgroundColor
            // change made before
        },

        handleDblClick: function(e) {
            alert('hi');
        },

        // The render() should return 'this'
        render: function () {
            // Extend the original render method
            defaultType.view.prototype.render.apply(this, arguments);
            this.el.placeholder = 'Text here'; // <- Doesn't affect the final HTML code
            return this;
        },
    }),
});
*/