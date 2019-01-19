const stopPropagation = e => e.stopPropagation();
const editor = grapesjs.init({
    container: '#gjs',
    // fromElement: true,
    height: '600px',
    width: 'auto',
    storageManager: {type: null},
    panels: {defaults: []},
    autorender: false,
    canvas: {
        scripts: ['https://code.jquery.com/jquery-3.3.1.min.js'],
        styles: ['external.css']
    }
});

editor.DomComponents.getWrapper().set({badgable: false, selectable: false, highlightable: false})

// const defaultType = editor.DomComponents.getType('default');
// const _initialize = defaultType.model.prototype.initialize;
//
// defaultType.model.prototype.initialize = function() {
//     _initialize.apply(this, arguments);
//
//     console.log('default', this);
// };

// augmentParagraph(editor);
augmentText(editor);
defineDiv(editor);
// defineSpan(editor);
// defineRte(editor);
// rteTextNode(editor);
// rteText(editor);
// allTextNode(editor);
// allText(editor);
// allDefault(editor);
// extendText(editor);
// defineRTEText(editor);
// defineParagraph(editor);

const html = `
    <div data-rte>
        <p>Stray text</p>
    </div>
`.trim();

editor.setComponents(html);

function defineDiv(editor) {
    const comps = editor.DomComponents;

    comps.addType('div', {
        extend: 'text',
        extendView: 'text',
        isComponent: function(el) {
            if (el && el.tagName === 'DIV') {
                return {
                    type: 'text',
                    name: 'A DIV'
                }
            }
        }
    })
}

function augmentText(editor) {
    const comps = editor.DomComponents;
    const textComponent = comps.getType('text');
    const _initialize = textComponent.view.prototype.initialize;
    const _toHTML = textComponent.model.prototype.toHTML;

    comps.addType('text', {
        extend: 'text',
        extendView: 'text',
        isComponent: function(el) {
            if (el && el.hasAttribute && el.hasAttribute('data-rte')) {
                return {
                    type: 'text',
                    content: el.innerHTML,
                    components: []
                }
            }
        },
        model: {
            defaults: {
                name: 'A custom name',
                hoverable: true,
                highlightable: true,
            },
        },
        view: {
            initialize(o) {
                _initialize.call(this, o);

                console.log('INITIALIZED!', this, o);
                if (o.model.view.attr['data-rte'] != null) {
                    console.log('initialize with rte', o.model.get('components'));
                    const innerHTML = o.model.get('components').reduce((p, c) => {
                        return p += c.toHTML();
                    }, '');

                    console.log('innerHTML', innerHTML);
                    // Prevent disable event from firing
                    this.model.set('content', innerHTML, {fromDisable: 1});
                    this.model.set('components', [], {fromDisable: 1});
                    // this.model.attributes.content = this.el.innerHTML;
                    // this.model.attributes.components = [];
                    // this.model.components([]);
                }
            },
            onActive(e) {
                console.log('Event', e);
                // We place this before stopPropagation in case of nested
                // text components will not block the editing (#1394)
                if (this.rteEnabled || !this.model.get('editable')) {
                    return;
                }
                e && e.stopPropagation && e.stopPropagation();
                const rte = this.rte;

                if (rte) {
                    try {
                        // Since ckeditor5 returns a promise
                        // add a link to "this" in order to update
                        // the reference when the promise resolves
                        if (this.activeRte == null) {
                            this.activeRte = {
                                parent: this,
                                onActiveEvent: e,
                                initialized: false,
                            };
                        } else {
                            this.activeRte.onActiveEvent = e;
                        }
                        this.activeRte = rte.enable(this, this.activeRte);
                    } catch (err) {
                        console.error(err);
                    }
                }

                this.rteEnabled = 1;
                this.toggleEvents(1);
            },
            disableEditing() {
                const model = this.model;
                const editable = model.get('editable');
                const rte = this.rte;
                const contentOpt = {fromDisable: 1};

                if (rte && editable) {
                    try {
                        rte.disable(this, this.activeRte);
                    } catch (err) {
                        console.error(err);
                    }

                    const content = this.getChildrenContainer().innerHTML;
                    const comps = model.get('components');
                    comps.length && comps.reset();
                    model.set('content', '', contentOpt);

                    // If there is a custom RTE the content is just baked staticly
                    // inside 'content'
                    if (rte.customRte) {
                        // Avoid double content by removing its children components
                        // and force to trigger change

                        // This is a custom implementation for ckeditor5
                        this.model.addAttributes({'data-rte': 'true'});
                        const rteContent = this.activeRte.getData();
                        model.set('content', rteContent, contentOpt);
                        model.set('components', []);
                    } else {
                        const clean = model => {
                            const selectable = !['text', 'default', ''].some(type =>
                                model.is(type)
                            );
                            model.set({
                                editable: selectable && model.get('editable'),
                                highlightable: 0,
                                removable: 0,
                                draggable: 0,
                                copyable: 0,
                                selectable: selectable,
                                hoverable: selectable,
                                toolbar: ''
                            });
                            model.get('components').each(model => clean(model));
                        };

                        // Avoid re-render on reset with silent option
                        model.trigger('change:content', model, '', contentOpt);
                        comps.add(content);
                        comps.each(model => clean(model));
                        comps.trigger('resetNavigator');
                    }
                }

                this.rteEnabled = 0;
                this.toggleEvents();
            },
        }
    });
}

editor.setCustomRte({
    enable: function (el, rte) {
        console.log('✔️ RTE enable');

        if (rte.initialized !== false) {
            el.contentEditable = true;
            let rteToolbar = editor.RichTextEditor.getToolbarEl();
            [].forEach.call(rteToolbar.children, (child) => {
                child.style.display = 'none';
            });
            rte.ui.view.toolbar.element.style.display = 'block';
            el.focus();
            return rte;
        }

        // Seems like 'sharedspace' plugin doesn't work exactly as expected
        // so will help hiding other toolbars already created
        let rteToolbar = editor.RichTextEditor.getToolbarEl();
        [].forEach.call(rteToolbar.children, (child) => {
            child.style.display = 'none';
        });

        // Init Ckeditor5
        // Since the initialization is Async and a promise is returned,
        // we wrap the final part of the initialization inside a "then" block
        // and update the reference we got from "onActive"
        InlineEditor.create(el, {
            language: 'en-au',
            // toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList'],
        }).then(ckRte => {
            ckRte.on('mousedown', e => {
                const editorEls = editor.$('.gjs-rte-toolbar');
                ['off', 'on'].forEach(m => editorEls[m]('mousedown', stopPropagation));
            });
            editor.RichTextEditor.getToolbarEl().appendChild(ckRte.ui.view.toolbar.element);
            el.contentEditable = true;
            el.setAttribute('data-rte', 'true'); // Set so the styles can be applied
            rte.parent.activeRte = ckRte; // Update the reference
            el.focus();
            // el.dispatchEvent(new MouseEvent(rte.onActiveEvent.type, rte.onActiveEvent));
            console.log('Editor initialized Async', rte.onActiveEvent, el);
        }).catch(error => {
            console.error('Editor async was not initialized');
            console.error(error);
        });

        // Not sure if its better to return the custom object or null
        // return rte;
        return null;
    },

    disable(el, rte) {
        console.log('❌ RTE disabled', rte);
        el.contentEditable = false;
    }
});


editor.render();
// editor.setComponents(editor.getHtml());


editor.on('rteToolbarPosUpdate', (pos) => {
    // Update by position
    let diff = (pos.elementWidth / 2) - (pos.targetWidth / 2);
    pos.left = pos.elementLeft + diff;

    if (pos.top <= pos.canvasTop) {
        pos.top = pos.elementTop + pos.elementHeight;
    }

    // Check if not outside of the canvas
    if (pos.left < pos.canvasLeft) {
        pos.left = pos.canvasLeft;
    }
});
