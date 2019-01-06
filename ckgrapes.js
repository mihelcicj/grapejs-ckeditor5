// const stopPropagation = e => e.stopPropagation();

// grapesjs.plugins.add('gjs-plugin-ckeditor', (editor, opts = {}) => {
//     let c = opts;
//
//     let defaults = {
//         // CKEditor options
//         options: {},
//
//         // On which side of the element to position the toolbar
//         // Available options: 'left|center|right'
//         position: 'left',
//     };
//
//     // Load defaults
//     for (let name in defaults) {
//         if (!(name in c))
//             c[name] = defaults[name];
//     }
//
//     if (!InlineEditor) {
//         throw new Error('CKEDITOR instance not found');
//     }

    editor.setCustomRte({
        enable: async(el, rte) => {
            // debugger;
            // console.log('enable', el, rte);
            // If already exists I'll just focus on it
            if(rte) {
                el.contentEditable = true;
                // let rteToolbar = editor.RichTextEditor.getToolbarEl();
                // [].forEach.call(rteToolbar.children, (child) => {
                //     child.style.display = 'none';
                // });
                console.log('if rte 1 ', rte);
                // await rte.then( e => {
                //     window.test = e;
                //     console.log('InlineEditor 1', e);
                //     rte = e;
                //     // e.ui.view.toolbar.element.style.display = 'block';
                // });
                return rte;
            }

            // Seems like 'sharedspace' plugin doesn't work exactly as expected
            // so will help hiding other toolbars already created
            // let rteToolbar = editor.RichTextEditor.getToolbarEl();
            // [].forEach.call(rteToolbar.children, (child) => {
            //     child.style.display = 'none';
            // });

            // Init CkEditors
            console.dir(el);
            console.log('inlineEditorClass', InlineEditor);
            rte = await InlineEditor
                .create( el, {
                    language: 'en-au',
                    toolbar: [ 'bold', 'italic', 'link', 'bulletedList', 'numberedList']
                }).catch( error => {
                        console.error( error );
                    }
                );

            console.log('editor async initialized');

            if(rte){
                // // Prevent blur when some of CKEditor's element is clicked
                // rte.on('mousedown', e => {
                //     const editorEls = grapesjs.$('.gjs-rte-toolbar');
                //     ['off', 'on'].forEach(m => editorEls[m]('mousedown', stopPropagation));
                // });

                editor.RichTextEditor.getToolbarEl().appendChild( rte.ui.view.toolbar.element );
                el.contentEditable = true;
            }else{
                console.log( 'Editor was not initialized' );
            }

            return rte;
        },

        disable(el, rte) {
            el.contentEditable = false;
        }
    });

    // Update RTE toolbar position
    // editor.on('rteToolbarPosUpdate', (pos) => {
    //     // Update by position
    //     switch (c.position) {
    //         case 'center':
    //             let diff = (pos.elementWidth / 2) - (pos.targetWidth / 2);
    //             pos.left = pos.elementLeft + diff;
    //             break;
    //         case 'right':
    //             let width = pos.targetWidth;
    //             pos.left = pos.elementLeft + pos.elementWidth - width;
    //             break;
    //     }
    //
    //     if (pos.top <= pos.canvasTop) {
    //         pos.top = pos.elementTop + pos.elementHeight;
    //     }
    //
    //     // Check if not outside of the canvas
    //     if (pos.left < pos.canvasLeft) {
    //         pos.left = pos.canvasLeft;
    //     }
    // });
// });