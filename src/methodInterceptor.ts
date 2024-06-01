import 'reflect-metadata'

export type AnyFunction = (...args: any[]) => any;
export type NextHandler<T extends AnyFunction> = (() => ReturnType<T>) | T;


export const INTERCEPTORS = Symbol('INTERCEPTORS');

export interface Interceptor<T extends (...args: any[]) => any> {
    intercept(next: NextHandler<T>, ...args: Parameters<T>): ReturnType<T>
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
    return function (...args: Parameters<T>) {
        const self = this;
        let interceptors: Interceptor<T>[] = [];
        const interceptorMap = Reflect.getMetadata(INTERCEPTORS, target);
        if (interceptorMap)
            interceptors = interceptorMap[key] || [];

        //let index = 0;
        if (interceptors.length === 0)
            return original.apply(self, args);

        function next (index: number) {
            return function (...nextArgs: Parameters<T>) {
                if (nextArgs.length === 0) nextArgs = args;
                const inteceptor = interceptors[index];
                if (index < interceptors.length - 1)
                    return inteceptor.intercept(next(index + 1) as any, ...nextArgs);
                else {
                     function invokeOriginal(...nextArgs: [] | Parameters<T>) {
                        if (nextArgs.length === 0) nextArgs = args;
                        return original.apply(self, nextArgs);
                    }
                    return inteceptor.intercept(invokeOriginal, ...nextArgs);
                }
            }
        };
        return next(0)(...args);
    } as T;
}