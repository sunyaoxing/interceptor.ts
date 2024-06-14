import 'reflect-metadata'

export type AnyFunction = (...args: any[]) => any;


export const INTERCEPTORS = Symbol('INTERCEPTORS');

export interface Interceptor<T extends (...args: any[]) => any> {
    intercept(next: AnyFunction, ...args: Parameters<T>): ReturnType<T>
}

export function useInterceptors<T extends AnyFunction>(interceptors: Interceptor<T> []) {
    return (target: object, key:string, descriptor: TypedPropertyDescriptor<T>) => {
        let interceptorMap = Reflect.getMetadata(INTERCEPTORS, target);
        if (!interceptorMap) {
            interceptorMap = {};
            Reflect.defineMetadata(INTERCEPTORS, interceptorMap, target);
        }

        const filters: Interceptor<T>[] = interceptorMap[key];
        if (filters) {
            interceptors.forEach(interceptor => {
                filters.push(interceptor)
            });
        } else {
            interceptorMap[key] = interceptors;
        }

        const original: T = descriptor.value;
        descriptor.value = createInterceptorFuntion(target, key, original);
    
    }
}


export function createInterceptorFuntion<T extends AnyFunction>(target: object, key: string, original: T): T {
    let nextFunctions: T[] = [];
    return function (...args: Parameters<T>) {
        if (nextFunctions.length) return nextFunctions[0](...args);

        const self = this;
        let interceptors: Interceptor<T>[] = [];
        if (interceptors.length === 0) {
            const interceptorMap = Reflect.getMetadata(INTERCEPTORS, target);
            if (interceptorMap)
                interceptors = interceptorMap[key] || [];
        }

        //let index = 0;
        if (interceptors.length === 0)
            return original.apply(self, args);

        function invokeOriginal(...nextArgs: [] | Parameters<T>) {
            if (nextArgs.length === 0) nextArgs = args;
            return original.apply(self, nextArgs);
        }

        function next (index: number) {
            if (nextFunctions[index]) return nextFunctions[index];
            nextFunctions[index] = function (...nextArgs: Parameters<T>) {
                if (nextArgs.length === 0) nextArgs = args;
                const inteceptor = interceptors[index];
                if (index < interceptors.length - 1) {
                    if (!nextFunctions[index + 1]) nextFunctions[index + 1] = next(index + 1);
                    return inteceptor.intercept(nextFunctions[index + 1], ...nextArgs);
                } else {
                    return inteceptor.intercept(invokeOriginal, ...nextArgs);
                }
            } as T;
            return nextFunctions[index];
        };
        return next(0)(...args);
    } as T;
}