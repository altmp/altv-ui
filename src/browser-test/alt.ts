class Alt {
    _handlers: Map<string, Array<(...args: any[]) => void>> = new Map();
    _viewHandlers: Map<string, Array<(...args: any[]) => void>> = new Map();

    on(ev: string, cb: (...args: any[]) => void) {
        let handlers = this._handlers.get(ev);

        if (!handlers) {
            handlers = [];
            this._handlers.set(ev, handlers);
        }

        handlers.push(cb);
    }

    off(ev: string, cb: (...args: any[]) => void) {
        const handlers = this._handlers.get(ev);
        if (handlers) {
            const idx = handlers.indexOf(cb);
            if (idx !== -1) {
                handlers.splice(idx, 1);
            }
        }
    }

    emit(ev: string, ...args: any[]) {
        const handlers = this._viewHandlers.get(ev);
        if (handlers) {
            handlers.forEach(h => h(...args));
        }
    }

    viewOn(ev: string, cb: (...args: any[]) => void) {
        let handlers = this._viewHandlers.get(ev);

        if (!handlers) {
            handlers = [];
            this._viewHandlers.set(ev, handlers);
        }

        handlers.push(cb);
    }

    viewEmit(ev: string, ...args: any[]) {
        const handlers = this._handlers.get(ev);
        if (handlers) {
            handlers.forEach(h => h(...args));
        }
    }
}

export default new Alt();