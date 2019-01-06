const comps = editor.DomComponents;
const textType = comps.getType('text');

/*
comps.addType('text', {
    model: textType.model,
    view: textType.view.extend({
        events: {
            click: async function(e) {
                // debugger;

                this.onActive = async (e) => {
                    // We place this before stopPropagation in case of nested
                    // text components will not block the editing (#1394)
                    if (this.rteEnabled || !this.model.get('editable')) {
                        return;
                    }
                    // e && e.stopPropagation && e.stopPropagation();
                    const rte = this.rte;

                    if (rte) {
                        try {
                            this.activeRte = await rte.enable(this, this.activeRte);
                            console.log(this.activeRte);
                        } catch (err) {
                            console.error(err);
                        }
                    }

                    this.rteEnabled = 1;
                    this.toggleEvents(1);
                },


                console.log('clicked', e, this);
                await this.onActive(e);
                console.log('activated');
            },
        },
    }),
});
*/