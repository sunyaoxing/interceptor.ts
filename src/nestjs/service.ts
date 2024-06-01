
import { Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { INQUIRER, ModuleRef, Reflector } from '@nestjs/core';
import { AnyFunction, INTERCEPTORS, Interceptor, createInterceptorFuntion } from '../methodInterceptor';

const INTERCEPTOR_DEFS = Symbol('INTERCEPTOR_DEFS');

type InterceptorClass<T extends AnyFunction> = {
    new (...args: any[]): Interceptor<T>
}

@Injectable({ scope: Scope.TRANSIENT })
export class InterceptorLoader {
    constructor(
        @Inject(INQUIRER) private parentClass: object,
        @Inject(Reflector) private reflector: Reflector
    ) { }

    initInterceptors(moduleRef: ModuleRef) {
        if (!this.parentClass) return;
        const interceptorMap: any = {};
        let interceptorDefMap = Reflect.getMetadata(INTERCEPTOR_DEFS, this.parentClass);
        Object.keys(interceptorDefMap).forEach(key => {
            const interceptorClasses = interceptorDefMap[key];
            interceptorClasses.forEach((interceptorClass: any) => {
                const interceptor = moduleRef.get(interceptorClass);
                interceptorMap[key] = interceptorMap[key] || [];
                interceptorMap[key].push(interceptor);
            });
        });
        Reflect.defineMetadata(INTERCEPTORS, interceptorMap, this.parentClass.constructor.prototype)
    }
}

export function useInterceptors<T extends AnyFunction>(interceptors: InterceptorClass<T> []) {
    return (target: object, key:string, descriptor: TypedPropertyDescriptor<T>) => {
        // Add the interceptor class into the interceptorDef
        let interceptorDefMap = Reflect.getMetadata(INTERCEPTOR_DEFS, target);
        if (!interceptorDefMap) {
            interceptorDefMap = {};
            Reflect.defineMetadata(INTERCEPTOR_DEFS, interceptorDefMap, target);
        }

        const filters: InterceptorClass<T>[] = interceptorDefMap[key];
        if (filters) {
            interceptors.forEach(interceptor => {
                filters.push(interceptor)
            });
        } else {
            interceptorDefMap[key] = interceptors;
        }

        // Replace the original function
        const original: T = descriptor.value;
        descriptor.value = createInterceptorFuntion(target, key, original);
        
    }
}