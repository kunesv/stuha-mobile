/**
 * Based on solution by Andy Peatling, on https://github.com/apeatling/web-pull-to-refresh
 */

class PullToRefresh {

    constructor(content) {
        this.content = content;

        this.pan = {
            enabled: false,
            distance: 0
        };

        this.options = {
            resistance: 6,
            distanceToRefresh: 25
        };

        let hammer = new Hammer(document.body);

        hammer.get('pan').set({direction: Hammer.DIRECTION_VERTICAL});


        hammer.on('panstart', (e) => {
            this.panStart(e);
        });
        hammer.on('pandown', (e) => {
            this.panDown(e);
        });
        hammer.on('panup', (e) => {
            this.panUp(e);
        });
        hammer.on('panend', (e) => {
            this.panEnd(e);
        });
    }

    panStart(e) {
        if (window.scrollY <= 0) {
            this.pan.enabled = true;
        }
    }


    panDown(e) {
        if (!this.pan.enabled) {
            return;
        }

        e.preventDefault();
        this.pan.distance = e.distance / this.options.resistance;
        document.body.classList.add('panning');

        this.setContentPan();
        this.setBodyClass();
    }

    panUp(e) {
        if (!this.pan.enabled || this.pan.distance === 0) {
            return;
        }

        e.preventDefault();

        if (this.pan.distance < e.distance / this.options.resistance) {
            this.pan.distance = 0;
        } else {
            this.pan.distance = e.distance / this.options.resistance;
        }

        this.setContentPan();
        this.setBodyClass();
    }

    panEnd(e) {
        if (!this.pan.enabled) {
            return;
        }

        e.preventDefault();

        this.content.style.transform = '';

        if (document.body.classList.contains('to-be-refreshed')) {
            this.doLoading();
        } else {
            PullToRefresh.reset();
        }

        this.pan.distance = 0;
        this.pan.enabled = false;
    }

    setContentPan() {
        this.content.style.transform = 'translate3d( 0, ' + this.pan.distance + 'px, 0 )';
    }

    setBodyClass() {
        if (this.pan.distance > this.options.distanceToRefresh) {
            document.body.classList.add('to-be-refreshed');
        } else {
            document.body.classList.remove('to-be-refreshed');
        }
    }

    doLoading() {
        document.body.classList.add('loading');

        console.log('loading ...')

        MessagesLoadingService.loadLatest().then(() => {
            PullToRefresh.reset();
        });
    }

    static reset() {
        document.body.classList.remove('loading');
        document.body.classList.remove('to-be-refreshed');
        document.body.classList.add('resetting');

        document.body.addEventListener('transitionend', function handler() {
            document.body.classList.remove('resetting');
            document.body.classList.remove('panning');
            document.body.removeEventListener('transitionend', handler, false);
        }, false);
    }
}

try {
    const ptr = new PullToRefresh(document.querySelector('.content'));
} catch (error) {
    alert(error);
}
