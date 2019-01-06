const el = document.querySelector('#test');
// var editor = null;
InlineEditor
    .create( el, {
        // toolbar: [
        //     [ 'Bold' ]
        // ]
    })
    .then((e) => {
        console.log('success');
        // editor = e;
    })
    .catch( error => {
        console.error( error );
    } );


// var editor = null;
// el.contentEditable = true;
// CKEDITOR
//     .inline( el, {
//         // toolbar: [
//         //     [ 'Bold' ]
//         // ]
//     });